import {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateClient,
  validateClientStatus,
  validateMedicalRecord,
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

  describe('validateClient', () => {
    const validClient = {
      firstName: 'John',
      lastName: 'Doe',
      dni: '12345678',
      phone: '+542604000000',
      email: 'john@example.com',
      birthDate: '1990-01-01',
    };

    it('should accept a valid client and coerce the birth date', () => {
      const result = validateClient(validClient);

      expect(result.firstName).toBe('John');
      expect(result.birthDate).toBeInstanceOf(Date);
    });

    it('should reject a missing required field', () => {
      const { firstName, ...withoutName } = validClient;
      expect(() => validateClient(withoutName)).toThrow(ValidationError);
    });

    it('should reject an invalid DNI format', () => {
      expect(() => validateClient({ ...validClient, dni: 'ABC' })).toThrow(ValidationError);
    });

    it('should reject an invalid email', () => {
      expect(() => validateClient({ ...validClient, email: 'nope' })).toThrow(ValidationError);
    });
  });

  describe('validateClientStatus', () => {
    it('should accept a valid status', () => {
      expect(validateClientStatus({ status: 'inactive' })).toEqual({ status: 'inactive' });
    });

    it('should reject an unknown status', () => {
      expect(() => validateClientStatus({ status: 'archived' })).toThrow(ValidationError);
    });
  });

  describe('validateMedicalRecord', () => {
    it('should accept an all-empty payload', () => {
      expect(validateMedicalRecord({})).toEqual({});
    });

    it('should accept valid medical fields', () => {
      const result = validateMedicalRecord({
        preexistingConditions: 'Asthma',
        bloodType: 'O+',
        notes: 'Prefers morning sessions',
      });

      expect(result.preexistingConditions).toBe('Asthma');
      expect(result.bloodType).toBe('O+');
    });

    it('should reject a free-text field longer than 1000 characters', () => {
      expect(() => validateMedicalRecord({ injuries: 'x'.repeat(1001) })).toThrow(ValidationError);
    });

    it('should reject an oversized blood type', () => {
      expect(() => validateMedicalRecord({ bloodType: 'x'.repeat(11) })).toThrow(ValidationError);
    });
  });
});
