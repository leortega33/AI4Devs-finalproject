import { Router } from 'express';
import { RoutineTemplateController } from '../presentation/controllers/routineTemplateController';
import { RoutineTemplateService } from '../application/services/routineTemplateService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

/** Builds the /api/routine-templates router, protected by the auth middleware (US-005). */
export function createRoutineTemplateRoutes(
  routineTemplateService: RoutineTemplateService,
  jwtSecret: string,
): Router {
  const router = Router();
  const controller = new RoutineTemplateController(routineTemplateService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.get('/:id/export.pdf', controller.exportPdf);
  router.get('/:id/export.xlsx', controller.exportXlsx);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.post('/:id/duplicate', controller.duplicate);

  return router;
}
