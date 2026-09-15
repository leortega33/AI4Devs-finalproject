import { PrismaExerciseRepository } from './PrismaExerciseRepository';

function buildPrismaMock() {
  return {
    exercise: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  } as any;
}

const baseRecord = {
  id: 1,
  name: 'Back squat',
  muscleGroup: 'Legs',
  category: 'main',
  defaultSets: 4,
  defaultReps: 8,
  technique: null,
  equipment: 'Barbell',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const input = {
  name: 'Back squat',
  muscleGroup: 'Legs',
  category: 'main' as const,
};

describe('PrismaExerciseRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create an exercise and map it to the domain', async () => {
    const prisma = buildPrismaMock();
    prisma.exercise.create.mockResolvedValue(baseRecord);
    const repo = new PrismaExerciseRepository(prisma);

    const result = await repo.create(input);

    expect(result.name).toBe('Back squat');
    expect(result.category).toBe('main');
    expect(prisma.exercise.create).toHaveBeenCalledWith({ data: input });
  });

  it('should find an exercise by id', async () => {
    const prisma = buildPrismaMock();
    prisma.exercise.findUnique.mockResolvedValue(baseRecord);
    const repo = new PrismaExerciseRepository(prisma);

    const result = await repo.findById(1);

    expect(result?.id).toBe(1);
    expect(prisma.exercise.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should return null when an exercise is not found', async () => {
    const prisma = buildPrismaMock();
    prisma.exercise.findUnique.mockResolvedValue(null);
    const repo = new PrismaExerciseRepository(prisma);

    expect(await repo.findById(999)).toBeNull();
  });

  it('should build a case-insensitive name search with a category filter', async () => {
    const prisma = buildPrismaMock();
    prisma.exercise.findMany.mockResolvedValue([baseRecord]);
    const repo = new PrismaExerciseRepository(prisma);

    await repo.findAll({ search: 'squat', category: 'main' });

    expect(prisma.exercise.findMany).toHaveBeenCalledWith({
      where: {
        category: 'main',
        name: { contains: 'squat', mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
    });
  });

  it('should list all exercises when no filters are given', async () => {
    const prisma = buildPrismaMock();
    prisma.exercise.findMany.mockResolvedValue([baseRecord]);
    const repo = new PrismaExerciseRepository(prisma);

    const result = await repo.findAll({});

    expect(result).toHaveLength(1);
    expect(prisma.exercise.findMany).toHaveBeenCalledWith({ where: {}, orderBy: { name: 'asc' } });
  });

  it('should update an exercise', async () => {
    const prisma = buildPrismaMock();
    prisma.exercise.update.mockResolvedValue({ ...baseRecord, defaultReps: 10 });
    const repo = new PrismaExerciseRepository(prisma);

    const result = await repo.update(1, input);

    expect(result.defaultReps).toBe(10);
    expect(prisma.exercise.update).toHaveBeenCalledWith({ where: { id: 1 }, data: input });
  });
});
