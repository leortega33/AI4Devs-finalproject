import { PrismaProgressPhotoRepository } from './PrismaProgressPhotoRepository';

function buildPrismaMock() {
  return {
    progressPhoto: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  } as any;
}

const baseRecord = {
  id: 1,
  progressEntryId: 7,
  storageKey: 'abc.webp',
  contentType: 'image/webp',
  createdAt: new Date('2026-09-21T10:00:00.000Z'),
};

describe('PrismaProgressPhotoRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create a photo for the entry', async () => {
    const prisma = buildPrismaMock();
    prisma.progressPhoto.create.mockResolvedValue(baseRecord);
    const repo = new PrismaProgressPhotoRepository(prisma);

    const result = await repo.create(7, { storageKey: 'abc.webp', contentType: 'image/webp' });

    expect(result.progressEntryId).toBe(7);
    expect(prisma.progressPhoto.create).toHaveBeenCalledWith({
      data: { progressEntryId: 7, storageKey: 'abc.webp', contentType: 'image/webp' },
    });
  });

  it('should list photos for an entry oldest first', async () => {
    const prisma = buildPrismaMock();
    prisma.progressPhoto.findMany.mockResolvedValue([baseRecord]);
    const repo = new PrismaProgressPhotoRepository(prisma);

    const result = await repo.listByEntryId(7);

    expect(result).toHaveLength(1);
    expect(prisma.progressPhoto.findMany).toHaveBeenCalledWith({
      where: { progressEntryId: 7 },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('should list photos for many entries', async () => {
    const prisma = buildPrismaMock();
    prisma.progressPhoto.findMany.mockResolvedValue([baseRecord]);
    const repo = new PrismaProgressPhotoRepository(prisma);

    const result = await repo.listByEntryIds([7, 8]);

    expect(result).toHaveLength(1);
    expect(prisma.progressPhoto.findMany).toHaveBeenCalledWith({
      where: { progressEntryId: { in: [7, 8] } },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('should return an empty list without querying for no entry ids', async () => {
    const prisma = buildPrismaMock();
    const repo = new PrismaProgressPhotoRepository(prisma);

    expect(await repo.listByEntryIds([])).toEqual([]);
    expect(prisma.progressPhoto.findMany).not.toHaveBeenCalled();
  });

  it('should find a photo by id', async () => {
    const prisma = buildPrismaMock();
    prisma.progressPhoto.findUnique.mockResolvedValue(baseRecord);
    const repo = new PrismaProgressPhotoRepository(prisma);

    expect((await repo.findById(1))?.id).toBe(1);
    expect(prisma.progressPhoto.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should return null when a photo is not found', async () => {
    const prisma = buildPrismaMock();
    prisma.progressPhoto.findUnique.mockResolvedValue(null);
    const repo = new PrismaProgressPhotoRepository(prisma);

    expect(await repo.findById(999)).toBeNull();
  });

  it('should delete a photo', async () => {
    const prisma = buildPrismaMock();
    prisma.progressPhoto.delete.mockResolvedValue(baseRecord);
    const repo = new PrismaProgressPhotoRepository(prisma);

    await repo.delete(1);

    expect(prisma.progressPhoto.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
