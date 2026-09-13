import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createClientRoutes } from './clientRoutes';
import { ClientService, ClientNotFoundError, DuplicateDniError } from '../application/services/clientService';
import { Client } from '../domain/models/Client';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(service: ClientService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/clients', createClientRoutes(service, JWT_SECRET));
  app.use(errorHandler);
  return app;
}

function authCookie() {
  return [`session=${jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' })}`];
}

const validBody = {
  firstName: 'John',
  lastName: 'Doe',
  dni: '12345678',
  phone: '+542604000000',
  email: 'john@example.com',
  birthDate: '1990-01-01',
};

function sampleClient() {
  return new Client({ ...validBody, id: 1, birthDate: new Date('1990-01-01') });
}

describe('clientRoutes', () => {
  let service: jest.Mocked<ClientService>;

  beforeEach(() => {
    service = {
      list: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      setStatus: jest.fn(),
    } as unknown as jest.Mocked<ClientService>;
  });

  it('should reject any request without a session cookie with 401', async () => {
    const app = buildApp(service);

    const response = await request(app).get('/api/clients');

    expect(response.status).toBe(401);
  });

  describe('GET /api/clients', () => {
    it('should return the client list with search and status filters', async () => {
      service.list.mockResolvedValue([sampleClient()]);
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/clients?search=jo&status=active')
        .set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(service.list).toHaveBeenCalledWith({ search: 'jo', status: 'active' });
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/clients', () => {
    it('should create a client and return 201', async () => {
      service.create.mockResolvedValue(sampleClient());
      const app = buildApp(service);

      const response = await request(app).post('/api/clients').set('Cookie', authCookie()).send(validBody);

      expect(response.status).toBe(201);
      expect(response.body.data.dni).toBe('12345678');
    });

    it('should return 400 on invalid data', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients')
        .set('Cookie', authCookie())
        .send({ ...validBody, email: 'nope' });

      expect(response.status).toBe(400);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('should return 409 on a duplicate DNI', async () => {
      service.create.mockRejectedValue(new DuplicateDniError());
      const app = buildApp(service);

      const response = await request(app).post('/api/clients').set('Cookie', authCookie()).send(validBody);

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/clients/:id', () => {
    it('should return 200 for an existing client', async () => {
      service.findById.mockResolvedValue(sampleClient());
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/1').set('Cookie', authCookie());

      expect(response.status).toBe(200);
    });

    it('should return 404 for a missing client', async () => {
      service.findById.mockRejectedValue(new ClientNotFoundError());
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/999').set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/clients/:id', () => {
    it('should update a client and return 200', async () => {
      service.update.mockResolvedValue(sampleClient());
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/clients/1')
        .set('Cookie', authCookie())
        .send({ ...validBody, phone: '+542604111111' });

      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /api/clients/:id/status', () => {
    it('should deactivate a client', async () => {
      service.setStatus.mockResolvedValue(new Client({ ...validBody, id: 1, birthDate: new Date('1990-01-01'), status: 'inactive' }));
      const app = buildApp(service);

      const response = await request(app)
        .patch('/api/clients/1/status')
        .set('Cookie', authCookie())
        .send({ status: 'inactive' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('inactive');
    });

    it('should return 400 for an invalid status', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .patch('/api/clients/1/status')
        .set('Cookie', authCookie())
        .send({ status: 'archived' });

      expect(response.status).toBe(400);
    });
  });
});
