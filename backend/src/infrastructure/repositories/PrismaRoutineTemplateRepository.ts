import { PrismaClient, Prisma } from '@prisma/client';
import { RoutineTemplate, RoutineStatus } from '../../domain/models/RoutineTemplate';
import { RoutineSession } from '../../domain/models/RoutineSession';
import { RoutineExerciseEntry, RoutinePhase } from '../../domain/models/RoutineExerciseEntry';
import { RoutineExerciseWeek } from '../../domain/models/RoutineExerciseWeek';
import { RegionCode } from '../../domain/models/bodyRegions';
import { ExerciseCategory } from '../../domain/models/Exercise';
import {
  RoutineTemplateRepository,
  RoutineTemplateInput,
  RoutineTemplateSummary,
  RoutineSessionInput,
} from '../../domain/repositories/RoutineTemplateRepository';

const nestedInclude = {
  sessions: {
    orderBy: { order: 'asc' as const },
    include: {
      entries: {
        orderBy: { order: 'asc' as const },
        include: {
          exercise: { select: { name: true, videoUrl: true, bodyRegions: true, category: true } },
          weeks: { orderBy: { week: 'asc' as const } },
        },
      },
    },
  },
} satisfies Prisma.RoutineTemplateInclude;

type TemplateRecord = Prisma.RoutineTemplateGetPayload<{ include: typeof nestedInclude }>;

function toDomain(record: TemplateRecord): RoutineTemplate {
  return new RoutineTemplate({
    id: record.id,
    name: record.name,
    description: record.description,
    objective: record.objective,
    generalConsiderations: record.generalConsiderations,
    clientId: record.clientId,
    sourceTemplateId: record.sourceTemplateId,
    startDate: record.startDate,
    durationWeeks: record.durationWeeks,
    status: record.status as RoutineStatus,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    sessions: record.sessions.map(
      (s) =>
        new RoutineSession({
          id: s.id,
          name: s.name,
          warmupPrescription: s.warmupPrescription,
          order: s.order,
          entries: s.entries.map(
            (e) =>
              new RoutineExerciseEntry({
                id: e.id,
                exerciseId: e.exerciseId,
                exerciseName: e.exercise.name,
                exerciseVideoUrl: e.exercise.videoUrl,
                exerciseBodyRegions: e.exercise.bodyRegions as RegionCode[],
                exerciseCategory: e.exercise.category as ExerciseCategory,
                phase: e.phase as RoutinePhase,
                block: e.block,
                kg: e.kg,
                reps: e.reps,
                series: e.series,
                notes: e.notes,
                order: e.order,
                weeks: e.weeks.map(
                  (w) =>
                    new RoutineExerciseWeek({
                      id: w.id,
                      week: w.week,
                      kg: w.kg,
                      reps: w.reps,
                      series: w.series,
                    }),
                ),
              }),
          ),
        }),
    ),
  });
}

/** Prisma nested-create shape for a template's sessions and entries. */
function sessionsCreate(sessions: RoutineSessionInput[]): Prisma.RoutineSessionCreateNestedManyWithoutRoutineTemplateInput {
  return {
    create: sessions.map((s) => ({
      name: s.name,
      warmupPrescription: s.warmupPrescription ?? null,
      order: s.order,
      entries: {
        create: s.entries.map((e) => ({
          exerciseId: e.exerciseId,
          phase: e.phase,
          block: e.block ?? null,
          kg: e.kg ?? null,
          reps: e.reps ?? null,
          series: e.series ?? null,
          notes: e.notes ?? null,
          order: e.order,
          weeks: {
            create: (e.weeks ?? []).map((w) => ({
              week: w.week,
              kg: w.kg ?? null,
              reps: w.reps ?? null,
              series: w.series ?? null,
            })),
          },
        })),
      },
    })),
  };
}

/** Maps a loaded template's nested sessions back to input shape (for duplicate/assign), preserving weeks. */
function sourceSessionsToInput(sessions: TemplateRecord['sessions']): RoutineSessionInput[] {
  return sessions.map((s) => ({
    name: s.name,
    warmupPrescription: s.warmupPrescription,
    order: s.order,
    entries: s.entries.map((e) => ({
      exerciseId: e.exerciseId,
      phase: e.phase as RoutinePhase,
      block: e.block,
      kg: e.kg,
      reps: e.reps,
      series: e.series,
      notes: e.notes,
      order: e.order,
      weeks: e.weeks.map((w) => ({ week: w.week, kg: w.kg, reps: w.reps, series: w.series })),
    })),
  }));
}

export class PrismaRoutineTemplateRepository implements RoutineTemplateRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: RoutineTemplateInput): Promise<RoutineTemplate> {
    const record = await this.prisma.routineTemplate.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        objective: data.objective ?? null,
        generalConsiderations: data.generalConsiderations ?? null,
        sessions: sessionsCreate(data.sessions),
      },
      include: nestedInclude,
    });
    return toDomain(record);
  }

  async findById(id: number): Promise<RoutineTemplate | null> {
    const record = await this.prisma.routineTemplate.findUnique({
      where: { id },
      include: nestedInclude,
    });
    return record ? toDomain(record) : null;
  }

  async findAllLibrary(): Promise<RoutineTemplateSummary[]> {
    const records = await this.prisma.routineTemplate.findMany({
      where: { clientId: null },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        objective: true,
        status: true,
        _count: { select: { sessions: true } },
      },
    });
    return records.map((r) => ({
      id: r.id,
      name: r.name,
      objective: r.objective,
      status: r.status as RoutineStatus,
      sessionCount: r._count.sessions,
    }));
  }

  async replaceNested(id: number, data: RoutineTemplateInput): Promise<RoutineTemplate> {
    const record = await this.prisma.$transaction(async (tx) => {
      // Full replace: drop existing sessions (cascade removes entries), then recreate.
      await tx.routineSession.deleteMany({ where: { routineTemplateId: id } });
      return tx.routineTemplate.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description ?? null,
          objective: data.objective ?? null,
          generalConsiderations: data.generalConsiderations ?? null,
          sessions: sessionsCreate(data.sessions),
        },
        include: nestedInclude,
      });
    });
    return toDomain(record);
  }

  async duplicate(id: number): Promise<RoutineTemplate | null> {
    const source = await this.prisma.routineTemplate.findUnique({
      where: { id },
      include: nestedInclude,
    });
    if (!source) {
      return null;
    }
    const record = await this.prisma.routineTemplate.create({
      data: {
        name: `${source.name} (copia)`,
        description: source.description,
        objective: source.objective,
        generalConsiderations: source.generalConsiderations,
        sessions: sessionsCreate(sourceSessionsToInput(source.sessions)),
      },
      include: nestedInclude,
    });
    return toDomain(record);
  }

  async assignCloneToClient(
    clientId: number,
    templateId: number,
    startDate: Date,
    durationWeeks: number,
  ): Promise<RoutineTemplate | null> {
    const source = await this.prisma.routineTemplate.findUnique({
      where: { id: templateId },
      include: nestedInclude,
    });
    if (!source) {
      return null;
    }
    const record = await this.prisma.$transaction(async (tx) => {
      // Enforce a single active routine per client: close the previous one.
      await tx.routineTemplate.updateMany({
        where: { clientId, status: 'active' },
        data: { status: 'expired' },
      });
      return tx.routineTemplate.create({
        data: {
          name: source.name,
          description: source.description,
          objective: source.objective,
          generalConsiderations: source.generalConsiderations,
          clientId,
          sourceTemplateId: templateId,
          startDate,
          durationWeeks,
          status: 'active',
          sessions: sessionsCreate(sourceSessionsToInput(source.sessions)),
        },
        include: nestedInclude,
      });
    });
    return toDomain(record);
  }

  async findActiveByClient(clientId: number): Promise<RoutineTemplate | null> {
    const record = await this.prisma.routineTemplate.findFirst({
      where: { clientId, status: 'active' },
      include: nestedInclude,
    });
    return record ? toDomain(record) : null;
  }

  async findHistoryByClient(clientId: number): Promise<RoutineTemplateSummary[]> {
    const records = await this.prisma.routineTemplate.findMany({
      where: { clientId, status: { not: 'active' } },
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        name: true,
        objective: true,
        status: true,
        _count: { select: { sessions: true } },
      },
    });
    return records.map((r) => ({
      id: r.id,
      name: r.name,
      objective: r.objective,
      status: r.status as RoutineStatus,
      sessionCount: r._count.sessions,
    }));
  }
}
