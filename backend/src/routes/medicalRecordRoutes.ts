import { Router } from 'express';
import { MedicalRecordController } from '../presentation/controllers/medicalRecordController';
import { MedicalRecordService } from '../application/services/medicalRecordService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

/**
 * Builds the medical-record router nested under a client
 * (`/api/clients/:clientId/medical-record`), protected by the auth middleware (US-003).
 */
export function createMedicalRecordRoutes(
  medicalRecordService: MedicalRecordService,
  jwtSecret: string,
): Router {
  const router = Router({ mergeParams: true });
  const controller = new MedicalRecordController(medicalRecordService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.get('/', controller.get);
  router.put('/', controller.upsert);
  router.get('/history', controller.history);

  return router;
}
