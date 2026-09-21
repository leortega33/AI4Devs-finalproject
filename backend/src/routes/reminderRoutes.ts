import { Router } from 'express';
import { RemindersController } from '../presentation/controllers/remindersController';
import { ReminderService } from '../application/services/reminderService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

/**
 * Builds the reminders router (`/api/reminders`), protected by the auth
 * middleware. Exposes a manual trigger for the reminder job (US-024).
 */
export function createReminderRoutes(reminderService: ReminderService, jwtSecret: string): Router {
  const router = Router();
  const controller = new RemindersController(reminderService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.post('/run', controller.run);

  return router;
}
