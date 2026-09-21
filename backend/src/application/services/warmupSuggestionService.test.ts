import { WarmupSuggestionService } from './warmupSuggestionService';
import { ClientNotFoundError } from './clientService';
import { MedicalFlagsService } from './medicalFlagsService';
import { Exercise } from '../../domain/models/Exercise';
import { ExerciseRepository } from '../../domain/repositories/ExerciseRepository';

function buildExerciseRepositoryMock(): jest.Mocked<ExerciseRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  };
}

function buildFlagsServiceMock() {
  return { getFlags: jest.fn() } as unknown as jest.Mocked<MedicalFlagsService>;
}

const mobilityShoulder = new Exercise({
  id: 2,
  name: 'Movilidad de hombro',
  muscleGroup: 'Hombros',
  category: 'mobility',
  bodyRegions: ['shoulder'],
});
const activationKnee = new Exercise({
  id: 5,
  name: 'Caminata lateral con banda',
  muscleGroup: 'Glúteos',
  category: 'activation',
  bodyRegions: ['hip', 'knee'],
});
const mainKnee = new Exercise({
  id: 7,
  name: 'Sentadilla',
  muscleGroup: 'Piernas',
  category: 'main',
  bodyRegions: ['knee', 'hip', 'lower_back'],
});

describe('WarmupSuggestionService', () => {
  let flags: jest.Mocked<MedicalFlagsService>;
  let exercises: jest.Mocked<ExerciseRepository>;
  let service: WarmupSuggestionService;

  beforeEach(() => {
    jest.clearAllMocks();
    flags = buildFlagsServiceMock();
    exercises = buildExerciseRepositoryMock();
    service = new WarmupSuggestionService(flags, exercises);
    // findAll is called per warm-up category; return the eligible ones.
    exercises.findAll.mockImplementation(async ({ category }) => {
      if (category === 'mobility') return [mobilityShoulder];
      if (category === 'activation') return [activationKnee];
      return [];
    });
  });

  it('groups warm-up exercises by flagged region', async () => {
    flags.getFlags.mockResolvedValue({ regions: ['shoulder', 'knee'], details: [] });

    const result = await service.getSuggestions(10);

    expect(result.regions).toEqual(['shoulder', 'knee']);
    expect(result.suggestions).toEqual([
      { region: 'shoulder', exercises: [mobilityShoulder] },
      { region: 'knee', exercises: [activationKnee] },
    ]);
  });

  it('never suggests a main-category exercise', async () => {
    // Only a main-category exercise is tagged with knee -> no suggestion.
    exercises.findAll.mockResolvedValue([]);
    exercises.findAll.mockImplementationOnce(async () => []); // mobility
    exercises.findAll.mockImplementationOnce(async () => []); // activation
    flags.getFlags.mockResolvedValue({ regions: ['knee'], details: [] });

    const result = await service.getSuggestions(10);

    expect(result.suggestions).toEqual([]);
    // The main exercise was never even a candidate.
    expect(result.suggestions.flatMap((s) => s.exercises)).not.toContain(mainKnee);
  });

  it('returns empty suggestions when there are no flagged regions', async () => {
    flags.getFlags.mockResolvedValue({ regions: [], details: [] });

    const result = await service.getSuggestions(10);

    expect(result).toEqual({ regions: [], suggestions: [] });
    expect(exercises.findAll).not.toHaveBeenCalled();
  });

  it('omits a flagged region that has no matching warm-up exercise', async () => {
    flags.getFlags.mockResolvedValue({ regions: ['shoulder', 'ankle'], details: [] });

    const result = await service.getSuggestions(10);

    expect(result.suggestions.map((s) => s.region)).toEqual(['shoulder']);
  });

  it('propagates a not-found error from the flags service', async () => {
    flags.getFlags.mockRejectedValue(new ClientNotFoundError());

    await expect(service.getSuggestions(999)).rejects.toThrow(ClientNotFoundError);
    expect(exercises.findAll).not.toHaveBeenCalled();
  });
});
