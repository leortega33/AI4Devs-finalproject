import { PrismaNutritionPlanRepository } from './PrismaNutritionPlanRepository';

function buildPrismaMock() {
  const tx = {
    nutritionPlan: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    nutritionMeal: { deleteMany: jest.fn() },
    nutritionPlanVersion: { create: jest.fn() },
  };
  const prisma = {
    nutritionPlan: { findUnique: jest.fn() },
    nutritionPlanVersion: { findMany: jest.fn() },
    $transaction: jest.fn(async (cb: (t: typeof tx) => unknown) => cb(tx)),
  } as any;
  return { prisma, tx };
}

const planRecord = {
  id: 1,
  clientId: 10,
  dailyCalories: 2200,
  proteinTargetG: 150,
  generalNotes: 'Agua',
  createdAt: new Date('2026-09-21T10:00:00.000Z'),
  updatedAt: new Date('2026-09-21T10:00:00.000Z'),
  meals: [
    {
      id: 5,
      name: 'Desayuno',
      note: null,
      order: 0,
      items: [{ id: 9, description: 'Avena', quantity: '80 g', order: 0 }],
    },
  ],
};

const input = {
  dailyCalories: 2200,
  proteinTargetG: 150,
  generalNotes: 'Agua',
  meals: [{ name: 'Desayuno', note: null, items: [{ description: 'Avena', quantity: '80 g' }] }],
};

describe('PrismaNutritionPlanRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('finds a plan by client id with ordered meals and items', async () => {
    const { prisma } = buildPrismaMock();
    prisma.nutritionPlan.findUnique.mockResolvedValue(planRecord);
    const repo = new PrismaNutritionPlanRepository(prisma);

    const result = await repo.findByClientId(10);

    expect(result?.meals[0].items[0].description).toBe('Avena');
    expect(prisma.nutritionPlan.findUnique).toHaveBeenCalledWith({
      where: { clientId: 10 },
      include: expect.any(Object),
    });
  });

  it('returns null when the client has no plan', async () => {
    const { prisma } = buildPrismaMock();
    prisma.nutritionPlan.findUnique.mockResolvedValue(null);
    const repo = new PrismaNutritionPlanRepository(prisma);

    expect(await repo.findByClientId(10)).toBeNull();
  });

  it('creates a plan and appends a version on first upsert', async () => {
    const { prisma, tx } = buildPrismaMock();
    tx.nutritionPlan.findUnique.mockResolvedValue(null);
    tx.nutritionPlan.findUniqueOrThrow.mockResolvedValue(planRecord);
    const repo = new PrismaNutritionPlanRepository(prisma);

    const result = await repo.upsert(10, input);

    expect(tx.nutritionPlan.create).toHaveBeenCalled();
    expect(tx.nutritionMeal.deleteMany).not.toHaveBeenCalled();
    expect(tx.nutritionPlanVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ clientId: 10 }) }),
    );
    expect(result.meals[0].name).toBe('Desayuno');
  });

  it('replaces meals and appends a version when a plan exists', async () => {
    const { prisma, tx } = buildPrismaMock();
    tx.nutritionPlan.findUnique.mockResolvedValue({ id: 1 });
    tx.nutritionPlan.findUniqueOrThrow.mockResolvedValue(planRecord);
    const repo = new PrismaNutritionPlanRepository(prisma);

    await repo.upsert(10, input);

    expect(tx.nutritionMeal.deleteMany).toHaveBeenCalledWith({ where: { nutritionPlanId: 1 } });
    expect(tx.nutritionPlan.update).toHaveBeenCalled();
    expect(tx.nutritionPlan.create).not.toHaveBeenCalled();
    expect(tx.nutritionPlanVersion.create).toHaveBeenCalled();
  });

  it('derives meal and item order from array position in the snapshot', async () => {
    const { prisma, tx } = buildPrismaMock();
    tx.nutritionPlan.findUnique.mockResolvedValue(null);
    tx.nutritionPlan.findUniqueOrThrow.mockResolvedValue(planRecord);
    const repo = new PrismaNutritionPlanRepository(prisma);

    await repo.upsert(10, {
      meals: [
        { name: 'A', items: [{ description: 'x' }, { description: 'y' }] },
        { name: 'B', items: [] },
      ],
    });

    const snapshot = tx.nutritionPlanVersion.create.mock.calls[0][0].data.snapshot;
    expect(snapshot.meals[0].order).toBe(0);
    expect(snapshot.meals[1].order).toBe(1);
    expect(snapshot.meals[0].items[1].order).toBe(1);
  });

  it('lists versions newest first', async () => {
    const { prisma } = buildPrismaMock();
    prisma.nutritionPlanVersion.findMany.mockResolvedValue([
      { id: 2, snapshot: {}, createdAt: new Date('2026-09-21T11:00:00.000Z') },
      { id: 1, snapshot: {}, createdAt: new Date('2026-09-21T10:00:00.000Z') },
    ]);
    const repo = new PrismaNutritionPlanRepository(prisma);

    const versions = await repo.listVersionsByClientId(10);

    expect(versions[0].id).toBe(2);
    expect(prisma.nutritionPlanVersion.findMany).toHaveBeenCalledWith({
      where: { clientId: 10 },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  });
});
