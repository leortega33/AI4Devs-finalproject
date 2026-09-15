import { Exercise } from '../../domain/models/Exercise';
import {
  ExerciseRepository,
  ExerciseInput,
  ExerciseListFilters,
} from '../../domain/repositories/ExerciseRepository';

export class ExerciseNotFoundError extends Error {
  constructor() {
    super('Exercise not found');
    this.name = 'ExerciseNotFoundError';
  }
}

/** Business logic for the reusable exercise catalog (see US-004). No deletion. */
export class ExerciseService {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async create(data: ExerciseInput): Promise<Exercise> {
    return this.exerciseRepository.create(data);
  }

  async findById(id: number): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findById(id);
    if (!exercise) {
      throw new ExerciseNotFoundError();
    }
    return exercise;
  }

  async list(filters: ExerciseListFilters): Promise<Exercise[]> {
    return this.exerciseRepository.findAll(filters);
  }

  async update(id: number, data: ExerciseInput): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findById(id);
    if (!exercise) {
      throw new ExerciseNotFoundError();
    }
    return this.exerciseRepository.update(id, data);
  }
}
