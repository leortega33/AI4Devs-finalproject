import { PrismaUserRepository } from './PrismaUserRepository';

function buildPrismaMock() {
  return {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  } as any;
}

describe('PrismaUserRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseRecord = {
    id: 1,
    email: 'admin@example.com',
    passwordHash: 'hashed',
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  it('should return a User when findByEmail finds a record', async () => {
    const prisma = buildPrismaMock();
    prisma.user.findUnique.mockResolvedValue(baseRecord);
    const repository = new PrismaUserRepository(prisma);

    const result = await repository.findByEmail('admin@example.com');

    expect(result?.email).toBe('admin@example.com');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'admin@example.com' } });
  });

  it('should return null when findByEmail finds no record', async () => {
    const prisma = buildPrismaMock();
    prisma.user.findUnique.mockResolvedValue(null);
    const repository = new PrismaUserRepository(prisma);

    const result = await repository.findByEmail('unknown@example.com');

    expect(result).toBeNull();
  });

  it('should update the password hash and clear reset token data', async () => {
    const prisma = buildPrismaMock();
    const repository = new PrismaUserRepository(prisma);

    await repository.updatePasswordHash(1, 'new-hash');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { passwordHash: 'new-hash', passwordResetTokenHash: null, passwordResetExpiresAt: null },
    });
  });

  it('should find a user by a valid, unexpired reset token hash', async () => {
    const prisma = buildPrismaMock();
    prisma.user.findFirst.mockResolvedValue(baseRecord);
    const repository = new PrismaUserRepository(prisma);
    const now = new Date('2026-01-01T00:00:00Z');

    const result = await repository.findByValidResetTokenHash('token-hash', now);

    expect(result).not.toBeNull();
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { passwordResetTokenHash: 'token-hash', passwordResetExpiresAt: { gt: now } },
    });
  });

  it('should return null when no user matches a valid reset token hash', async () => {
    const prisma = buildPrismaMock();
    prisma.user.findFirst.mockResolvedValue(null);
    const repository = new PrismaUserRepository(prisma);

    const result = await repository.findByValidResetTokenHash('token-hash', new Date());

    expect(result).toBeNull();
  });

  it('should return a User when findById finds a record', async () => {
    const prisma = buildPrismaMock();
    prisma.user.findUnique.mockResolvedValue(baseRecord);
    const repository = new PrismaUserRepository(prisma);

    const result = await repository.findById(1);

    expect(result?.id).toBe(1);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should return null when findById finds no record', async () => {
    const prisma = buildPrismaMock();
    prisma.user.findUnique.mockResolvedValue(null);
    const repository = new PrismaUserRepository(prisma);

    const result = await repository.findById(999);

    expect(result).toBeNull();
  });

  it('should store the reset token hash and expiration', async () => {
    const prisma = buildPrismaMock();
    const repository = new PrismaUserRepository(prisma);
    const expiresAt = new Date('2026-01-01T01:00:00Z');

    await repository.setPasswordResetToken(1, 'token-hash', expiresAt);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { passwordResetTokenHash: 'token-hash', passwordResetExpiresAt: expiresAt },
    });
  });

  it('should clear the reset token data', async () => {
    const prisma = buildPrismaMock();
    const repository = new PrismaUserRepository(prisma);

    await repository.clearPasswordResetToken(1);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { passwordResetTokenHash: null, passwordResetExpiresAt: null },
    });
  });
});
