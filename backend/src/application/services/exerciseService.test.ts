import { ExerciseService, ExerciseNotFoundError } from './exerciseService';
import { Exercise } from '../../domain/models/Exercise';
import { ExerciseRepository } from '../../domain/repositories/ExerciseRepository';

function buildRepositoryMock(): jest.Mocked<ExerciseRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  };
}

const input = {
  name: 'Back squat',
  muscleGroup: 'Legs',
  category: 'main' as const,
};

function makeExercise(overrides: Partial<{ id: number }> = {}): Exercise {
  return new Exercise({ ...input, id: overrides.id ?? 1 });
}

describe('ExerciseService', () => {
  let repository: jest.Mocked<ExerciseRepository>;
  let service: ExerciseService;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = buildRepositoryMock();
    service = new ExerciseService(repository);
  });

  describe('create', () => {
    it('should create an exercise', async () => {
      repository.create.mockResolvedValue(makeExercise());

      const result = await service.create(input);

      expect(result.name).toBe('Back squat');
      expect(repository.create).toHaveBeenCalledWith(input);
    });
  });

  describe('findById', () => {
    it('should return the exercise when found', async () => {
      repository.findById.mockResolvedValue(makeExercise());

      expect((await service.findById(1)).id).toBe(1);
    });

    it('should throw when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(ExerciseNotFoundError);
    });
  });

  describe('list', () => {
    it('should delegate filters to the repository', async () => {
      repository.findAll.mockResolvedValue([makeExercise()]);

      const result = await service.list({ search: 'squat', category: 'main' });

      expect(result).toHaveLength(1);
      expect(repository.findAll).toHaveBeenCalledWith({ search: 'squat', category: 'main' });
    });
  });

  describe('update', () => {
    it('should update an existing exercise', async () => {
      repository.findById.mockResolvedValue(makeExercise());
      repository.update.mockResolvedValue(makeExercise());

      const result = await service.update(1, input);

      expect(result.id).toBe(1);
      expect(repository.update).toHaveBeenCalledWith(1, input);
    });

    it('should throw when updating a non-existent exercise', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update(999, input)).rejects.toThrow(ExerciseNotFoundError);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
