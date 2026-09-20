import { Router } from 'express';
import { MedicalFlagsController } from '../presentation/controllers/medicalFlagsController';
import { MedicalFlagsService } from '../application/services/medicalFlagsService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

/**
 * Builds the medical-flags router nested under a client
 * (`/api/clients/:clientId/medical-flags`), protected by the auth middleware (US-022).
 */
export function createMedicalFlagsRoutes(
  medicalFlagsService: MedicalFlagsService,
  jwtSecret: string,
): Router {
  const router = Router({ mergeParams: true });
  const controller = new MedicalFlagsController(medicalFlagsService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.get('/', controller.get);

  return router;
}
