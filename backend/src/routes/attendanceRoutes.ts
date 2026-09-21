import { Router } from 'express';
import { AttendanceController } from '../presentation/controllers/attendanceController';
import { AttendanceService } from '../application/services/attendanceService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

/**
 * Client-scoped attendance routes nested under a client
 * (`/api/clients/:clientId/attendance`): register, list (+summary), and delete a
 * check-in. Protected (US-025).
 */
export function createClientAttendanceRoutes(
  attendanceService: AttendanceService,
  jwtSecret: string,
): Router {
  const router = Router({ mergeParams: true });
  const controller = new AttendanceController(attendanceService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.post('/', controller.register);
  router.get('/', controller.list);
  router.delete('/:id', controller.remove);

  return router;
}
