import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
});

// A client's basic data. Required: firstName, lastName, dni, phone, email,
// birthDate. Optional: address, goal, emergency contact (see design.md).
export const clientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dni: z.string().regex(/^\d{7,8}$/, 'DNI must be 7 or 8 digits'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email(),
  birthDate: z.coerce.date(),
  address: z.string().optional().nullable(),
  goal: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  emergencyContactRelationship: z.string().optional().nullable(),
});

export const clientStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
});

// A client's medical record (US-003). Every field is optional free text with a
// per-field length limit; an all-empty payload is valid. Only current state is
// stored (no history in the MVP).
const medicalField = z.string().max(1000, 'Field must be 1000 characters or fewer').optional().nullable();

export const medicalRecordSchema = z.object({
  preexistingConditions: medicalField,
  injuries: medicalField,
  surgeriesOrProsthetics: medicalField,
  physicalRestrictions: medicalField,
  medication: medicalField,
  allergies: medicalField,
  bloodType: z.string().max(10, 'Blood type must be 10 characters or fewer').optional().nullable(),
  notes: medicalField,
});

// A catalog exercise (US-004). Required: name, muscleGroup, category. Optional:
// default sets/reps (non-negative integers), technique, equipment.
export const exerciseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  muscleGroup: z.string().min(1, 'Muscle group is required'),
  category: z.enum(['mobility', 'activation', 'main']),
  defaultSets: z.number().int().nonnegative().optional().nullable(),
  defaultReps: z.number().int().nonnegative().optional().nullable(),
  technique: z.string().max(1000, 'Technique must be 1000 characters or fewer').optional().nullable(),
  equipment: z.string().max(255, 'Equipment must be 255 characters or fewer').optional().nullable(),
});

// A routine template with nested sessions and exercise entries (US-005).
// A template requires a name and at least one session; each session requires a
// name; each entry references a catalog exercise with a phase.
const routineExerciseWeekSchema = z.object({
  week: z.number().int().positive('Week must be a positive number'),
  kg: z.number().nonnegative().optional().nullable(),
  reps: z.number().int().nonnegative().optional().nullable(),
  series: z.number().int().nonnegative().optional().nullable(),
});

const routineExerciseEntrySchema = z
  .object({
    exerciseId: z.number().int().positive(),
    phase: z.enum(['warmup', 'main']),
    block: z.string().max(255).optional().nullable(),
    kg: z.number().nonnegative().optional().nullable(),
    reps: z.number().int().nonnegative().optional().nullable(),
    series: z.number().int().nonnegative().optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    order: z.number().int().nonnegative(),
    weeks: z.array(routineExerciseWeekSchema).optional(),
  })
  .refine(
    (entry) => {
      if (!entry.weeks) return true;
      const weeks = entry.weeks.map((w) => w.week);
      return new Set(weeks).size === weeks.length;
    },
    { message: 'Week numbers within an entry must be unique', path: ['weeks'] },
  );

const routineSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required'),
  warmupPrescription: z.string().max(1000).optional().nullable(),
  order: z.number().int().nonnegative(),
  entries: z.array(routineExerciseEntrySchema),
});

export const routineTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().max(2000).optional().nullable(),
  objective: z.string().max(255).optional().nullable(),
  generalConsiderations: z.string().max(2000).optional().nullable(),
  sessions: z.array(routineSessionSchema).min(1, 'At least one session is required'),
});

// Assigning a routine to a client (US-006): reference a library template, a
// start date, and a positive duration in weeks.
export const assignRoutineSchema = z.object({
  templateId: z.number().int().positive(),
  startDate: z.coerce.date(),
  durationWeeks: z.number().int().positive('Duration must be a positive number of weeks'),
});

// A client payment (US-007): positive amount, method enum, and the covered
// period (month 1-12, plausible year).
export const paymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  paymentDate: z.coerce.date(),
  method: z.enum(['cash', 'bank_transfer', 'card']),
  periodMonth: z.number().int().min(1).max(12),
  periodYear: z.number().int().min(2000).max(2100),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ClientInputData = z.infer<typeof clientSchema>;
export type ClientStatusInput = z.infer<typeof clientStatusSchema>;
export type MedicalRecordInputData = z.infer<typeof medicalRecordSchema>;
export type ExerciseInputData = z.infer<typeof exerciseSchema>;
export type RoutineTemplateInputData = z.infer<typeof routineTemplateSchema>;
export type AssignRoutineInputData = z.infer<typeof assignRoutineSchema>;
export type PaymentInputData = z.infer<typeof paymentSchema>;

/** Thrown when request data fails schema validation (mapped to HTTP 400 by the controller). */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((i) => i.message).join(', '));
  }
  return result.data;
}

export function validateLogin(data: unknown): LoginInput {
  return parseOrThrow(loginSchema, data);
}

export function validateForgotPassword(data: unknown): ForgotPasswordInput {
  return parseOrThrow(forgotPasswordSchema, data);
}

export function validateResetPassword(data: unknown): ResetPasswordInput {
  return parseOrThrow(resetPasswordSchema, data);
}

export function validateClient(data: unknown): ClientInputData {
  return parseOrThrow(clientSchema, data);
}

export function validateClientStatus(data: unknown): ClientStatusInput {
  return parseOrThrow(clientStatusSchema, data);
}

export function validateMedicalRecord(data: unknown): MedicalRecordInputData {
  return parseOrThrow(medicalRecordSchema, data);
}

export function validateExercise(data: unknown): ExerciseInputData {
  return parseOrThrow(exerciseSchema, data);
}

export function validateRoutineTemplate(data: unknown): RoutineTemplateInputData {
  return parseOrThrow(routineTemplateSchema, data);
}

export function validateAssignRoutine(data: unknown): AssignRoutineInputData {
  return parseOrThrow(assignRoutineSchema, data);
}

export function validatePayment(data: unknown): PaymentInputData {
  return parseOrThrow(paymentSchema, data);
}
