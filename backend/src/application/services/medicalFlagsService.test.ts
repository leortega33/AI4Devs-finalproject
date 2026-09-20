import { MedicalFlagsService } from './medicalFlagsService';
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

describe('MedicalFlagsService', () => {
  let medicalRepo: jest.Mocked<MedicalRecordRepository>;
  let clientRepo: jest.Mocked<ClientRepository>;
  let service: MedicalFlagsService;

  beforeEach(() => {
    jest.clearAllMocks();
    medicalRepo = buildMedicalRecordRepositoryMock();
    clientRepo = buildClientRepositoryMock();
    service = new MedicalFlagsService(medicalRepo, clientRepo);
  });

  it('flags regions from the medical record fields with details', async () => {
    clientRepo.findById.mockResolvedValue(makeClient());
    medicalRepo.findByClientId.mockResolvedValue(
      new MedicalRecord({ clientId: 10, injuries: 'Lesión de rodilla', preexistingConditions: 'Asma' }),
    );

    const result = await service.getFlags(10);

    expect(result.regions.sort()).toEqual(['cardio_respiratory', 'knee']);
    expect(result.details).toEqual(
      expect.arrayContaining([
        { region: 'knee', field: 'injuries', snippet: 'rodilla' },
        { region: 'cardio_respiratory', field: 'preexistingConditions', snippet: 'asma' },
      ]),
    );
  });

  it('returns empty flags when the client has no medical record', async () => {
    clientRepo.findById.mockResolvedValue(makeClient());
    medicalRepo.findByClientId.mockResolvedValue(null);

    expect(await service.getFlags(10)).toEqual({ regions: [], details: [] });
  });

  it('returns empty flags when nothing matches the dictionary', async () => {
    clientRepo.findById.mockResolvedValue(makeClient());
    medicalRepo.findByClientId.mockResolvedValue(
      new MedicalRecord({ clientId: 10, notes: 'Prefiere entrenar de mañana' }),
    );

    expect(await service.getFlags(10)).toEqual({ regions: [], details: [] });
  });

  it('does not scan the notes/medication/allergies fields', async () => {
    clientRepo.findById.mockResolvedValue(makeClient());
    // "rodilla" only in notes (not a scanned field) -> no flag.
    medicalRepo.findByClientId.mockResolvedValue(
      new MedicalRecord({ clientId: 10, notes: 'rodilla' }),
    );

    expect(await service.getFlags(10)).toEqual({ regions: [], details: [] });
  });

  it('throws when the client does not exist', async () => {
    clientRepo.findById.mockResolvedValue(null);

    await expect(service.getFlags(999)).rejects.toThrow(ClientNotFoundError);
    expect(medicalRepo.findByClientId).not.toHaveBeenCalled();
  });
});
