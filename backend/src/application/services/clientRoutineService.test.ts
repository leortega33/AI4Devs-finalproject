import { ClientRoutineService } from './clientRoutineService';
import { ClientNotFoundError } from './clientService';
import {
  RoutineTemplateNotFoundError,
  UnknownExerciseError,
} from './routineTemplateService';
import { RoutineTemplate } from '../../domain/models/RoutineTemplate';
import { Client } from '../../domain/models/Client';
import { Exercise } from '../../domain/models/Exercise';
import { RoutineTemplateRepository } from '../../domain/repositories/RoutineTemplateRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ExerciseRepository } from '../../domain/repositories/ExerciseRepository';

function buildRoutineRepoMock(): jest.Mocked<RoutineTemplateRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findAllLibrary: jest.fn(),
    replaceNested: jest.fn(),
    duplicate: jest.fn(),
    assignCloneToClient: jest.fn(),
    findActiveByClient: jest.fn(),
    findHistoryByClient: jest.fn(),
  };
}

function buildClientRepoMock(): jest.Mocked<ClientRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByDni: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    setStatus: jest.fn(),
  };
}

function buildExerciseRepoMock(): jest.Mocked<ExerciseRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  };
}

function makeClient(): Client {
  return new Client({
    id: 3,
    firstName: 'John',
    lastName: 'Doe',
    dni: '12345678',
    phone: '+542604000000',
    email: 'john@example.com',
    birthDate: new Date('1990-01-01'),
  });
}

function makeExercise(): Exercise {
  return new Exercise({ id: 7, name: 'Sentadilla', muscleGroup: 'Piernas', category: 'main' });
}

function makeActiveRoutine(id = 5): RoutineTemplate {
  return new RoutineTemplate({ id, name: 'Rutina', clientId: 3, sourceTemplateId: 1, status: 'active' });
}

const assignData = { templateId: 1, startDate: new Date('2026-02-01'), durationWeeks: 4 };
const nestedInput = {
  name: 'Rutina',
  sessions: [{ name: 'Sesión A', order: 0, entries: [{ exerciseId: 7, phase: 'main' as const, order: 0 }] }],
};

describe('ClientRoutineService', () => {
  let routineRepo: jest.Mocked<RoutineTemplateRepository>;
  let clientRepo: jest.Mocked<ClientRepository>;
  let exerciseRepo: jest.Mocked<ExerciseRepository>;
  let service: ClientRoutineService;

  beforeEach(() => {
    jest.clearAllMocks();
    routineRepo = buildRoutineRepoMock();
    clientRepo = buildClientRepoMock();
    exerciseRepo = buildExerciseRepoMock();
    service = new ClientRoutineService(routineRepo, clientRepo, exerciseRepo);
  });

  describe('assign', () => {
    it('should clone the template to the client when both exist', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      routineRepo.assignCloneToClient.mockResolvedValue(makeActiveRoutine());

      const result = await service.assign(3, assignData);

      expect(result.clientId).toBe(3);
      expect(routineRepo.assignCloneToClient).toHaveBeenCalledWith(3, 1, assignData.startDate, 4);
    });

    it('should throw when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.assign(999, assignData)).rejects.toThrow(ClientNotFoundError);
      expect(routineRepo.assignCloneToClient).not.toHaveBeenCalled();
    });

    it('should throw when the template does not exist', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      routineRepo.assignCloneToClient.mockResolvedValue(null);

      await expect(service.assign(3, assignData)).rejects.toThrow(RoutineTemplateNotFoundError);
    });
  });

  describe('getActive', () => {
    it('should return the active routine when present', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      routineRepo.findActiveByClient.mockResolvedValue(makeActiveRoutine());

      expect((await service.getActive(3))?.id).toBe(5);
    });

    it('should return null when the client has no active routine', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      routineRepo.findActiveByClient.mockResolvedValue(null);

      expect(await service.getActive(3)).toBeNull();
    });

    it('should throw when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.getActive(999)).rejects.toThrow(ClientNotFoundError);
    });
  });

  describe('getHistory', () => {
    it('should return the client routine history', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      routineRepo.findHistoryByClient.mockResolvedValue([
        { id: 2, name: 'Anterior', objective: null, status: 'expired', sessionCount: 1 },
      ]);

      expect(await service.getHistory(3)).toHaveLength(1);
    });
  });

  describe('adjust', () => {
    it('should replace the active routine nested data when exercises exist', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      routineRepo.findActiveByClient.mockResolvedValue(makeActiveRoutine(5));
      exerciseRepo.findById.mockResolvedValue(makeExercise());
      routineRepo.replaceNested.mockResolvedValue(makeActiveRoutine(5));

      const result = await service.adjust(3, nestedInput);

      expect(result.id).toBe(5);
      expect(routineRepo.replaceNested).toHaveBeenCalledWith(5, nestedInput);
    });

    it('should throw when the client has no active routine', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      routineRepo.findActiveByClient.mockResolvedValue(null);

      await expect(service.adjust(3, nestedInput)).rejects.toThrow(RoutineTemplateNotFoundError);
      expect(routineRepo.replaceNested).not.toHaveBeenCalled();
    });

    it('should reject an unknown exercise reference', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      routineRepo.findActiveByClient.mockResolvedValue(makeActiveRoutine(5));
      exerciseRepo.findById.mockResolvedValue(null);

      await expect(service.adjust(3, nestedInput)).rejects.toThrow(UnknownExerciseError);
      expect(routineRepo.replaceNested).not.toHaveBeenCalled();
    });
  });
});
