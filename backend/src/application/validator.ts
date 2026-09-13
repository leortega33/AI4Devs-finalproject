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

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ClientInputData = z.infer<typeof clientSchema>;
export type ClientStatusInput = z.infer<typeof clientStatusSchema>;

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
