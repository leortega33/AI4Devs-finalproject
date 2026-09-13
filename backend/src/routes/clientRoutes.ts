import { Router } from 'express';
import { ClientController } from '../presentation/controllers/clientController';
import { ClientService } from '../application/services/clientService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

/** Builds the /api/clients router, protected by the auth middleware (US-002). */
export function createClientRoutes(clientService: ClientService, jwtSecret: string): Router {
  const router = Router();
  const controller = new ClientController(clientService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.patch('/:id/status', controller.updateStatus);

  return router;
}
