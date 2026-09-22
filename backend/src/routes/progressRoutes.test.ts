import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createClientProgressRoutes } from './progressRoutes';
import {
  ProgressService,
  ProgressEntryNotFoundError,
  ProgressPhotoNotFoundError,
} from '../application/services/progressService';
import { ClientNotFoundError } from '../application/services/clientService';
import { ValidationError } from '../application/validator';
import { ProgressEntry } from '../domain/models/ProgressEntry';
import { errorHandler } from '../middleware/errorHandler';

const JWT_SECRET = 'test-secret';

function buildApp(service: ProgressService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/clients/:clientId/progress', createClientProgressRoutes(service, JWT_SECRET));
  app.use(errorHandler);
  return app;
}

function authCookie() {
  return [`session=${jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' })}`];
}

describe('progressRoutes', () => {
  let service: jest.Mocked<ProgressService>;

  beforeEach(() => {
    service = {
      record: jest.fn(),
      list: jest.fn(),
      remove: jest.fn(),
      addPhotos: jest.fn(),
      getPhoto: jest.fn(),
      removePhoto: jest.fn(),
    } as unknown as jest.Mocked<ProgressService>;
  });

  it('should reject any request without a session cookie with 401', async () => {
    const app = buildApp(service);
    const response = await request(app).get('/api/clients/10/progress');
    expect(response.status).toBe(401);
  });

  describe('POST /api/clients/:clientId/progress', () => {
    it('should record an entry and return 201', async () => {
      service.record.mockResolvedValue(
        Object.assign(
          new ProgressEntry({ id: 1, clientId: 10, date: new Date('2026-09-21T10:00:00.000Z'), weightKg: 80 }),
          { photos: [] },
        ),
      );
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/10/progress')
        .set('Cookie', authCookie())
        .send({ weightKg: 80 });

      expect(response.status).toBe(201);
      expect(response.body.data.weightKg).toBe(80);
      expect(service.record).toHaveBeenCalledWith(10, expect.objectContaining({ weightKg: 80 }), []);
    });

    it('should record a photo-only entry from multipart and return 201', async () => {
      service.record.mockResolvedValue(
        Object.assign(new ProgressEntry({ id: 2, clientId: 10, date: new Date() }), {
          photos: [{ id: 5, contentType: 'image/webp' }],
        }),
      );
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/10/progress')
        .set('Cookie', authCookie())
        .attach('photos', Buffer.from('fake-image'), { filename: 'p.png', contentType: 'image/png' });

      expect(response.status).toBe(201);
      expect(response.body.data.photos).toHaveLength(1);
      const files = service.record.mock.calls[0][2] ?? [];
      expect(files).toHaveLength(1);
      expect(files[0].mimetype).toBe('image/png');
    });

    it('should return 400 when the service rejects an empty entry', async () => {
      service.record.mockRejectedValue(new ValidationError('At least one measurement or photo is required'));
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/10/progress')
        .set('Cookie', authCookie())
        .send({ note: 'solo nota' });

      expect(response.status).toBe(400);
    });

    it('should return 400 for a negative metric', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/10/progress')
        .set('Cookie', authCookie())
        .send({ weightKg: -1 });

      expect(response.status).toBe(400);
      expect(service.record).not.toHaveBeenCalled();
    });

    it('should return 400 for an unsupported photo type', async () => {
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/10/progress')
        .set('Cookie', authCookie())
        .attach('photos', Buffer.from('gif'), { filename: 'p.gif', contentType: 'image/gif' });

      expect(response.status).toBe(400);
      expect(service.record).not.toHaveBeenCalled();
    });

    it('should return 404 for a non-existent client', async () => {
      service.record.mockRejectedValue(new ClientNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/999/progress')
        .set('Cookie', authCookie())
        .send({ weightKg: 80 });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/clients/:clientId/progress', () => {
    it('should return the entries and summary', async () => {
      service.list.mockResolvedValue({
        entries: [
          Object.assign(
            new ProgressEntry({ id: 1, clientId: 10, date: new Date('2026-09-21T10:00:00.000Z'), weightKg: 80 }),
            { photos: [{ id: 3, contentType: 'image/webp' }] },
          ),
        ],
        summary: { latestWeightKg: 80, weightChangeKg: null, entryCount: 1 },
      });
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/10/progress').set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.body.data.entries).toHaveLength(1);
      expect(response.body.data.entries[0].photos).toHaveLength(1);
      expect(response.body.data.summary.latestWeightKg).toBe(80);
    });

    it('should return 404 for a non-existent client', async () => {
      service.list.mockRejectedValue(new ClientNotFoundError());
      const app = buildApp(service);

      const response = await request(app).get('/api/clients/999/progress').set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/clients/:clientId/progress/:id', () => {
    it('should delete an entry and return 204', async () => {
      service.remove.mockResolvedValue(undefined);
      const app = buildApp(service);

      const response = await request(app).delete('/api/clients/10/progress/1').set('Cookie', authCookie());

      expect(response.status).toBe(204);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should return 404 when the entry does not exist', async () => {
      service.remove.mockRejectedValue(new ProgressEntryNotFoundError());
      const app = buildApp(service);

      const response = await request(app).delete('/api/clients/10/progress/999').set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/clients/:clientId/progress/:entryId/photos', () => {
    it('should add a photo and return 201', async () => {
      service.addPhotos.mockResolvedValue([{ id: 9, contentType: 'image/webp' }]);
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/10/progress/7/photos')
        .set('Cookie', authCookie())
        .attach('photos', Buffer.from('img'), { filename: 'p.png', contentType: 'image/png' });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveLength(1);
      expect(service.addPhotos).toHaveBeenCalledWith(10, 7, expect.any(Array));
    });

    it('should return 404 when the entry does not exist', async () => {
      service.addPhotos.mockRejectedValue(new ProgressEntryNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .post('/api/clients/10/progress/999/photos')
        .set('Cookie', authCookie())
        .attach('photos', Buffer.from('img'), { filename: 'p.png', contentType: 'image/png' });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/clients/:clientId/progress/:entryId/photos/:photoId', () => {
    it('should stream the photo bytes with its content type', async () => {
      service.getPhoto.mockResolvedValue({ bytes: Buffer.from('image-bytes'), contentType: 'image/webp' });
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/clients/10/progress/7/photos/9')
        .set('Cookie', authCookie());

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('image/webp');
      expect(service.getPhoto).toHaveBeenCalledWith(9);
    });

    it('should return 404 for a non-existent photo', async () => {
      service.getPhoto.mockRejectedValue(new ProgressPhotoNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .get('/api/clients/10/progress/7/photos/999')
        .set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/clients/:clientId/progress/:entryId/photos/:photoId', () => {
    it('should delete a photo and return 204', async () => {
      service.removePhoto.mockResolvedValue(undefined);
      const app = buildApp(service);

      const response = await request(app)
        .delete('/api/clients/10/progress/7/photos/9')
        .set('Cookie', authCookie());

      expect(response.status).toBe(204);
      expect(service.removePhoto).toHaveBeenCalledWith(9);
    });

    it('should return 404 when the photo does not exist', async () => {
      service.removePhoto.mockRejectedValue(new ProgressPhotoNotFoundError());
      const app = buildApp(service);

      const response = await request(app)
        .delete('/api/clients/10/progress/7/photos/999')
        .set('Cookie', authCookie());

      expect(response.status).toBe(404);
    });
  });
});
