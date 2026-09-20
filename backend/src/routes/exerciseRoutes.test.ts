import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createExerciseRoutes } from './exerciseRoutes';
import { ExerciseService, ExerciseNotFoundError } from '../application/services/exerciseService';
import { Exercise } from '../domain/models/Exercise';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(service: ExerciseService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/exercises', createExerciseRoutes(service, JWT_SECRET));
  app.use(errorHandler);
  return app;
}

function authCookie() {
  return [`session=${jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' })}`];
}

const validBody = {
  name: 'Back squat',
  muscleGroup: 'Legs',
  category: 'main',
};

function sampleExercise() {
  return new Exercise({ ...validBody, category: 'main', id: 1 });
}

describe('exerciseRoutes', () => {
  let service: jest.Mocked<ExerciseService>;

  beforeEach(() => {
    service = {
      list: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ExerciseService>;
  });

  it('should reject any request without a session cookie with 401', async () => {
    const app = buildApp(service);

    const response = await request(app).get('/api/exercises');

    expect(response.status).toBe(401);
  });

  describe('GET /api/exercises', () => {
    it('should return the list with search and category filters', async () => {
      service.list.mockResolvedValue([sampleExercise()]);
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/exercises?search=squat&category=main')
        .set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(service.list).toHaveBeenCalledWith({ search: 'squat', category: 'main' });
    });

    it('should ignore an invalid category filter', async () => {
      service.list.mockResolvedValue([]);
      const app = buildApp(service);

      await request(app).get('/api/exercises?category=cardio').set('Cookie', authCookie());

      expect(service.list).toHaveBeenCalledWith({ search: undefined, category: undefined });
    });
  });

  describe('GET /api/exercises/:id', () => {
    it('should return an exercise when found', async () => {
      service.findById.mockResolvedValue(sampleExercise());
      const app = buildApp(service);

      const response = await request(app).get('/api/exercises/1').set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Back squat');
    });

    it('should return 404 when not found', async () => {
      service.findById.mockRejectedValue(new ExerciseNotFoundError());
      const app = buildApp(service);

      const response = await request(app).get('/api/exercises/999').set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/exercises', () => {
    it('should create an exercise and return 201', async () => {
      service.create.mockResolvedValue(sampleExercise());
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/exercises')
        .set('Cookie', authCookie())
        .send(validBody);

      expect(response.status).toBe(201);
      expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Back squat' }));
    });

    it('should return 400 for an invalid category', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/exercises')
        .set('Cookie', authCookie())
        .send({ ...validBody, category: 'cardio' });

      expect(response.status).toBe(400);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('should round-trip body regions', async () => {
      service.create.mockResolvedValue(new Exercise({ ...validBody, category: 'main', id: 1, bodyRegions: ['knee', 'hip'] }));
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/exercises')
        .set('Cookie', authCookie())
        .send({ ...validBody, bodyRegions: ['knee', 'hip'] });

      expect(response.status).toBe(201);
      expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ bodyRegions: ['knee', 'hip'] }));
      expect(response.body.data.bodyRegions).toEqual(['knee', 'hip']);
    });

    it('should return 400 for an unknown body region', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/exercises')
        .set('Cookie', authCookie())
        .send({ ...validBody, bodyRegions: ['spleen'] });

      expect(response.status).toBe(400);
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/exercises/:id', () => {
    it('should update an exercise and return 200', async () => {
      service.update.mockResolvedValue(sampleExercise());
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/exercises/1')
        .set('Cookie', authCookie())
        .send(validBody);

      expect(response.status).toBe(200);
      expect(service.update).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Back squat' }));
    });

    it('should return 404 when updating a non-existent exercise', async () => {
      service.update.mockRejectedValue(new ExerciseNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/exercises/999')
        .set('Cookie', authCookie())
        .send(validBody);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/exercises/1')
        .set('Cookie', authCookie())
        .send({ ...validBody, name: '' });

      expect(response.status).toBe(400);
    });
  });
});
