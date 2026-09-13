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

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

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
