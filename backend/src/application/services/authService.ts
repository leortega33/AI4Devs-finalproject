import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { EmailService } from '../../infrastructure/email/emailService';
import { logger } from '../../infrastructure/logger';

const BCRYPT_COST = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class InvalidResetTokenError extends Error {
  constructor() {
    super('Invalid or expired reset token');
    this.name = 'InvalidResetTokenError';
  }
}

export interface AuthenticatedUser {
  id: number;
  email: string;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Business logic for admin login, session issuance, and password recovery (see US-001). */
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly jwtSecret: string,
    private readonly resetUrlBase: string,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ user: AuthenticatedUser; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const token = jwt.sign({ sub: user.id }, this.jwtSecret, { expiresIn: '30d' });
    logger.info('Admin login succeeded', { userId: user.id });
    return { user: { id: user.id!, email: user.email }, token };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Same response regardless of match - never reveal whether the account exists.
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.userRepository.setPasswordResetToken(user.id!, tokenHash, expiresAt);

    const resetUrl = `${this.resetUrlBase}?token=${rawToken}`;
    await this.emailService.sendPasswordResetEmail(user.email, resetUrl);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);
    const user = await this.userRepository.findByValidResetTokenHash(tokenHash, new Date());
    if (!user) {
      throw new InvalidResetTokenError();
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
    await this.userRepository.updatePasswordHash(user.id!, passwordHash);
    logger.info('Admin password reset completed', { userId: user.id });
  }
}
