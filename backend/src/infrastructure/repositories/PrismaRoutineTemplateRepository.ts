import { PrismaClient, Prisma } from '@prisma/client';
import { RoutineTemplate, RoutineStatus } from '../../domain/models/RoutineTemplate';
import { RoutineSession } from '../../domain/models/RoutineSession';
import { RoutineExerciseEntry, RoutinePhase } from '../../domain/models/RoutineExerciseEntry';
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
        include: { exercise: { select: { name: true } } },
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
                phase: e.phase as RoutinePhase,
                block: e.block,
                kg: e.kg,
                reps: e.reps,
                series: e.series,
                notes: e.notes,
                order: e.order,
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
        })),
      },
    })),
  };
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
        sessions: sessionsCreate(
          source.sessions.map((s) => ({
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
            })),
          })),
        ),
      },
      include: nestedInclude,
    });
    return toDomain(record);
  }
}
