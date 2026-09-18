import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createRoutineTemplateRoutes } from './routineTemplateRoutes';
import {
  RoutineTemplateService,
  RoutineTemplateNotFoundError,
  UnknownExerciseError,
} from '../application/services/routineTemplateService';
import { RoutineTemplate } from '../domain/models/RoutineTemplate';
import { RoutineSession } from '../domain/models/RoutineSession';
import { RoutineExerciseEntry } from '../domain/models/RoutineExerciseEntry';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(service: RoutineTemplateService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/routine-templates', createRoutineTemplateRoutes(service, JWT_SECRET));
  app.use(errorHandler);
  return app;
}

function authCookie() {
  return [`session=${jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' })}`];
}

const validBody = {
  name: 'Hipertrofia',
  sessions: [
    {
      name: 'Sesión A',
      order: 0,
      entries: [{ exerciseId: 7, phase: 'main', order: 0, kg: 60, reps: 8, series: 4 }],
    },
  ],
};

function sampleTemplate(id = 1) {
  return new RoutineTemplate({
    id,
    name: 'Hipertrofia',
    sessions: [
      new RoutineSession({
        id: 10,
        name: 'Sesión A',
        order: 0,
        entries: [new RoutineExerciseEntry({ id: 100, exerciseId: 7, phase: 'main', order: 0 })],
      }),
    ],
  });
}

describe('routineTemplateRoutes', () => {
  let service: jest.Mocked<RoutineTemplateService>;

  beforeEach(() => {
    service = {
      list: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      duplicate: jest.fn(),
      getExportData: jest.fn(),
    } as unknown as jest.Mocked<RoutineTemplateService>;
  });

  it('should reject any request without a session cookie with 401', async () => {
    const app = buildApp(service);

    const response = await request(app).get('/api/routine-templates');

    expect(response.status).toBe(401);
  });

  describe('GET /api/routine-templates', () => {
    it('should return the library list', async () => {
      service.list.mockResolvedValue([
        { id: 1, name: 'Hipertrofia', objective: null, status: 'draft', sessionCount: 1 },
      ]);
      const app = buildApp(service);

      const response = await request(app).get('/api/routine-templates').set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/routine-templates/:id', () => {
    it('should return a template with nested detail', async () => {
      service.findById.mockResolvedValue(sampleTemplate());
      const app = buildApp(service);

      const response = await request(app).get('/api/routine-templates/1').set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data.sessions[0].entries[0].exerciseId).toBe(7);
    });

    it('should return 404 when not found', async () => {
      service.findById.mockRejectedValue(new RoutineTemplateNotFoundError());
      const app = buildApp(service);

      const response = await request(app).get('/api/routine-templates/999').set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/routine-templates/:id/export.pdf', () => {
    it('should return a PDF with attachment headers', async () => {
      service.getExportData.mockResolvedValue(sampleTemplate());
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/routine-templates/1/export.pdf')
        .set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('routine-1.pdf');
      expect(response.body.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    });

    it('should return 404 when the routine does not exist', async () => {
      service.getExportData.mockRejectedValue(new RoutineTemplateNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/routine-templates/999/export.pdf')
        .set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });

    it('should reject an unauthenticated export with 401', async () => {
      const app = buildApp(service);

      const response = await request(app).get('/api/routine-templates/1/export.pdf');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/routine-templates/:id/export.xlsx', () => {
    it('should return an xlsx workbook with attachment headers', async () => {
      service.getExportData.mockResolvedValue(sampleTemplate());
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/routine-templates/1/export.xlsx')
        .set('Cookie', authCookie())
        .buffer(true)
        .parse((res, cb) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => cb(null, Buffer.concat(chunks)));
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('spreadsheetml');
      expect(response.headers['content-disposition']).toContain('routine-1.xlsx');
      expect((response.body as Buffer).subarray(0, 2).toString('latin1')).toBe('PK');
    });

    it('should return 404 when the routine does not exist', async () => {
      service.getExportData.mockRejectedValue(new RoutineTemplateNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/routine-templates/999/export.xlsx')
        .set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });

    it('should reject an unauthenticated export with 401', async () => {
      const app = buildApp(service);

      const response = await request(app).get('/api/routine-templates/1/export.xlsx');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/routine-templates', () => {
    it('should create a template and return 201', async () => {
      service.create.mockResolvedValue(sampleTemplate());
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/routine-templates')
        .set('Cookie', authCookie())
        .send(validBody);

      expect(response.status).toBe(201);
      expect(service.create).toHaveBeenCalled();
    });

    it('should return 400 when there are no sessions', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/routine-templates')
        .set('Cookie', authCookie())
        .send({ ...validBody, sessions: [] });

      expect(response.status).toBe(400);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('should return 400 when an entry references an unknown exercise', async () => {
      service.create.mockRejectedValue(new UnknownExerciseError(7));
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/routine-templates')
        .set('Cookie', authCookie())
        .send(validBody);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/routine-templates/:id', () => {
    it('should update a template and return 200', async () => {
      service.update.mockResolvedValue(sampleTemplate());
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/routine-templates/1')
        .set('Cookie', authCookie())
        .send(validBody);

      expect(response.status).toBe(200);
      expect(service.update).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Hipertrofia' }));
    });

    it('should return 404 when updating a non-existent template', async () => {
      service.update.mockRejectedValue(new RoutineTemplateNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .put('/api/routine-templates/999')
        .set('Cookie', authCookie())
        .send(validBody);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/routine-templates/:id/duplicate', () => {
    it('should duplicate a template and return 201', async () => {
      service.duplicate.mockResolvedValue(sampleTemplate(2));
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/routine-templates/1/duplicate')
        .set('Cookie', authCookie());

      expect(response.status).toBe(201);
      expect(service.duplicate).toHaveBeenCalledWith(1);
    });

    it('should return 404 when the source does not exist', async () => {
      service.duplicate.mockRejectedValue(new RoutineTemplateNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/routine-templates/999/duplicate')
        .set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });
  });
});
