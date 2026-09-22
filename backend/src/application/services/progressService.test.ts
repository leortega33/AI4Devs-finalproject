import {
  ProgressService,
  ProgressEntryNotFoundError,
  ProgressPhotoNotFoundError,
} from './progressService';
import { ClientNotFoundError } from './clientService';
import { ValidationError } from '../validator';
import { ProgressEntry } from '../../domain/models/ProgressEntry';
import { ProgressPhoto } from '../../domain/models/ProgressPhoto';
import { Client } from '../../domain/models/Client';
import { ProgressEntryRepository } from '../../domain/repositories/ProgressEntryRepository';
import { ProgressPhotoRepository } from '../../domain/repositories/ProgressPhotoRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { PhotoStorage } from '../../infrastructure/storage/photoStorage';

jest.mock('../imageProcessing', () => ({
  processProgressPhoto: jest.fn(async (file: { mimetype: string; buffer: Buffer }) => ({
    bytes: Buffer.concat([Buffer.from('webp:'), file.buffer]),
    contentType: 'image/webp',
  })),
}));

function buildProgressRepositoryMock(): jest.Mocked<ProgressEntryRepository> {
  return {
    create: jest.fn(),
    listByClientId: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  };
}

function buildPhotoRepositoryMock(): jest.Mocked<ProgressPhotoRepository> {
  return {
    create: jest.fn(),
    listByEntryId: jest.fn().mockResolvedValue([]),
    listByEntryIds: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    delete: jest.fn(),
  };
}

function buildStorageMock(): jest.Mocked<PhotoStorage> {
  return {
    save: jest.fn(),
    read: jest.fn(),
    delete: jest.fn(),
  };
}

function buildClientRepositoryMock(): jest.Mocked<ClientRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByDni: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    setStatus: jest.fn(),
  };
}

function makeClient(): Client {
  return new Client({
    id: 10,
    firstName: 'Ana',
    lastName: 'Gómez',
    dni: '30111222',
    phone: '+540000',
    email: 'ana@example.com',
    birthDate: new Date('1990-01-01'),
  });
}

function entry(id: number, date: string, weightKg: number | null): ProgressEntry {
  return new ProgressEntry({ id, clientId: 10, date: new Date(date), weightKg });
}

function photo(id: number, progressEntryId: number, key: string): ProgressPhoto {
  return new ProgressPhoto({ id, progressEntryId, storageKey: key, contentType: 'image/webp' });
}

describe('ProgressService', () => {
  let progressRepo: jest.Mocked<ProgressEntryRepository>;
  let photoRepo: jest.Mocked<ProgressPhotoRepository>;
  let storage: jest.Mocked<PhotoStorage>;
  let clientRepo: jest.Mocked<ClientRepository>;
  let service: ProgressService;

  beforeEach(() => {
    jest.clearAllMocks();
    progressRepo = buildProgressRepositoryMock();
    photoRepo = buildPhotoRepositoryMock();
    storage = buildStorageMock();
    clientRepo = buildClientRepositoryMock();
    service = new ProgressService(progressRepo, clientRepo, photoRepo, storage);
  });

  describe('record', () => {
    it('defaults the date to now and stores the metrics', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      progressRepo.create.mockImplementation(async (clientId, data) => new ProgressEntry({ id: 1, clientId, ...data }));

      const before = Date.now();
      const result = await service.record(10, { weightKg: 80, waistCm: 85 });
      const after = Date.now();

      expect(result.date.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.date.getTime()).toBeLessThanOrEqual(after);
      expect(result.photos).toEqual([]);
      expect(progressRepo.create).toHaveBeenCalledWith(10, expect.objectContaining({ weightKg: 80, waistCm: 85 }));
    });

    it('records a photo-only entry (no metric)', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      progressRepo.create.mockImplementation(async (clientId, data) => new ProgressEntry({ id: 5, clientId, ...data }));
      storage.save.mockResolvedValue('key-1.webp');
      photoRepo.create.mockResolvedValue(photo(1, 5, 'key-1.webp'));

      const result = await service.record(10, {}, [{ mimetype: 'image/png', buffer: Buffer.from('img') }]);

      expect(result.photos).toEqual([{ id: 1, contentType: 'image/webp' }]);
      expect(storage.save).toHaveBeenCalledTimes(1);
      expect(photoRepo.create).toHaveBeenCalledWith(5, { storageKey: 'key-1.webp', contentType: 'image/webp' });
    });

    it('rejects an entry with no metric and no photo', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());

      await expect(service.record(10, { note: 'solo nota' })).rejects.toThrow(ValidationError);
      expect(progressRepo.create).not.toHaveBeenCalled();
    });

    it('rolls back the entry and stored files when a photo fails', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      progressRepo.create.mockResolvedValue(entry(9, '2026-09-21T10:00:00.000Z', null));
      storage.save.mockResolvedValueOnce('key-a.webp');
      photoRepo.create.mockRejectedValueOnce(new Error('db down'));

      await expect(
        service.record(10, {}, [{ mimetype: 'image/png', buffer: Buffer.from('a') }]),
      ).rejects.toThrow('db down');
      expect(storage.delete).toHaveBeenCalledWith('key-a.webp');
      expect(progressRepo.delete).toHaveBeenCalledWith(9);
    });

    it('throws when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.record(999, { weightKg: 80 })).rejects.toThrow(ClientNotFoundError);
      expect(progressRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('returns entries newest first with photos and the weight summary', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      progressRepo.listByClientId.mockResolvedValue([
        entry(3, '2026-09-21T10:00:00.000Z', 78),
        entry(2, '2026-09-10T10:00:00.000Z', null),
        entry(1, '2026-08-01T10:00:00.000Z', 82),
      ]);
      photoRepo.listByEntryIds.mockResolvedValue([photo(11, 3, 'k11.webp'), photo(12, 3, 'k12.webp')]);

      const result = await service.list(10);

      expect(result.entries[0].id).toBe(3);
      expect(result.entries[0].photos).toEqual([
        { id: 11, contentType: 'image/webp' },
        { id: 12, contentType: 'image/webp' },
      ]);
      expect(result.entries[1].photos).toEqual([]);
      expect(result.summary).toEqual({ latestWeightKg: 78, weightChangeKg: -4, entryCount: 3 });
    });

    it('reports no weight change when fewer than two weighed entries', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      progressRepo.listByClientId.mockResolvedValue([entry(1, '2026-09-21T10:00:00.000Z', 80)]);

      const result = await service.list(10);

      expect(result.summary).toEqual({ latestWeightKg: 80, weightChangeKg: null, entryCount: 1 });
    });

    it('returns an empty summary for no entries', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      progressRepo.listByClientId.mockResolvedValue([]);

      const result = await service.list(10);

      expect(result.summary).toEqual({ latestWeightKg: null, weightChangeKg: null, entryCount: 0 });
    });

    it('throws when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.list(999)).rejects.toThrow(ClientNotFoundError);
    });
  });

  describe('addPhotos', () => {
    it('stores photos for an existing entry', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      progressRepo.findById.mockResolvedValue(entry(7, '2026-09-21T10:00:00.000Z', null));
      storage.save.mockResolvedValue('k.webp');
      photoRepo.create.mockResolvedValue(photo(20, 7, 'k.webp'));

      const result = await service.addPhotos(10, 7, [{ mimetype: 'image/png', buffer: Buffer.from('x') }]);

      expect(result).toEqual([{ id: 20, contentType: 'image/webp' }]);
    });

    it('throws when the entry does not belong to the client', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      progressRepo.findById.mockResolvedValue(new ProgressEntry({ id: 7, clientId: 99, date: new Date() }));

      await expect(
        service.addPhotos(10, 7, [{ mimetype: 'image/png', buffer: Buffer.from('x') }]),
      ).rejects.toThrow(ProgressEntryNotFoundError);
    });

    it('throws when the entry does not exist', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      progressRepo.findById.mockResolvedValue(null);

      await expect(
        service.addPhotos(10, 7, [{ mimetype: 'image/png', buffer: Buffer.from('x') }]),
      ).rejects.toThrow(ProgressEntryNotFoundError);
    });
  });

  describe('getPhoto', () => {
    it('reads the stored bytes for a photo', async () => {
      photoRepo.findById.mockResolvedValue(photo(30, 7, 'k30.webp'));
      storage.read.mockResolvedValue(Buffer.from('bytes'));

      const result = await service.getPhoto(30);

      expect(result.contentType).toBe('image/webp');
      expect(result.bytes.toString()).toBe('bytes');
      expect(storage.read).toHaveBeenCalledWith('k30.webp');
    });

    it('throws when the photo does not exist', async () => {
      photoRepo.findById.mockResolvedValue(null);

      await expect(service.getPhoto(999)).rejects.toThrow(ProgressPhotoNotFoundError);
    });
  });

  describe('removePhoto', () => {
    it('deletes the file then the row', async () => {
      photoRepo.findById.mockResolvedValue(photo(40, 7, 'k40.webp'));

      await service.removePhoto(40);

      expect(storage.delete).toHaveBeenCalledWith('k40.webp');
      expect(photoRepo.delete).toHaveBeenCalledWith(40);
    });

    it('throws when the photo does not exist', async () => {
      photoRepo.findById.mockResolvedValue(null);

      await expect(service.removePhoto(999)).rejects.toThrow(ProgressPhotoNotFoundError);
      expect(photoRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes the entry photo files before the entry', async () => {
      progressRepo.findById.mockResolvedValue(entry(5, '2026-09-21T10:00:00.000Z', 80));
      photoRepo.listByEntryId.mockResolvedValue([photo(50, 5, 'k50.webp'), photo(51, 5, 'k51.webp')]);

      await service.remove(5);

      expect(storage.delete).toHaveBeenCalledWith('k50.webp');
      expect(storage.delete).toHaveBeenCalledWith('k51.webp');
      expect(progressRepo.delete).toHaveBeenCalledWith(5);
    });

    it('throws when the entry does not exist', async () => {
      progressRepo.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(ProgressEntryNotFoundError);
      expect(progressRepo.delete).not.toHaveBeenCalled();
    });
  });
});
