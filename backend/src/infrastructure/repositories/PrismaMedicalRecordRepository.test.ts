import { PrismaMedicalRecordRepository } from './PrismaMedicalRecordRepository';

function buildPrismaMock() {
  return {
    medicalRecord: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  } as any;
}

const baseRecord = {
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
  updatedAt: new Date('2026-01-01'),
};

describe('PrismaMedicalRecordRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should find a record by client id and map it to the domain', async () => {
    const prisma = buildPrismaMock();
    prisma.medicalRecord.findUnique.mockResolvedValue(baseRecord);
    const repo = new PrismaMedicalRecordRepository(prisma);

    const result = await repo.findByClientId(10);

    expect(result?.clientId).toBe(10);
    expect(result?.preexistingConditions).toBe('Asthma');
    expect(prisma.medicalRecord.findUnique).toHaveBeenCalledWith({ where: { clientId: 10 } });
  });

  it('should return null when no record exists for the client', async () => {
    const prisma = buildPrismaMock();
    prisma.medicalRecord.findUnique.mockResolvedValue(null);
    const repo = new PrismaMedicalRecordRepository(prisma);

    expect(await repo.findByClientId(999)).toBeNull();
  });

  it('should upsert a record (create when none exists, update otherwise)', async () => {
    const prisma = buildPrismaMock();
    prisma.medicalRecord.upsert.mockResolvedValue(baseRecord);
    const repo = new PrismaMedicalRecordRepository(prisma);

    const data = { preexistingConditions: 'Asthma', bloodType: 'O+' };
    const result = await repo.upsert(10, data);

    expect(result.bloodType).toBe('O+');
    expect(prisma.medicalRecord.upsert).toHaveBeenCalledWith({
      where: { clientId: 10 },
      create: { clientId: 10, ...data },
      update: data,
    });
  });
});
