import { PrismaRoutineTemplateRepository } from './PrismaRoutineTemplateRepository';

function buildPrismaMock() {
  return {
    routineTemplate: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    routineSession: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;
}

const nestedRecord = {
  id: 1,
  name: 'Hipertrofia',
  description: null,
  objective: 'Hipertrofia',
  generalConsiderations: null,
  clientId: null,
  sourceTemplateId: null,
  startDate: null,
  durationWeeks: null,
  status: 'draft',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  sessions: [
    {
      id: 10,
      name: 'Sesión A',
      warmupPrescription: '2 vueltas',
      order: 0,
      entries: [
        {
          id: 100,
          exerciseId: 7,
          phase: 'main',
          block: 'Bloque 1',
          kg: 60,
          reps: 8,
          series: 4,
          notes: null,
          order: 0,
          exercise: { name: 'Sentadilla' },
        },
      ],
    },
  ],
};

const input = {
  name: 'Hipertrofia',
  sessions: [
    {
      name: 'Sesión A',
      warmupPrescription: '2 vueltas',
      order: 0,
      entries: [{ exerciseId: 7, phase: 'main' as const, block: 'Bloque 1', kg: 60, reps: 8, series: 4, order: 0 }],
    },
  ],
};

describe('PrismaRoutineTemplateRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create a template with nested sessions and entries and map it to the domain', async () => {
    const prisma = buildPrismaMock();
    prisma.routineTemplate.create.mockResolvedValue(nestedRecord);
    const repo = new PrismaRoutineTemplateRepository(prisma);

    const result = await repo.create(input);

    expect(result.name).toBe('Hipertrofia');
    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0].entries[0].exerciseName).toBe('Sentadilla');
    expect(result.sessions[0].entries[0].kg).toBe(60);
  });

  it('should find a template by id with nested detail', async () => {
    const prisma = buildPrismaMock();
    prisma.routineTemplate.findUnique.mockResolvedValue(nestedRecord);
    const repo = new PrismaRoutineTemplateRepository(prisma);

    const result = await repo.findById(1);

    expect(result?.id).toBe(1);
    expect(result?.sessions[0].name).toBe('Sesión A');
  });

  it('should return null when a template is not found', async () => {
    const prisma = buildPrismaMock();
    prisma.routineTemplate.findUnique.mockResolvedValue(null);
    const repo = new PrismaRoutineTemplateRepository(prisma);

    expect(await repo.findById(999)).toBeNull();
  });

  it('should list only library templates with a session count', async () => {
    const prisma = buildPrismaMock();
    prisma.routineTemplate.findMany.mockResolvedValue([
      { id: 1, name: 'Hipertrofia', objective: 'Hipertrofia', status: 'draft', _count: { sessions: 3 } },
    ]);
    const repo = new PrismaRoutineTemplateRepository(prisma);

    const result = await repo.findAllLibrary();

    expect(result[0].sessionCount).toBe(3);
    expect(prisma.routineTemplate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clientId: null } }),
    );
  });

  it('should replace nested data in a transaction on update', async () => {
    const prisma = buildPrismaMock();
    const tx = {
      routineSession: { deleteMany: jest.fn() },
      routineTemplate: { update: jest.fn().mockResolvedValue(nestedRecord) },
    };
    prisma.$transaction.mockImplementation(async (fn: any) => fn(tx));
    const repo = new PrismaRoutineTemplateRepository(prisma);

    const result = await repo.replaceNested(1, input);

    expect(tx.routineSession.deleteMany).toHaveBeenCalledWith({ where: { routineTemplateId: 1 } });
    expect(tx.routineTemplate.update).toHaveBeenCalled();
    expect(result.name).toBe('Hipertrofia');
  });

  it('should deep-copy the source on duplicate with a "(copia)" name', async () => {
    const prisma = buildPrismaMock();
    prisma.routineTemplate.findUnique.mockResolvedValue(nestedRecord);
    prisma.routineTemplate.create.mockResolvedValue({ ...nestedRecord, id: 2, name: 'Hipertrofia (copia)' });
    const repo = new PrismaRoutineTemplateRepository(prisma);

    const result = await repo.duplicate(1);

    expect(result?.id).toBe(2);
    expect(result?.name).toBe('Hipertrofia (copia)');
    const createArg = prisma.routineTemplate.create.mock.calls[0][0];
    expect(createArg.data.name).toBe('Hipertrofia (copia)');
    expect(createArg.data.sessions.create[0].entries.create[0].exerciseId).toBe(7);
  });

  it('should return null when duplicating a non-existent template', async () => {
    const prisma = buildPrismaMock();
    prisma.routineTemplate.findUnique.mockResolvedValue(null);
    const repo = new PrismaRoutineTemplateRepository(prisma);

    expect(await repo.duplicate(999)).toBeNull();
  });
});
