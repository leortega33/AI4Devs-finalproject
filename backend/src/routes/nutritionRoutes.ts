import { Router } from 'express';
import { NutritionController } from '../presentation/controllers/nutritionController';
import { NutritionService } from '../application/services/nutritionService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

/**
 * Client-scoped nutrition routes nested under a client
 * (`/api/clients/:clientId/nutrition-plan`): get the current plan, upsert it, and
 * list its version history. Protected (US-027).
 */
export function createClientNutritionRoutes(nutritionService: NutritionService, jwtSecret: string): Router {
  const router = Router({ mergeParams: true });
  const controller = new NutritionController(nutritionService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.get('/', controller.getPlan);
  router.put('/', controller.savePlan);
  router.get('/versions', controller.getVersions);

  return router;
}
