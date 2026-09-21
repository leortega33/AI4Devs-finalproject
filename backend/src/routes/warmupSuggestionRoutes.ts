import { Router } from 'express';
import { WarmupSuggestionController } from '../presentation/controllers/warmupSuggestionController';
import { WarmupSuggestionService } from '../application/services/warmupSuggestionService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

/**
 * Builds the warm-up suggestions router nested under a client
 * (`/api/clients/:clientId/warmup-suggestions`), protected by the auth middleware (US-023).
 */
export function createWarmupSuggestionRoutes(
  warmupSuggestionService: WarmupSuggestionService,
  jwtSecret: string,
): Router {
  const router = Router({ mergeParams: true });
  const controller = new WarmupSuggestionController(warmupSuggestionService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.get('/', controller.get);

  return router;
}
