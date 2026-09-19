import {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateClient,
  validateClientStatus,
  validateMedicalRecord,
  validateExercise,
  validateRoutineTemplate,
  validateAssignRoutine,
  validatePayment,
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

  describe('validateExercise', () => {
    const validExercise = {
      name: 'Back squat',
      muscleGroup: 'Legs',
      category: 'main',
    };

    it('should accept a valid exercise with only the required fields', () => {
      const result = validateExercise(validExercise);

      expect(result.name).toBe('Back squat');
      expect(result.category).toBe('main');
    });

    it('should accept optional numeric and text fields', () => {
      const result = validateExercise({ ...validExercise, defaultSets: 4, defaultReps: 8, equipment: 'Barbell' });

      expect(result.defaultSets).toBe(4);
      expect(result.equipment).toBe('Barbell');
    });

    it('should reject a missing required field', () => {
      const { muscleGroup, ...withoutGroup } = validExercise;
      expect(() => validateExercise(withoutGroup)).toThrow(ValidationError);
    });

    it('should reject an invalid category', () => {
      expect(() => validateExercise({ ...validExercise, category: 'cardio' })).toThrow(ValidationError);
    });

    it('should reject a negative default sets value', () => {
      expect(() => validateExercise({ ...validExercise, defaultSets: -1 })).toThrow(ValidationError);
    });
  });

  describe('validateRoutineTemplate', () => {
    const validTemplate = {
      name: 'Hipertrofia',
      sessions: [
        {
          name: 'Sesión A',
          order: 0,
          entries: [{ exerciseId: 7, phase: 'main', order: 0, kg: 60, reps: 8, series: 4 }],
        },
      ],
    };

    it('should accept a valid nested template', () => {
      const result = validateRoutineTemplate(validTemplate);

      expect(result.name).toBe('Hipertrofia');
      expect(result.sessions[0].entries[0].exerciseId).toBe(7);
    });

    it('should accept a session with an empty entries list', () => {
      const result = validateRoutineTemplate({
        name: 'Vacía',
        sessions: [{ name: 'Sesión A', order: 0, entries: [] }],
      });

      expect(result.sessions[0].entries).toEqual([]);
    });

    it('should reject a template without a name', () => {
      const { name, ...withoutName } = validTemplate;
      expect(() => validateRoutineTemplate(withoutName)).toThrow(ValidationError);
    });

    it('should reject a template with no sessions', () => {
      expect(() => validateRoutineTemplate({ ...validTemplate, sessions: [] })).toThrow(ValidationError);
    });

    it('should reject a session without a name', () => {
      expect(() =>
        validateRoutineTemplate({ name: 'X', sessions: [{ order: 0, entries: [] }] }),
      ).toThrow(ValidationError);
    });

    it('should reject an entry with an invalid phase', () => {
      expect(() =>
        validateRoutineTemplate({
          name: 'X',
          sessions: [{ name: 'A', order: 0, entries: [{ exerciseId: 1, phase: 'cooldown', order: 0 }] }],
        }),
      ).toThrow(ValidationError);
    });

    it('should reject a negative kg value', () => {
      expect(() =>
        validateRoutineTemplate({
          name: 'X',
          sessions: [{ name: 'A', order: 0, entries: [{ exerciseId: 1, phase: 'main', order: 0, kg: -5 }] }],
        }),
      ).toThrow(ValidationError);
    });

    it('should accept an entry with a weekly progression', () => {
      const result = validateRoutineTemplate({
        name: 'Meso',
        sessions: [
          {
            name: 'A',
            order: 0,
            entries: [
              {
                exerciseId: 7,
                phase: 'main',
                order: 0,
                weeks: [
                  { week: 1, kg: 60, reps: 8, series: 4 },
                  { week: 2, kg: 62.5, reps: 8, series: 4 },
                ],
              },
            ],
          },
        ],
      });

      expect(result.sessions[0].entries[0].weeks).toHaveLength(2);
      expect(result.sessions[0].entries[0].weeks?.[1].kg).toBe(62.5);
    });

    it('should reject an entry with duplicate week numbers', () => {
      expect(() =>
        validateRoutineTemplate({
          name: 'X',
          sessions: [
            {
              name: 'A',
              order: 0,
              entries: [
                { exerciseId: 1, phase: 'main', order: 0, weeks: [{ week: 1, kg: 60 }, { week: 1, kg: 62 }] },
              ],
            },
          ],
        }),
      ).toThrow(ValidationError);
    });

    it('should reject an entry with a non-positive week number', () => {
      expect(() =>
        validateRoutineTemplate({
          name: 'X',
          sessions: [
            { name: 'A', order: 0, entries: [{ exerciseId: 1, phase: 'main', order: 0, weeks: [{ week: 0, kg: 60 }] }] },
          ],
        }),
      ).toThrow(ValidationError);
    });
  });

  describe('validateAssignRoutine', () => {
    it('should accept a valid assignment and coerce the start date', () => {
      const result = validateAssignRoutine({ templateId: 1, startDate: '2026-02-01', durationWeeks: 4 });

      expect(result.templateId).toBe(1);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.durationWeeks).toBe(4);
    });

    it('should reject a missing start date', () => {
      expect(() => validateAssignRoutine({ templateId: 1, durationWeeks: 4 })).toThrow(ValidationError);
    });

    it('should reject a non-positive duration', () => {
      expect(() => validateAssignRoutine({ templateId: 1, startDate: '2026-02-01', durationWeeks: 0 })).toThrow(
        ValidationError,
      );
    });

    it('should reject a non-positive templateId', () => {
      expect(() => validateAssignRoutine({ templateId: 0, startDate: '2026-02-01', durationWeeks: 4 })).toThrow(
        ValidationError,
      );
    });
  });

  describe('validatePayment', () => {
    const validPayment = {
      amount: 5000,
      paymentDate: '2026-02-05',
      method: 'cash',
      periodMonth: 2,
      periodYear: 2026,
    };

    it('should accept a valid payment and coerce the date', () => {
      const result = validatePayment(validPayment);

      expect(result.amount).toBe(5000);
      expect(result.method).toBe('cash');
      expect(result.paymentDate).toBeInstanceOf(Date);
    });

    it('should reject a non-positive amount', () => {
      expect(() => validatePayment({ ...validPayment, amount: 0 })).toThrow(ValidationError);
    });

    it('should reject an invalid method', () => {
      expect(() => validatePayment({ ...validPayment, method: 'crypto' })).toThrow(ValidationError);
    });

    it('should reject an out-of-range month', () => {
      expect(() => validatePayment({ ...validPayment, periodMonth: 13 })).toThrow(ValidationError);
    });

    it('should reject an implausible year', () => {
      expect(() => validatePayment({ ...validPayment, periodYear: 1999 })).toThrow(ValidationError);
    });
  });
});
