import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createClientRoutineRoutes } from './clientRoutineRoutes';
import { ClientRoutineService } from '../application/services/clientRoutineService';
import { ClientNotFoundError } from '../application/services/clientService';
import { RoutineTemplateNotFoundError } from '../application/services/routineTemplateService';
import { RoutineTemplate } from '../domain/models/RoutineTemplate';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(service: ClientRoutineService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/clients/:clientId', createClientRoutineRoutes(service, JWT_SECRET));
  app.use(errorHandler);
  return app;
}

function authCookie() {
  return [`session=${jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' })}`];
}

function activeRoutine() {
  return new RoutineTemplate({
    id: 5,
    name: 'Rutina',
    clientId: 3,
    sourceTemplateId: 1,
    status: 'active',
    startDate: new Date('2026-02-01'),
    durationWeeks: 4,
  });
}

const assignBody = { templateId: 1, startDate: '2026-02-01', durationWeeks: 4 };

describe('clientRoutineRoutes', () => {
  let service: jest.Mocked<ClientRoutineService>;

  beforeEach(() => {
    service = {
      assign: jest.fn(),
      getActive: jest.fn(),
      getHistory: jest.fn(),
      adjust: jest.fn(),
    } as unknown as jest.Mocked<ClientRoutineService>;
  });

  it('should reject any request without a session cookie with 401', async () => {
    const app = buildApp(service);

    const response = await request(app).get('/api/clients/3/routine');

    expect(response.status).toBe(401);
  });

  describe('POST /api/clients/:clientId/routine', () => {
    it('should assign a routine and return 201 with computed fields', async () => {
      service.assign.mockResolvedValue(activeRoutine());
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/3/routine')
        .set('Cookie', authCookie())
        .send(assignBody);

      expect(response.status).toBe(201);
      expect(response.body.data.clientId).toBe(3);
      expect(response.body.data.endDate).toBeDefined();
      expect(response.body.data).toHaveProperty('isExpired');
      expect(service.assign).toHaveBeenCalledWith(3, expect.objectContaining({ templateId: 1, durationWeeks: 4 }));
    });

    it('should return 400 for missing fields', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/3/routine')
        .set('Cookie', authCookie())
        .send({ templateId: 1 });

      expect(response.status).toBe(400);
      expect(service.assign).not.toHaveBeenCalled();
    });

    it('should return 404 when the client does not exist', async () => {
      service.assign.mockRejectedValue(new ClientNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/999/routine')
        .set('Cookie', authCookie())
        .send(assignBody);

      expect(response.status).toBe(404);
    });

    it('should return 404 when the template does not exist', async () => {
      service.assign.mockRejectedValue(new RoutineTemplateNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/3/routine')
        .set('Cookie', authCookie())
        .send(assignBody);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/clients/:clientId/routine', () => {
    it('should return the active routine', async () => {
      service.getActive.mockResolvedValue(activeRoutine());
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/3/routine').set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(5);
    });

    it('should return null data when there is no active routine', async () => {
      service.getActive.mockResolvedValue(null);
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/3/routine').set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
    });
  });

  describe('GET /api/clients/:clientId/routines/history', () => {
    it('should return the routine history', async () => {
      service.getHistory.mockResolvedValue([
        { id: 2, name: 'Anterior', objective: null, status: 'expired', sessionCount: 1 },
      ]);
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/3/routines/history').set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('PUT /api/clients/:clientId/routine', () => {
    it('should adjust the active routine and return 200', async () => {
      service.adjust.mockResolvedValue(activeRoutine());
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/clients/3/routine')
        .set('Cookie', authCookie())
        .send({ name: 'Rutina', sessions: [{ name: 'A', order: 0, entries: [{ exerciseId: 7, phase: 'main', order: 0 }] }] });

      expect(response.status).toBe(200);
      expect(service.adjust).toHaveBeenCalled();
    });

    it('should return 404 when there is no active routine to adjust', async () => {
      service.adjust.mockRejectedValue(new RoutineTemplateNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/clients/3/routine')
        .set('Cookie', authCookie())
        .send({ name: 'Rutina', sessions: [{ name: 'A', order: 0, entries: [] }] });

      expect(response.status).toBe(404);
    });
  });
});
