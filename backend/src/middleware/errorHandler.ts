import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../application/validator';
import { ClientNotFoundError, DuplicateDniError } from '../application/services/clientService';
import { ExerciseNotFoundError } from '../application/services/exerciseService';
import {
  RoutineTemplateNotFoundError,
  UnknownExerciseError,
} from '../application/services/routineTemplateService';
import { PaymentNotFoundError } from '../application/services/paymentService';
import { AttendanceNotFoundError } from '../application/services/attendanceService';
import { ProgressEntryNotFoundError, ProgressPhotoNotFoundError } from '../application/services/progressService';
import { logger } from '../infrastructure/logger';

/** Centralized error handler: maps known errors to HTTP responses, logs unexpected ones. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
  if (error instanceof ValidationError || error instanceof UnknownExerciseError) {
    res.status(400).json({ success: false, error: { message: error.message, code: 'VALIDATION_ERROR' } });
    return;
  }

  if (error instanceof ClientNotFoundError) {
    res.status(404).json({ success: false, error: { message: error.message, code: 'NOT_FOUND' } });
    return;
  }

  if (error instanceof ExerciseNotFoundError) {
    res.status(404).json({ success: false, error: { message: error.message, code: 'NOT_FOUND' } });
    return;
  }

  if (error instanceof RoutineTemplateNotFoundError) {
    res.status(404).json({ success: false, error: { message: error.message, code: 'NOT_FOUND' } });
    return;
  }

  if (error instanceof PaymentNotFoundError) {
    res.status(404).json({ success: false, error: { message: error.message, code: 'NOT_FOUND' } });
    return;
  }

  if (error instanceof AttendanceNotFoundError) {
    res.status(404).json({ success: false, error: { message: error.message, code: 'NOT_FOUND' } });
    return;
  }

  if (error instanceof ProgressEntryNotFoundError) {
    res.status(404).json({ success: false, error: { message: error.message, code: 'NOT_FOUND' } });
    return;
  }

  if (error instanceof ProgressPhotoNotFoundError) {
    res.status(404).json({ success: false, error: { message: error.message, code: 'NOT_FOUND' } });
    return;
  }

  if (error instanceof DuplicateDniError) {
    res.status(409).json({ success: false, error: { message: error.message, code: 'DUPLICATE_DNI' } });
    return;
  }

  logger.error('Unhandled error', { error: error.message });
  res.status(500).json({ success: false, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
}
