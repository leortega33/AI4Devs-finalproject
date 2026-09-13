/* eslint-disable no-console */
type LogContext = Record<string, unknown>;

/** Minimal structured logger (see docs/backend-standards.md Logging Standards). */
export class Logger {
  info(message: string, context?: LogContext): void {
    console.log(JSON.stringify({ level: 'info', message, ...context }));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(JSON.stringify({ level: 'warn', message, ...context }));
  }

  error(message: string, context?: LogContext): void {
    console.error(JSON.stringify({ level: 'error', message, ...context }));
  }
}

export const logger = new Logger();
