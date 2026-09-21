import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createClientAttendanceRoutes } from './attendanceRoutes';
import { AttendanceService, AttendanceNotFoundError } from '../application/services/attendanceService';
import { ClientNotFoundError } from '../application/services/clientService';
import { Attendance } from '../domain/models/Attendance';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(service: AttendanceService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/clients/:clientId/attendance', createClientAttendanceRoutes(service, JWT_SECRET));
  app.use(errorHandler);
  return app;
}

function authCookie() {
  return [`session=${jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' })}`];
}

describe('attendanceRoutes', () => {
  let service: jest.Mocked<AttendanceService>;

  beforeEach(() => {
    service = {
      record: jest.fn(),
      list: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<AttendanceService>;
  });

  it('should reject any request without a session cookie with 401', async () => {
    const app = buildApp(service);
    const response = await request(app).get('/api/clients/10/attendance');
    expect(response.status).toBe(401);
  });

  describe('POST /api/clients/:clientId/attendance', () => {
    it('should register a check-in and return 201', async () => {
      const checkInAt = new Date('2026-09-20T10:00:00.000Z');
      service.record.mockResolvedValue(new Attendance({ id: 1, clientId: 10, checkInAt, note: 'Buena' }));
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/10/attendance')
        .set('Cookie', authCookie())
        .send({ note: 'Buena' });

      expect(response.status).toBe(201);
      expect(response.body.data.note).toBe('Buena');
      expect(service.record).toHaveBeenCalledWith(10, expect.objectContaining({ note: 'Buena' }));
    });

    it('should return 400 for an oversized note', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/10/attendance')
        .set('Cookie', authCookie())
        .send({ note: 'x'.repeat(501) });

      expect(response.status).toBe(400);
      expect(service.record).not.toHaveBeenCalled();
    });

    it('should return 404 for a non-existent client', async () => {
      service.record.mockRejectedValue(new ClientNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/999/attendance')
        .set('Cookie', authCookie())
        .send({});

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/clients/:clientId/attendance', () => {
    it('should return the check-ins and summary', async () => {
      service.list.mockResolvedValue({
        attendances: [new Attendance({ id: 1, clientId: 10, checkInAt: new Date('2026-09-20T10:00:00.000Z') })],
        summary: { total: 1, thisMonth: 1, last30Days: 1, lastCheckInAt: '2026-09-20T10:00:00.000Z' },
      });
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/10/attendance').set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data.attendances).toHaveLength(1);
      expect(response.body.data.summary.total).toBe(1);
    });

    it('should return 404 for a non-existent client', async () => {
      service.list.mockRejectedValue(new ClientNotFoundError());
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/999/attendance').set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/clients/:clientId/attendance/:id', () => {
    it('should delete a check-in and return 204', async () => {
      service.remove.mockResolvedValue(undefined);
      const app = buildApp(service);

      const response = await request(app).delete('/api/clients/10/attendance/1').set('Cookie', authCookie());

      expect(response.status).toBe(204);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should return 404 when the check-in does not exist', async () => {
      service.remove.mockRejectedValue(new AttendanceNotFoundError());
      const app = buildApp(service);

      const response = await request(app).delete('/api/clients/10/attendance/999').set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });
  });
});
