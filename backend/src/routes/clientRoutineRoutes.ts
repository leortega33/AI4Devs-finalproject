import { Router } from 'express';
import { ClientRoutineController } from '../presentation/controllers/clientRoutineController';
import { ClientRoutineService } from '../application/services/clientRoutineService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

/**
 * Builds the client-routine router nested under a client
 * (`/api/clients/:clientId`), protected by the auth middleware (US-006).
 */
export function createClientRoutineRoutes(
  clientRoutineService: ClientRoutineService,
  jwtSecret: string,
): Router {
  const router = Router({ mergeParams: true });
  const controller = new ClientRoutineController(clientRoutineService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.post('/routine', controller.assign);
  router.get('/routine', controller.getActive);
  router.put('/routine', controller.adjust);
  router.get('/routines/history', controller.getHistory);

  return router;
}
