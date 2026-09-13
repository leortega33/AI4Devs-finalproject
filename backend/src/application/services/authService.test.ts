import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService, InvalidCredentialsError, InvalidResetTokenError } from './authService';
import { User } from '../../domain/models/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { EmailService } from '../../infrastructure/email/emailService';

function buildUserRepositoryMock(): jest.Mocked<UserRepository> {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updatePasswordHash: jest.fn(),
    setPasswordResetToken: jest.fn(),
    findByValidResetTokenHash: jest.fn(),
    clearPasswordResetToken: jest.fn(),
  };
}

function buildEmailServiceMock(): jest.Mocked<EmailService> {
  return { sendPasswordResetEmail: jest.fn() };
}

const JWT_SECRET = 'test-secret';
const RESET_URL_BASE = 'http://localhost:5173/reset-password';

describe('AuthService', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let emailService: jest.Mocked<EmailService>;
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = buildUserRepositoryMock();
    emailService = buildEmailServiceMock();
    authService = new AuthService(userRepository, emailService, JWT_SECRET, RESET_URL_BASE);
  });

  describe('login', () => {
    it('should return a signed token when credentials are valid', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      userRepository.findByEmail.mockResolvedValue(
        new User({ id: 1, email: 'admin@example.com', passwordHash }),
      );

      const result = await authService.login('admin@example.com', 'correct-password');

      expect(result.user).toEqual({ id: 1, email: 'admin@example.com' });
      const decoded = jwt.verify(result.token, JWT_SECRET) as unknown as { sub: number };
      expect(decoded.sub).toBe(1);
    });

    it('should reject an unknown email', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login('unknown@example.com', 'whatever')).rejects.toThrow(
        InvalidCredentialsError,
      );
    });

    it('should reject a wrong password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      userRepository.findByEmail.mockResolvedValue(
        new User({ id: 1, email: 'admin@example.com', passwordHash }),
      );

      await expect(authService.login('admin@example.com', 'wrong-password')).rejects.toThrow(
        InvalidCredentialsError,
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should send a reset email and store a token hash when the email matches', async () => {
      userRepository.findByEmail.mockResolvedValue(
        new User({ id: 1, email: 'admin@example.com', passwordHash: 'hash' }),
      );

      await authService.requestPasswordReset('admin@example.com');

      expect(userRepository.setPasswordResetToken).toHaveBeenCalledWith(
        1,
        expect.any(String),
        expect.any(Date),
      );
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'admin@example.com',
        expect.stringContaining(RESET_URL_BASE),
      );
    });

    it('should resolve silently without sending an email when the email does not match', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.requestPasswordReset('unknown@example.com')).resolves.toBeUndefined();

      expect(userRepository.setPasswordResetToken).not.toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should update the password hash when the token is valid', async () => {
      userRepository.findByValidResetTokenHash.mockResolvedValue(
        new User({ id: 1, email: 'admin@example.com', passwordHash: 'old-hash' }),
      );

      await authService.resetPassword('valid-raw-token', 'new-password-123');

      expect(userRepository.updatePasswordHash).toHaveBeenCalledWith(1, expect.any(String));
    });

    it('should reject an invalid or expired token', async () => {
      userRepository.findByValidResetTokenHash.mockResolvedValue(null);

      await expect(authService.resetPassword('bad-token', 'new-password-123')).rejects.toThrow(
        InvalidResetTokenError,
      );
      expect(userRepository.updatePasswordHash).not.toHaveBeenCalled();
    });
  });
});
