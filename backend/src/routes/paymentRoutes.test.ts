import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createClientPaymentRoutes, createPaymentRoutes } from './paymentRoutes';
import { PaymentService, PaymentNotFoundError } from '../application/services/paymentService';
import { ClientNotFoundError } from '../application/services/clientService';
import { Payment } from '../domain/models/Payment';
import { Client } from '../domain/models/Client';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(service: PaymentService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/clients/:clientId/payments', createClientPaymentRoutes(service, JWT_SECRET));
  app.use('/api/payments', createPaymentRoutes(service, JWT_SECRET));
  app.use(errorHandler);
  return app;
}

function authCookie() {
  return [`session=${jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' })}`];
}

function samplePayment(id = 1) {
  return new Payment({
    id,
    clientId: 3,
    amount: 5000,
    paymentDate: new Date('2026-02-05'),
    method: 'cash',
    periodMonth: 2,
    periodYear: 2026,
  });
}

const validBody = {
  amount: 5000,
  paymentDate: '2026-02-05',
  method: 'cash',
  periodMonth: 2,
  periodYear: 2026,
};

describe('paymentRoutes', () => {
  let service: jest.Mocked<PaymentService>;

  beforeEach(() => {
    service = {
      register: jest.fn(),
      listByClient: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getExportData: jest.fn(),
    } as unknown as jest.Mocked<PaymentService>;
  });

  function sampleClient() {
    return new Client({
      id: 3,
      firstName: 'John',
      lastName: 'Doe',
      dni: '12345678',
      phone: '+542604000000',
      email: 'john@example.com',
      birthDate: new Date('1990-01-01'),
    });
  }

  it('should reject a client-scoped request without a session cookie with 401', async () => {
    const app = buildApp(service);

    const response = await request(app).get('/api/clients/3/payments');

    expect(response.status).toBe(401);
  });

  it('should reject an id-scoped request without a session cookie with 401', async () => {
    const app = buildApp(service);

    const response = await request(app).delete('/api/payments/1');

    expect(response.status).toBe(401);
  });

  describe('POST /api/clients/:clientId/payments', () => {
    it('should register a payment and return 201', async () => {
      service.register.mockResolvedValue(samplePayment());
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/3/payments')
        .set('Cookie', authCookie())
        .send(validBody);

      expect(response.status).toBe(201);
      expect(service.register).toHaveBeenCalledWith(3, expect.objectContaining({ amount: 5000 }));
    });

    it('should return 400 for an invalid amount', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/3/payments')
        .set('Cookie', authCookie())
        .send({ ...validBody, amount: 0 });

      expect(response.status).toBe(400);
      expect(service.register).not.toHaveBeenCalled();
    });

    it('should return 404 when the client does not exist', async () => {
      service.register.mockRejectedValue(new ClientNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/999/payments')
        .set('Cookie', authCookie())
        .send(validBody);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/clients/:clientId/payments', () => {
    it('should return payments and the derived status', async () => {
      service.listByClient.mockResolvedValue({ payments: [samplePayment()], status: 'up_to_date' });
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/3/payments').set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data.payments).toHaveLength(1);
      expect(response.body.data.status).toBe('up_to_date');
    });
  });

  describe('PUT /api/payments/:id', () => {
    it('should update a payment and return 200', async () => {
      service.update.mockResolvedValue(samplePayment());
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/payments/1')
        .set('Cookie', authCookie())
        .send(validBody);

      expect(response.status).toBe(200);
      expect(service.update).toHaveBeenCalledWith(1, expect.objectContaining({ amount: 5000 }));
    });

    it('should return 404 when the payment does not exist', async () => {
      service.update.mockRejectedValue(new PaymentNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/payments/999')
        .set('Cookie', authCookie())
        .send(validBody);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/payments/:id', () => {
    it('should delete a payment and return 204', async () => {
      service.delete.mockResolvedValue(undefined);
      const app = buildApp(service);

      const response = await request(app).delete('/api/payments/1').set('Cookie', authCookie());

      expect(response.status).toBe(204);
      expect(service.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when the payment does not exist', async () => {
      service.delete.mockRejectedValue(new PaymentNotFoundError());
      const app = buildApp(service);

      const response = await request(app).delete('/api/payments/999').set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/clients/:clientId/payments/export', () => {
    it('should return a PDF document for an existing client', async () => {
      service.getExportData.mockResolvedValue({
        client: sampleClient(),
        payments: [samplePayment()],
        status: 'up_to_date',
      });
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/clients/3/payments/export')
        .set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.subarray(0, 5).toString('latin1')).toBe('%PDF-');
      expect(service.getExportData).toHaveBeenCalledWith(3);
    });

    it('should return 404 when the client does not exist', async () => {
      service.getExportData.mockRejectedValue(new ClientNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/clients/999/payments/export')
        .set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });

    it('should return 401 without a session cookie', async () => {
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/3/payments/export');

      expect(response.status).toBe(401);
      expect(service.getExportData).not.toHaveBeenCalled();
    });
  });
});
