import { ProgressService, ProgressEntryNotFoundError } from './progressService';
import { ClientNotFoundError } from './clientService';
import { ValidationError } from '../validator';
import { ProgressEntry } from '../../domain/models/ProgressEntry';
import { Client } from '../../domain/models/Client';
import { ProgressEntryRepository } from '../../domain/repositories/ProgressEntryRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

function buildProgressRepositoryMock(): jest.Mocked<ProgressEntryRepository> {
  return {
    create: jest.fn(),
    listByClientId: jest.fn(),
    findById: jest.fn(),
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

describe('ProgressService', () => {
  let progressRepo: jest.Mocked<ProgressEntryRepository>;
  let clientRepo: jest.Mocked<ClientRepository>;
  let service: ProgressService;

  beforeEach(() => {
    jest.clearAllMocks();
    progressRepo = buildProgressRepositoryMock();
    clientRepo = buildClientRepositoryMock();
    service = new ProgressService(progressRepo, clientRepo);
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
      expect(progressRepo.create).toHaveBeenCalledWith(10, expect.objectContaining({ weightKg: 80, waistCm: 85 }));
    });

    it('rejects an entry with no metric', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());

      await expect(service.record(10, { note: 'solo nota' })).rejects.toThrow(ValidationError);
      expect(progressRepo.create).not.toHaveBeenCalled();
    });

    it('throws when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.record(999, { weightKg: 80 })).rejects.toThrow(ClientNotFoundError);
      expect(progressRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('returns entries newest first with the weight summary', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      progressRepo.listByClientId.mockResolvedValue([
        entry(3, '2026-09-21T10:00:00.000Z', 78),
        entry(2, '2026-09-10T10:00:00.000Z', null), // no weight -> ignored for weight math
        entry(1, '2026-08-01T10:00:00.000Z', 82),
      ]);

      const result = await service.list(10);

      expect(result.entries[0].id).toBe(3);
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

  describe('remove', () => {
    it('deletes an existing entry', async () => {
      progressRepo.findById.mockResolvedValue(entry(5, '2026-09-21T10:00:00.000Z', 80));

      await service.remove(5);

      expect(progressRepo.delete).toHaveBeenCalledWith(5);
    });

    it('throws when the entry does not exist', async () => {
      progressRepo.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(ProgressEntryNotFoundError);
      expect(progressRepo.delete).not.toHaveBeenCalled();
    });
  });
});
