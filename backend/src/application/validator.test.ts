import {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  ValidationError,
} from './validator';

describe('validator', () => {
  describe('validateLogin', () => {
    it('should accept a valid email and password', () => {
      const result = validateLogin({ email: 'admin@example.com', password: 'secret123' });

      expect(result).toEqual({ email: 'admin@example.com', password: 'secret123' });
    });

    it('should reject an invalid email format', () => {
      expect(() => validateLogin({ email: 'not-an-email', password: 'secret123' })).toThrow(
        ValidationError,
      );
    });

    it('should reject an empty password', () => {
      expect(() => validateLogin({ email: 'admin@example.com', password: '' })).toThrow(
        ValidationError,
      );
    });
  });

  describe('validateForgotPassword', () => {
    it('should accept a valid email', () => {
      expect(validateForgotPassword({ email: 'admin@example.com' })).toEqual({
        email: 'admin@example.com',
      });
    });

    it('should reject a missing email', () => {
      expect(() => validateForgotPassword({})).toThrow(ValidationError);
    });
  });

  describe('validateResetPassword', () => {
    it('should accept a token and a password of at least 8 characters', () => {
      const result = validateResetPassword({ token: 'abc', newPassword: 'longenough' });

      expect(result).toEqual({ token: 'abc', newPassword: 'longenough' });
    });

    it('should reject a password shorter than 8 characters', () => {
      expect(() => validateResetPassword({ token: 'abc', newPassword: 'short' })).toThrow(
        ValidationError,
      );
    });

    it('should reject a missing token', () => {
      expect(() => validateResetPassword({ newPassword: 'longenough' })).toThrow(ValidationError);
    });
  });
});
