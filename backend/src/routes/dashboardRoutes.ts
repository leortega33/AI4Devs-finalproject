import { Router } from 'express';
import { DashboardController } from '../presentation/controllers/dashboardController';
import { DashboardService } from '../application/services/dashboardService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

/**
 * Dashboard routes (`/api/dashboard`): the read-only alert aggregation.
 * Protected (US-009).
 */
export function createDashboardRoutes(
  dashboardService: DashboardService,
  jwtSecret: string,
  dueSoonDays: number,
): Router {
  const router = Router();
  const controller = new DashboardController(dashboardService, dueSoonDays);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.get('/', controller.get);

  return router;
}
