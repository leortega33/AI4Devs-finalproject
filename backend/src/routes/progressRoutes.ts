import { Router } from 'express';
import { ProgressController } from '../presentation/controllers/progressController';
import { ProgressService } from '../application/services/progressService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

/**
 * Client-scoped progress routes nested under a client
 * (`/api/clients/:clientId/progress`): record, list (+summary), and delete a
 * measurement entry. Protected (US-026).
 */
export function createClientProgressRoutes(progressService: ProgressService, jwtSecret: string): Router {
  const router = Router({ mergeParams: true });
  const controller = new ProgressController(progressService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.post('/', controller.record);
  router.get('/', controller.list);
  router.delete('/:id', controller.remove);

  return router;
}
