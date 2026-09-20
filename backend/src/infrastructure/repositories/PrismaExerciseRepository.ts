import { PrismaClient, Prisma } from '@prisma/client';
import { Exercise, ExerciseCategory } from '../../domain/models/Exercise';
import { RegionCode } from '../../domain/models/bodyRegions';
import {
  ExerciseRepository,
  ExerciseInput,
  ExerciseListFilters,
} from '../../domain/repositories/ExerciseRepository';

type ExerciseRecord = Prisma.ExerciseGetPayload<Record<string, never>>;

function toDomain(record: ExerciseRecord): Exercise {
  return new Exercise({
    ...record,
    category: record.category as ExerciseCategory,
    bodyRegions: record.bodyRegions as RegionCode[],
  });
}

export class PrismaExerciseRepository implements ExerciseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: ExerciseInput): Promise<Exercise> {
    const record = await this.prisma.exercise.create({ data });
    return toDomain(record);
  }

  async findById(id: number): Promise<Exercise | null> {
    const record = await this.prisma.exercise.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async findAll(filters: ExerciseListFilters): Promise<Exercise[]> {
    const where: Prisma.ExerciseWhereInput = {};
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }
    const records = await this.prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return records.map(toDomain);
  }

  async update(id: number, data: ExerciseInput): Promise<Exercise> {
    const record = await this.prisma.exercise.update({ where: { id }, data });
    return toDomain(record);
  }
}
