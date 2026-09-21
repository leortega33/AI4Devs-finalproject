import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createWarmupSuggestionRoutes } from './warmupSuggestionRoutes';
import { WarmupSuggestionService } from '../application/services/warmupSuggestionService';
import { ClientNotFoundError } from '../application/services/clientService';
import { Exercise } from '../domain/models/Exercise';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(service: WarmupSuggestionService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/clients/:clientId/warmup-suggestions', createWarmupSuggestionRoutes(service, JWT_SECRET));
  app.use(errorHandler);
  return app;
}

function authCookie() {
  return [`session=${jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' })}`];
}

describe('warmupSuggestionRoutes', () => {
  let service: jest.Mocked<WarmupSuggestionService>;

  beforeEach(() => {
    service = { getSuggestions: jest.fn() } as unknown as jest.Mocked<WarmupSuggestionService>;
  });

  it('should return the grouped warm-up suggestions', async () => {
    service.getSuggestions.mockResolvedValue({
      regions: ['shoulder'],
      suggestions: [
        {
          region: 'shoulder',
          exercises: [new Exercise({ id: 2, name: 'Movilidad de hombro', muscleGroup: 'Hombros', category: 'mobility', bodyRegions: ['shoulder'] })],
        },
      ],
    });
    const app = buildApp(service);

    const response = await request(app).get('/api/clients/10/warmup-suggestions').set('Cookie', authCookie());

    expect(response.status).toBe(200);
    expect(response.body.data.regions).toEqual(['shoulder']);
    expect(response.body.data.suggestions[0].region).toBe('shoulder');
    expect(response.body.data.suggestions[0].exercises[0].name).toBe('Movilidad de hombro');
    expect(service.getSuggestions).toHaveBeenCalledWith(10);
  });

  it('should return empty suggestions when nothing applies', async () => {
    service.getSuggestions.mockResolvedValue({ regions: [], suggestions: [] });
    const app = buildApp(service);

    const response = await request(app).get('/api/clients/10/warmup-suggestions').set('Cookie', authCookie());

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ regions: [], suggestions: [] });
  });

  it('should return 404 for a non-existent client', async () => {
    service.getSuggestions.mockRejectedValue(new ClientNotFoundError());
    const app = buildApp(service);

    const response = await request(app).get('/api/clients/999/warmup-suggestions').set('Cookie', authCookie());

    expect(response.status).toBe(404);
  });

  it('should reject a request without a session cookie with 401', async () => {
    const app = buildApp(service);

    const response = await request(app).get('/api/clients/10/warmup-suggestions');

    expect(response.status).toBe(401);
    expect(service.getSuggestions).not.toHaveBeenCalled();
  });
});
