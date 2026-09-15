import {
  RoutineTemplateService,
  RoutineTemplateNotFoundError,
  UnknownExerciseError,
} from './routineTemplateService';
import { RoutineTemplate } from '../../domain/models/RoutineTemplate';
import { Exercise } from '../../domain/models/Exercise';
import { RoutineTemplateRepository } from '../../domain/repositories/RoutineTemplateRepository';
import { ExerciseRepository } from '../../domain/repositories/ExerciseRepository';

function buildTemplateRepoMock(): jest.Mocked<RoutineTemplateRepository> {
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

function buildExerciseRepoMock(): jest.Mocked<ExerciseRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  };
}

const input = {
  name: 'Hipertrofia',
  sessions: [
    { name: 'Sesión A', order: 0, entries: [{ exerciseId: 7, phase: 'main' as const, order: 0 }] },
  ],
};

function makeTemplate(id = 1): RoutineTemplate {
  return new RoutineTemplate({ id, name: 'Hipertrofia' });
}

function makeExercise(): Exercise {
  return new Exercise({ id: 7, name: 'Sentadilla', muscleGroup: 'Piernas', category: 'main' });
}

describe('RoutineTemplateService', () => {
  let templateRepo: jest.Mocked<RoutineTemplateRepository>;
  let exerciseRepo: jest.Mocked<ExerciseRepository>;
  let service: RoutineTemplateService;

  beforeEach(() => {
    jest.clearAllMocks();
    templateRepo = buildTemplateRepoMock();
    exerciseRepo = buildExerciseRepoMock();
    service = new RoutineTemplateService(templateRepo, exerciseRepo);
  });

  describe('create', () => {
    it('should create when all referenced exercises exist', async () => {
      exerciseRepo.findById.mockResolvedValue(makeExercise());
      templateRepo.create.mockResolvedValue(makeTemplate());

      const result = await service.create(input);

      expect(result.name).toBe('Hipertrofia');
      expect(templateRepo.create).toHaveBeenCalledWith(input);
    });

    it('should reject when an entry references an unknown exercise', async () => {
      exerciseRepo.findById.mockResolvedValue(null);

      await expect(service.create(input)).rejects.toThrow(UnknownExerciseError);
      expect(templateRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return the template when found', async () => {
      templateRepo.findById.mockResolvedValue(makeTemplate());

      expect((await service.findById(1)).id).toBe(1);
    });

    it('should throw when not found', async () => {
      templateRepo.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(RoutineTemplateNotFoundError);
    });
  });

  describe('list', () => {
    it('should return the library summaries', async () => {
      templateRepo.findAllLibrary.mockResolvedValue([
        { id: 1, name: 'Hipertrofia', objective: null, status: 'draft', sessionCount: 2 },
      ]);

      expect(await service.list()).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should replace nested data when the template exists and exercises are valid', async () => {
      templateRepo.findById.mockResolvedValue(makeTemplate());
      exerciseRepo.findById.mockResolvedValue(makeExercise());
      templateRepo.replaceNested.mockResolvedValue(makeTemplate());

      const result = await service.update(1, input);

      expect(result.id).toBe(1);
      expect(templateRepo.replaceNested).toHaveBeenCalledWith(1, input);
    });

    it('should throw when updating a non-existent template', async () => {
      templateRepo.findById.mockResolvedValue(null);

      await expect(service.update(999, input)).rejects.toThrow(RoutineTemplateNotFoundError);
      expect(templateRepo.replaceNested).not.toHaveBeenCalled();
    });
  });

  describe('duplicate', () => {
    it('should return the deep copy', async () => {
      templateRepo.duplicate.mockResolvedValue(new RoutineTemplate({ id: 2, name: 'Hipertrofia (copia)' }));

      const result = await service.duplicate(1);

      expect(result.id).toBe(2);
      expect(result.name).toBe('Hipertrofia (copia)');
    });

    it('should throw when the source template does not exist', async () => {
      templateRepo.duplicate.mockResolvedValue(null);

      await expect(service.duplicate(999)).rejects.toThrow(RoutineTemplateNotFoundError);
    });
  });
});
