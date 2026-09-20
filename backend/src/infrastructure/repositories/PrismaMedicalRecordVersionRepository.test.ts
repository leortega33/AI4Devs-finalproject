import { PrismaMedicalRecordVersionRepository } from './PrismaMedicalRecordVersionRepository';

function buildPrismaMock() {
  return {
    medicalRecordVersion: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  } as any;
}

const baseVersion = {
  id: 1,
  clientId: 10,
  preexistingConditions: 'Asthma',
  injuries: null,
  surgeriesOrProsthetics: null,
  physicalRestrictions: null,
  medication: null,
  allergies: null,
  bloodType: 'O+',
  notes: null,
  createdAt: new Date('2026-01-01'),
};

describe('PrismaMedicalRecordVersionRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create a version snapshot for the client', async () => {
    const prisma = buildPrismaMock();
    prisma.medicalRecordVersion.create.mockResolvedValue(baseVersion);
    const repo = new PrismaMedicalRecordVersionRepository(prisma);

    const snapshot = { preexistingConditions: 'Asthma', bloodType: 'O+' };
    const result = await repo.create(10, snapshot);

    expect(result.clientId).toBe(10);
    expect(result.bloodType).toBe('O+');
    expect(prisma.medicalRecordVersion.create).toHaveBeenCalledWith({
      data: { clientId: 10, ...snapshot },
    });
  });

  it('should list versions for a client newest first', async () => {
    const prisma = buildPrismaMock();
    prisma.medicalRecordVersion.findMany.mockResolvedValue([baseVersion]);
    const repo = new PrismaMedicalRecordVersionRepository(prisma);

    const result = await repo.listByClientId(10);

    expect(result).toHaveLength(1);
    expect(result[0].clientId).toBe(10);
    expect(prisma.medicalRecordVersion.findMany).toHaveBeenCalledWith({
      where: { clientId: 10 },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return an empty list when the client has no versions', async () => {
    const prisma = buildPrismaMock();
    prisma.medicalRecordVersion.findMany.mockResolvedValue([]);
    const repo = new PrismaMedicalRecordVersionRepository(prisma);

    expect(await repo.listByClientId(999)).toEqual([]);
  });
});
