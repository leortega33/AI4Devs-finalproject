import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createClientNutritionRoutes } from './nutritionRoutes';
import { NutritionService } from '../application/services/nutritionService';
import { ClientNotFoundError } from '../application/services/clientService';
import { NutritionPlan } from '../domain/models/NutritionPlan';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(service: NutritionService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/clients/:clientId/nutrition-plan', createClientNutritionRoutes(service, JWT_SECRET));
  app.use(errorHandler);
  return app;
}

function authCookie() {
  return [`session=${jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' })}`];
}

describe('nutritionRoutes', () => {
  let service: jest.Mocked<NutritionService>;

  beforeEach(() => {
    service = {
      getPlan: jest.fn(),
      savePlan: jest.fn(),
      getVersions: jest.fn(),
    } as unknown as jest.Mocked<NutritionService>;
  });

  it('should reject any request without a session cookie with 401', async () => {
    const app = buildApp(service);
    const response = await request(app).get('/api/clients/10/nutrition-plan');
    expect(response.status).toBe(401);
  });

  describe('GET /api/clients/:clientId/nutrition-plan', () => {
    it('should return an empty plan payload when none exists', async () => {
      service.getPlan.mockResolvedValue({ dailyCalories: null, proteinTargetG: null, generalNotes: null, meals: [] });
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/10/nutrition-plan').set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data.meals).toEqual([]);
    });

    it('should return 404 for a non-existent client', async () => {
      service.getPlan.mockRejectedValue(new ClientNotFoundError());
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/999/nutrition-plan').set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/clients/:clientId/nutrition-plan', () => {
    it('should save the plan and return 200', async () => {
      service.savePlan.mockResolvedValue(
        new NutritionPlan({
          id: 1,
          clientId: 10,
          dailyCalories: 2200,
          meals: [{ name: 'Desayuno', order: 0, items: [{ description: 'Avena', order: 0 }] }],
        }),
      );
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/clients/10/nutrition-plan')
        .set('Cookie', authCookie())
        .send({ dailyCalories: 2200, meals: [{ name: 'Desayuno', items: [{ description: 'Avena' }] }] });

      expect(response.status).toBe(200);
      expect(response.body.data.meals[0].name).toBe('Desayuno');
      expect(service.savePlan).toHaveBeenCalledWith(10, expect.objectContaining({ dailyCalories: 2200 }));
    });

    it('should return 400 for a negative target', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/clients/10/nutrition-plan')
        .set('Cookie', authCookie())
        .send({ dailyCalories: -1, meals: [] });

      expect(response.status).toBe(400);
      expect(service.savePlan).not.toHaveBeenCalled();
    });

    it('should return 400 for a meal without a name', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/clients/10/nutrition-plan')
        .set('Cookie', authCookie())
        .send({ meals: [{ name: '', items: [] }] });

      expect(response.status).toBe(400);
    });

    it('should return 404 for a non-existent client', async () => {
      service.savePlan.mockRejectedValue(new ClientNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/clients/999/nutrition-plan')
        .set('Cookie', authCookie())
        .send({ meals: [] });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/clients/:clientId/nutrition-plan/versions', () => {
    it('should return the version history newest first', async () => {
      service.getVersions.mockResolvedValue([
        { id: 2, snapshot: {}, createdAt: new Date('2026-09-21T11:00:00.000Z') },
        { id: 1, snapshot: {}, createdAt: new Date('2026-09-21T10:00:00.000Z') },
      ]);
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/clients/10/nutrition-plan/versions')
        .set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].id).toBe(2);
    });
  });
});
