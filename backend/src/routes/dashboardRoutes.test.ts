import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createDashboardRoutes } from './dashboardRoutes';
import { DashboardService, Dashboard } from '../application/services/dashboardService';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(service: DashboardService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/dashboard', createDashboardRoutes(service, JWT_SECRET, 5));
  app.use(errorHandler);
  return app;
}

function authCookie() {
  return [`session=${jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' })}`];
}

const emptyDashboard: Dashboard = {
  overduePayments: [],
  paymentsDueSoon: [],
  noPayments: [],
  expiringRoutines: [],
  kpis: { activeClients: 0, upToDate: 0, overdue: 0, noPayments: 0, monthlyIncome: 0 },
};

describe('dashboardRoutes', () => {
  let service: jest.Mocked<DashboardService>;

  beforeEach(() => {
    service = { getDashboard: jest.fn() } as unknown as jest.Mocked<DashboardService>;
  });

  it('should return the dashboard with the four alert groups', async () => {
    service.getDashboard.mockResolvedValue({
      ...emptyDashboard,
      overduePayments: [{ clientId: 1, clientName: 'John Doe', periodMonth: 8, periodYear: 2026 }],
    });
    const app = buildApp(service);

    const response = await request(app).get('/api/dashboard').set('Cookie', authCookie());

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('overduePayments');
    expect(response.body.data).toHaveProperty('paymentsDueSoon');
    expect(response.body.data).toHaveProperty('noPayments');
    expect(response.body.data).toHaveProperty('expiringRoutines');
    expect(response.body.data.overduePayments).toHaveLength(1);
  });

  it('should include the kpis object', async () => {
    service.getDashboard.mockResolvedValue({
      ...emptyDashboard,
      kpis: { activeClients: 3, upToDate: 1, overdue: 1, noPayments: 1, monthlyIncome: 27000 },
    });
    const app = buildApp(service);

    const response = await request(app).get('/api/dashboard').set('Cookie', authCookie());

    expect(response.status).toBe(200);
    expect(response.body.data.kpis).toEqual({
      activeClients: 3,
      upToDate: 1,
      overdue: 1,
      noPayments: 1,
      monthlyIncome: 27000,
    });
  });

  it('should return 401 without a session cookie', async () => {
    const app = buildApp(service);

    const response = await request(app).get('/api/dashboard');

    expect(response.status).toBe(401);
    expect(service.getDashboard).not.toHaveBeenCalled();
  });
});
