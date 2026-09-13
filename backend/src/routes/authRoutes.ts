import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../presentation/controllers/authController';
import { AuthService } from '../application/services/authService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many login attempts, try again later.', code: 'RATE_LIMITED' } },
});

const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests, try again later.', code: 'RATE_LIMITED' },
  },
});

/** Builds the /api/auth router (see US-001 and openspec/changes/add-admin-authentication). */
export function createAuthRoutes(authService: AuthService, jwtSecret: string): Router {
  const router = Router();
  const controller = new AuthController(authService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.post('/login', loginRateLimiter, controller.login);
  router.post('/logout', controller.logout);
  router.get('/me', authMiddleware, controller.me);
  router.post('/forgot-password', forgotPasswordRateLimiter, controller.forgotPassword);
  router.post('/reset-password', controller.resetPassword);

  return router;
}
