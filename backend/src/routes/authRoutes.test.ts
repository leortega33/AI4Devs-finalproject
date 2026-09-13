import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createAuthRoutes } from './authRoutes';
import { AuthService, InvalidCredentialsError, InvalidResetTokenError } from '../application/services/authService';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(authService: AuthService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', createAuthRoutes(authService, JWT_SECRET));
  app.use(errorHandler);
  return app;
}

describe('authRoutes', () => {
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    authService = {
      login: jest.fn(),
      requestPasswordReset: jest.fn(),
      resetPassword: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 and set a session cookie on valid credentials', async () => {
      authService.login.mockResolvedValue({ user: { id: 1, email: 'admin@example.com' }, token: 'signed-jwt' });
      const app = buildApp(authService);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'correct-password' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: { id: 1, email: 'admin@example.com' } });
      expect(response.headers['set-cookie']?.[0]).toContain('session=signed-jwt');
    });

    it('should return 401 on invalid credentials', async () => {
      authService.login.mockRejectedValue(new InvalidCredentialsError());
      const app = buildApp(authService);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'wrong-password' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when the request body fails validation', async () => {
      const app = buildApp(authService);

      const response = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 when there is no session cookie', async () => {
      const app = buildApp(authService);

      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it("should return the authenticated user's id when the session cookie is valid", async () => {
      const app = buildApp(authService);
      const validToken = jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app).get('/api/auth/me').set('Cookie', [`session=${validToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: { id: 1 } });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the session cookie and return 204', async () => {
      const app = buildApp(authService);

      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(204);
      expect(response.headers['set-cookie']?.[0]).toContain('session=;');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return the same generic response regardless of whether the email matches', async () => {
      authService.requestPasswordReset.mockResolvedValue(undefined);
      const app = buildApp(authService);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'anything@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should return 200 when the token is valid', async () => {
      authService.resetPassword.mockResolvedValue(undefined);
      const app = buildApp(authService);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'valid-token', newPassword: 'longenough' });

      expect(response.status).toBe(200);
    });

    it('should return 400 when the token is invalid or expired', async () => {
      authService.resetPassword.mockRejectedValue(new InvalidResetTokenError());
      const app = buildApp(authService);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'bad-token', newPassword: 'longenough' });

      expect(response.status).toBe(400);
    });
  });
});
