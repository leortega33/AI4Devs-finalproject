import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createMedicalRecordRoutes } from './medicalRecordRoutes';
import { MedicalRecordService } from '../application/services/medicalRecordService';
import { ClientNotFoundError } from '../application/services/clientService';
import { MedicalRecord } from '../domain/models/MedicalRecord';
import { MedicalRecordVersion } from '../domain/models/MedicalRecordVersion';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(service: MedicalRecordService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/clients/:clientId/medical-record', createMedicalRecordRoutes(service, JWT_SECRET));
  app.use(errorHandler);
  return app;
}

function authCookie() {
  return [`session=${jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' })}`];
}

describe('medicalRecordRoutes', () => {
  let service: jest.Mocked<MedicalRecordService>;

  beforeEach(() => {
    service = {
      getByClientId: jest.fn(),
      upsert: jest.fn(),
      getHistory: jest.fn(),
    } as unknown as jest.Mocked<MedicalRecordService>;
  });

  it('should reject any request without a session cookie with 401', async () => {
    const app = buildApp(service);

    const response = await request(app).get('/api/clients/10/medical-record');

    expect(response.status).toBe(401);
  });

  describe('GET /api/clients/:clientId/medical-record', () => {
    it('should return the record when it exists', async () => {
      service.getByClientId.mockResolvedValue(new MedicalRecord({ clientId: 10, bloodType: 'O+' }));
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/10/medical-record').set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data.bloodType).toBe('O+');
      expect(service.getByClientId).toHaveBeenCalledWith(10);
    });

    it('should return null data when the client has no record yet', async () => {
      service.getByClientId.mockResolvedValue(null);
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/10/medical-record').set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
    });

    it('should return 404 for a non-existent client', async () => {
      service.getByClientId.mockRejectedValue(new ClientNotFoundError());
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/999/medical-record').set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/clients/:clientId/medical-record', () => {
    it('should upsert the record and return it', async () => {
      const saved = new MedicalRecord({ id: 1, clientId: 10, injuries: 'Knee' });
      service.upsert.mockResolvedValue(saved);
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/clients/10/medical-record')
        .set('Cookie', authCookie())
        .send({ injuries: 'Knee' });

      expect(response.status).toBe(200);
      expect(response.body.data.injuries).toBe('Knee');
      expect(service.upsert).toHaveBeenCalledWith(10, { injuries: 'Knee' });
    });

    it('should accept an all-empty payload', async () => {
      service.upsert.mockResolvedValue(new MedicalRecord({ id: 1, clientId: 10 }));
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/clients/10/medical-record')
        .set('Cookie', authCookie())
        .send({});

      expect(response.status).toBe(200);
    });

    it('should return 400 for an oversized field', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/clients/10/medical-record')
        .set('Cookie', authCookie())
        .send({ injuries: 'x'.repeat(1001) });

      expect(response.status).toBe(400);
      expect(service.upsert).not.toHaveBeenCalled();
    });

    it('should return 404 for a non-existent client', async () => {
      service.upsert.mockRejectedValue(new ClientNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/clients/999/medical-record')
        .set('Cookie', authCookie())
        .send({ notes: 'x' });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/clients/:clientId/medical-record/history', () => {
    it('should return the version history newest first', async () => {
      const versions = [
        new MedicalRecordVersion({ id: 2, clientId: 10, injuries: 'Knee', createdAt: new Date('2026-02-01') }),
        new MedicalRecordVersion({ id: 1, clientId: 10, createdAt: new Date('2026-01-01') }),
      ];
      service.getHistory.mockResolvedValue(versions);
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/clients/10/medical-record/history')
        .set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].injuries).toBe('Knee');
      expect(service.getHistory).toHaveBeenCalledWith(10);
    });

    it('should return an empty history when nothing was saved', async () => {
      service.getHistory.mockResolvedValue([]);
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/clients/10/medical-record/history')
        .set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should return 404 for a non-existent client', async () => {
      service.getHistory.mockRejectedValue(new ClientNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/clients/999/medical-record/history')
        .set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });

    it('should reject the history without a session cookie with 401', async () => {
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/10/medical-record/history');

      expect(response.status).toBe(401);
      expect(service.getHistory).not.toHaveBeenCalled();
    });
  });
});
