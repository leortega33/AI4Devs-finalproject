import { MedicalRecordService } from './medicalRecordService';
import { ClientNotFoundError } from './clientService';
import { MedicalRecord } from '../../domain/models/MedicalRecord';
import { Client } from '../../domain/models/Client';
import { MedicalRecordRepository } from '../../domain/repositories/MedicalRecordRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

function buildMedicalRecordRepositoryMock(): jest.Mocked<MedicalRecordRepository> {
  return {
    findByClientId: jest.fn(),
    upsert: jest.fn(),
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
  let service: MedicalRecordService;

  beforeEach(() => {
    jest.clearAllMocks();
    medicalRepo = buildMedicalRecordRepositoryMock();
    clientRepo = buildClientRepositoryMock();
    service = new MedicalRecordService(medicalRepo, clientRepo);
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

    it('should throw when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.upsert(999, {})).rejects.toThrow(ClientNotFoundError);
      expect(medicalRepo.upsert).not.toHaveBeenCalled();
    });
  });
});
