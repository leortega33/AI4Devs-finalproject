import { User } from './User';

describe('User', () => {
  describe('hasValidPasswordResetToken', () => {
    it('should return false when no reset token is set', () => {
      const user = new User({ id: 1, email: 'admin@example.com', passwordHash: 'hash' });

      expect(user.hasValidPasswordResetToken()).toBe(false);
    });

    it('should return true when the token exists and has not expired', () => {
      const future = new Date(Date.now() + 60_000);
      const user = new User({
        id: 1,
        email: 'admin@example.com',
        passwordHash: 'hash',
        passwordResetTokenHash: 'token-hash',
        passwordResetExpiresAt: future,
      });

      expect(user.hasValidPasswordResetToken()).toBe(true);
    });

    it('should return false when the token has expired', () => {
      const past = new Date(Date.now() - 60_000);
      const user = new User({
        id: 1,
        email: 'admin@example.com',
        passwordHash: 'hash',
        passwordResetTokenHash: 'token-hash',
        passwordResetExpiresAt: past,
      });

      expect(user.hasValidPasswordResetToken()).toBe(false);
    });
  });
});
