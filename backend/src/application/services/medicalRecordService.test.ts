import { MedicalRecordService } from './medicalRecordService';
import { ClientNotFoundError } from './clientService';
import { MedicalRecord } from '../../domain/models/MedicalRecord';
import { MedicalRecordVersion } from '../../domain/models/MedicalRecordVersion';
import { Client } from '../../domain/models/Client';
import { MedicalRecordRepository } from '../../domain/repositories/MedicalRecordRepository';
import { MedicalRecordVersionRepository } from '../../domain/repositories/MedicalRecordVersionRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

function buildMedicalRecordRepositoryMock(): jest.Mocked<MedicalRecordRepository> {
  return {
    findByClientId: jest.fn(),
    upsert: jest.fn(),
  };
}

function buildMedicalRecordVersionRepositoryMock(): jest.Mocked<MedicalRecordVersionRepository> {
  return {
    create: jest.fn(),
    listByClientId: jest.fn(),
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
    firstName: 'John',
    lastName: 'Doe',
    dni: '12345678',
    phone: '+542604000000',
    email: 'john@example.com',
    birthDate: new Date('1990-01-01'),
  });
}

describe('MedicalRecordService', () => {
  let medicalRepo: jest.Mocked<MedicalRecordRepository>;
  let clientRepo: jest.Mocked<ClientRepository>;
  let versionRepo: jest.Mocked<MedicalRecordVersionRepository>;
  let service: MedicalRecordService;

  beforeEach(() => {
    jest.clearAllMocks();
    medicalRepo = buildMedicalRecordRepositoryMock();
    clientRepo = buildClientRepositoryMock();
    versionRepo = buildMedicalRecordVersionRepositoryMock();
    service = new MedicalRecordService(medicalRepo, clientRepo, versionRepo);
  });

  describe('getByClientId', () => {
    it('should return the record when it exists', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      medicalRepo.findByClientId.mockResolvedValue(new MedicalRecord({ clientId: 10, bloodType: 'O+' }));

      const result = await service.getByClientId(10);

      expect(result?.bloodType).toBe('O+');
    });

    it('should return null when the client has no record yet', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      medicalRepo.findByClientId.mockResolvedValue(null);

      expect(await service.getByClientId(10)).toBeNull();
    });

    it('should throw when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.getByClientId(999)).rejects.toThrow(ClientNotFoundError);
      expect(medicalRepo.findByClientId).not.toHaveBeenCalled();
    });
  });

  describe('upsert', () => {
    it('should create or update the record for an existing client', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      const saved = new MedicalRecord({ id: 1, clientId: 10, injuries: 'Knee' });
      medicalRepo.upsert.mockResolvedValue(saved);

      const result = await service.upsert(10, { injuries: 'Knee' });

      expect(result.injuries).toBe('Knee');
      expect(medicalRepo.upsert).toHaveBeenCalledWith(10, { injuries: 'Knee' });
    });

    it('should record a version snapshot of the saved state', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      const saved = new MedicalRecord({ id: 1, clientId: 10, injuries: 'Knee', bloodType: 'O+' });
      medicalRepo.upsert.mockResolvedValue(saved);

      await service.upsert(10, { injuries: 'Knee', bloodType: 'O+' });

      expect(versionRepo.create).toHaveBeenCalledWith(10, {
        preexistingConditions: null,
        injuries: 'Knee',
        surgeriesOrProsthetics: null,
        physicalRestrictions: null,
        medication: null,
        allergies: null,
        bloodType: 'O+',
        notes: null,
      });
    });

    it('should throw when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.upsert(999, {})).rejects.toThrow(ClientNotFoundError);
      expect(medicalRepo.upsert).not.toHaveBeenCalled();
      expect(versionRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should return the client versions newest first', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      const versions = [
        new MedicalRecordVersion({ id: 2, clientId: 10, injuries: 'Knee', createdAt: new Date('2026-02-01') }),
        new MedicalRecordVersion({ id: 1, clientId: 10, createdAt: new Date('2026-01-01') }),
      ];
      versionRepo.listByClientId.mockResolvedValue(versions);

      const result = await service.getHistory(10);

      expect(result).toBe(versions);
      expect(versionRepo.listByClientId).toHaveBeenCalledWith(10);
    });

    it('should return an empty history when nothing was saved', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      versionRepo.listByClientId.mockResolvedValue([]);

      expect(await service.getHistory(10)).toEqual([]);
    });

    it('should throw when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.getHistory(999)).rejects.toThrow(ClientNotFoundError);
      expect(versionRepo.listByClientId).not.toHaveBeenCalled();
    });
  });
});
