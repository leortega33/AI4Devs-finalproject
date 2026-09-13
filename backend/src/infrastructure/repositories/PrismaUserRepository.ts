import { PrismaClient } from '@prisma/client';
import { User } from '../../domain/models/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

function toDomain(record: {
  id: number;
  email: string;
  passwordHash: string;
  passwordResetTokenHash: string | null;
  passwordResetExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return new User(record);
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? toDomain(record) : null;
  }

  async findById(id: number): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async updatePasswordHash(id: number, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash, passwordResetTokenHash: null, passwordResetExpiresAt: null },
    });
  }

  async setPasswordResetToken(id: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt },
    });
  }

  async findByValidResetTokenHash(tokenHash: string, now: Date): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { gt: now },
      },
    });
    return record ? toDomain(record) : null;
  }

  async clearPasswordResetToken(id: number): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordResetTokenHash: null, passwordResetExpiresAt: null },
    });
  }
}
