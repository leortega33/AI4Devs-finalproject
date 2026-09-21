import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createReminderRoutes } from './reminderRoutes';
import { ReminderService } from '../application/services/reminderService';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(service: ReminderService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/reminders', createReminderRoutes(service, JWT_SECRET));
  app.use(errorHandler);
  return app;
}

function authCookie() {
  return [`session=${jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' })}`];
}

describe('reminderRoutes', () => {
  let service: jest.Mocked<ReminderService>;

  beforeEach(() => {
    service = { run: jest.fn() } as unknown as jest.Mocked<ReminderService>;
  });

  it('should run the job and return the summary', async () => {
    service.run.mockResolvedValue({ sent: 2, skippedNoEmail: 1, skippedDuplicate: 3 });
    const app = buildApp(service);

    const response = await request(app).post('/api/reminders/run').set('Cookie', authCookie());

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ sent: 2, skippedNoEmail: 1, skippedDuplicate: 3 });
    expect(service.run).toHaveBeenCalled();
  });

  it('should reject the trigger without a session cookie with 401', async () => {
    const app = buildApp(service);

    const response = await request(app).post('/api/reminders/run');

    expect(response.status).toBe(401);
    expect(service.run).not.toHaveBeenCalled();
  });
});
