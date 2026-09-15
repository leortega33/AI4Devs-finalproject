import { Exercise, ExerciseCategory } from '../models/Exercise';

export interface ExerciseListFilters {
  search?: string;
  category?: ExerciseCategory;
}

/** Input data for creating or updating an exercise (no id). */
export interface ExerciseInput {
  name: string;
  muscleGroup: string;
  category: ExerciseCategory;
  defaultSets?: number | null;
  defaultReps?: number | null;
  technique?: string | null;
  equipment?: string | null;
}

/** Data access contract for the exercise catalog (no delete; see docs/backend-standards.md). */
export interface ExerciseRepository {
  create(data: ExerciseInput): Promise<Exercise>;
  findById(id: number): Promise<Exercise | null>;
  findAll(filters: ExerciseListFilters): Promise<Exercise[]>;
  update(id: number, data: ExerciseInput): Promise<Exercise>;
}
