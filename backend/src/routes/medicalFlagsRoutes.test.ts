import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createMedicalFlagsRoutes } from './medicalFlagsRoutes';
import { MedicalFlagsService } from '../application/services/medicalFlagsService';
import { ClientNotFoundError } from '../application/services/clientService';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(service: MedicalFlagsService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/clients/:clientId/medical-flags', createMedicalFlagsRoutes(service, JWT_SECRET));
  app.use(errorHandler);
  return app;
}

function authCookie() {
  return [`session=${jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' })}`];
}

describe('medicalFlagsRoutes', () => {
  let service: jest.Mocked<MedicalFlagsService>;

  beforeEach(() => {
    service = { getFlags: jest.fn() } as unknown as jest.Mocked<MedicalFlagsService>;
  });

  it('should return the flagged regions with details', async () => {
    service.getFlags.mockResolvedValue({
      regions: ['knee'],
      details: [{ region: 'knee', field: 'injuries', snippet: 'rodilla' }],
    });
    const app = buildApp(service);

    const response = await request(app).get('/api/clients/10/medical-flags').set('Cookie', authCookie());

    expect(response.status).toBe(200);
    expect(response.body.data.regions).toEqual(['knee']);
    expect(response.body.data.details[0]).toEqual({ region: 'knee', field: 'injuries', snippet: 'rodilla' });
    expect(service.getFlags).toHaveBeenCalledWith(10);
  });

  it('should return empty flags when nothing is flagged', async () => {
    service.getFlags.mockResolvedValue({ regions: [], details: [] });
    const app = buildApp(service);

    const response = await request(app).get('/api/clients/10/medical-flags').set('Cookie', authCookie());

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ regions: [], details: [] });
  });

  it('should return 404 for a non-existent client', async () => {
    service.getFlags.mockRejectedValue(new ClientNotFoundError());
    const app = buildApp(service);

    const response = await request(app).get('/api/clients/999/medical-flags').set('Cookie', authCookie());

    expect(response.status).toBe(404);
  });

  it('should reject a request without a session cookie with 401', async () => {
    const app = buildApp(service);

    const response = await request(app).get('/api/clients/10/medical-flags');

    expect(response.status).toBe(401);
    expect(service.getFlags).not.toHaveBeenCalled();
  });
});
