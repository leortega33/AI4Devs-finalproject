import { Router } from 'express';
import { ExerciseController } from '../presentation/controllers/exerciseController';
import { ExerciseService } from '../application/services/exerciseService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

/**
 * Builds the /api/exercises router, protected by the auth middleware (US-004).
 * No DELETE is exposed — exercises are never deleted so routines are not broken.
 */
export function createExerciseRoutes(exerciseService: ExerciseService, jwtSecret: string): Router {
  const router = Router();
  const controller = new ExerciseController(exerciseService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', controller.create);
  router.put('/:id', controller.update);

  return router;
}
