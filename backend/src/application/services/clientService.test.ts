import {
  ClientService,
  ClientNotFoundError,
  DuplicateDniError,
} from './clientService';
import { Client } from '../../domain/models/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

function buildRepositoryMock(): jest.Mocked<ClientRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByDni: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    setStatus: jest.fn(),
  };
}

const input = {
  firstName: 'John',
  lastName: 'Doe',
  dni: '12345678',
  phone: '+542604000000',
  email: 'john@example.com',
  birthDate: new Date('1990-01-01'),
};

function makeClient(overrides: Partial<{ id: number; dni: string }> = {}): Client {
  return new Client({ ...input, id: overrides.id ?? 1, dni: overrides.dni ?? input.dni });
}

describe('ClientService', () => {
  let repository: jest.Mocked<ClientRepository>;
  let service: ClientService;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = buildRepositoryMock();
    service = new ClientService(repository);
  });

  describe('create', () => {
    it('should create a client when the DNI is not taken', async () => {
      repository.findByDni.mockResolvedValue(null);
      repository.create.mockResolvedValue(makeClient());

      const result = await service.create(input);

      expect(result.dni).toBe('12345678');
      expect(repository.create).toHaveBeenCalledWith(input);
    });

    it('should reject a duplicate DNI', async () => {
      repository.findByDni.mockResolvedValue(makeClient());

      await expect(service.create(input)).rejects.toThrow(DuplicateDniError);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return the client when found', async () => {
      repository.findById.mockResolvedValue(makeClient());

      expect((await service.findById(1)).id).toBe(1);
    });

    it('should throw when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(ClientNotFoundError);
    });
  });

  describe('list', () => {
    it('should delegate filters to the repository', async () => {
      repository.findAll.mockResolvedValue([makeClient()]);

      const result = await service.list({ search: 'jo', status: 'active' });

      expect(result).toHaveLength(1);
      expect(repository.findAll).toHaveBeenCalledWith({ search: 'jo', status: 'active' });
    });
  });

  describe('update', () => {
    it('should update when the client exists and the DNI is free', async () => {
      repository.findById.mockResolvedValue(makeClient({ id: 1 }));
      repository.findByDni.mockResolvedValue(null);
      repository.update.mockResolvedValue(makeClient({ id: 1 }));

      await service.update(1, input);

      expect(repository.update).toHaveBeenCalledWith(1, input);
    });

    it('should allow keeping the same DNI on the same client', async () => {
      repository.findById.mockResolvedValue(makeClient({ id: 1 }));
      repository.findByDni.mockResolvedValue(makeClient({ id: 1 }));
      repository.update.mockResolvedValue(makeClient({ id: 1 }));

      await expect(service.update(1, input)).resolves.toBeDefined();
    });

    it('should reject when the DNI belongs to a different client', async () => {
      repository.findById.mockResolvedValue(makeClient({ id: 1 }));
      repository.findByDni.mockResolvedValue(makeClient({ id: 2 }));

      await expect(service.update(1, input)).rejects.toThrow(DuplicateDniError);
    });

    it('should throw when the client does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update(999, input)).rejects.toThrow(ClientNotFoundError);
    });
  });

  describe('setStatus', () => {
    it('should change the status when the client exists', async () => {
      repository.findById.mockResolvedValue(makeClient({ id: 1 }));
      repository.setStatus.mockResolvedValue(new Client({ ...input, id: 1, status: 'inactive' }));

      const result = await service.setStatus(1, 'inactive');

      expect(result.status).toBe('inactive');
    });

    it('should throw when the client does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.setStatus(999, 'inactive')).rejects.toThrow(ClientNotFoundError);
    });
  });
});
