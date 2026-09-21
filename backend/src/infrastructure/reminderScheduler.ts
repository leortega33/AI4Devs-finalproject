import cron from 'node-cron';
import { ReminderService } from '../application/services/reminderService';
import { logger } from './logger';

/**
 * Schedules the reminder job with node-cron. Errors are caught and logged so a
 * failed run never crashes the process (US-024). Opt-in: only called when
 * reminders are enabled.
 */
export function startReminderScheduler(reminderService: ReminderService, cronExpression: string): void {
  cron.schedule(cronExpression, async () => {
    try {
      const summary = await reminderService.run();
      logger.info('Reminder job completed', { ...summary });
    } catch (error) {
      logger.error('Reminder job failed', { error: error instanceof Error ? error.message : String(error) });
    }
  });
  logger.info('Reminder scheduler started', { cron: cronExpression });
}
