import { Router } from 'express';
import { PaymentController } from '../presentation/controllers/paymentController';
import { PaymentService } from '../application/services/paymentService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

/**
 * Client-scoped payment routes nested under a client
 * (`/api/clients/:clientId/payments`): register, list, and export the history
 * as PDF. Protected (US-007, US-008).
 */
export function createClientPaymentRoutes(paymentService: PaymentService, jwtSecret: string): Router {
  const router = Router({ mergeParams: true });
  const controller = new PaymentController(paymentService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.post('/', controller.register);
  router.get('/', controller.list);
  router.get('/export', controller.exportHistory);

  return router;
}

/**
 * Id-scoped payment routes (`/api/payments/:id`): edit and delete.
 * Protected (US-007).
 */
export function createPaymentRoutes(paymentService: PaymentService, jwtSecret: string): Router {
  const router = Router();
  const controller = new PaymentController(paymentService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
