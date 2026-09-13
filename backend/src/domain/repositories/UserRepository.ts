import { User } from '../models/User';

/** Data access contract for the single admin User (see docs/backend-standards.md). */
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  updatePasswordHash(id: number, passwordHash: string): Promise<void>;
  setPasswordResetToken(id: number, tokenHash: string, expiresAt: Date): Promise<void>;
  findByValidResetTokenHash(tokenHash: string, now: Date): Promise<User | null>;
  clearPasswordResetToken(id: number): Promise<void>;
}
