import { RoutineTemplate } from '../../domain/models/RoutineTemplate';
import {
  RoutineTemplateRepository,
  RoutineTemplateInput,
  RoutineTemplateSummary,
} from '../../domain/repositories/RoutineTemplateRepository';
import { ExerciseRepository } from '../../domain/repositories/ExerciseRepository';

export class RoutineTemplateNotFoundError extends Error {
  constructor() {
    super('Routine template not found');
    this.name = 'RoutineTemplateNotFoundError';
  }
}

/** Business logic for reusable routine templates (see US-005). Library templates only. */
export class RoutineTemplateService {
  constructor(
    private readonly routineTemplateRepository: RoutineTemplateRepository,
    private readonly exerciseRepository: ExerciseRepository,
  ) {}

  async create(data: RoutineTemplateInput): Promise<RoutineTemplate> {
    await this.assertExercisesExist(data);
    return this.routineTemplateRepository.create(data);
  }

  async findById(id: number): Promise<RoutineTemplate> {
    const template = await this.routineTemplateRepository.findById(id);
    if (!template) {
      throw new RoutineTemplateNotFoundError();
    }
    return template;
  }

  /** Full nested routine for PDF/Excel export (US-017); throws when missing. */
  async getExportData(id: number): Promise<RoutineTemplate> {
    return this.findById(id);
  }

  async list(): Promise<RoutineTemplateSummary[]> {
    return this.routineTemplateRepository.findAllLibrary();
  }

  async update(id: number, data: RoutineTemplateInput): Promise<RoutineTemplate> {
    const template = await this.routineTemplateRepository.findById(id);
    if (!template) {
      throw new RoutineTemplateNotFoundError();
    }
    await this.assertExercisesExist(data);
    return this.routineTemplateRepository.replaceNested(id, data);
  }

  async duplicate(id: number): Promise<RoutineTemplate> {
    const copy = await this.routineTemplateRepository.duplicate(id);
    if (!copy) {
      throw new RoutineTemplateNotFoundError();
    }
    return copy;
  }

  /** Rejects the payload if any entry references an exercise that does not exist. */
  private async assertExercisesExist(data: RoutineTemplateInput): Promise<void> {
    const ids = new Set<number>();
    for (const session of data.sessions) {
      for (const entry of session.entries) {
        ids.add(entry.exerciseId);
      }
    }
    for (const id of ids) {
      const exercise = await this.exerciseRepository.findById(id);
      if (!exercise) {
        throw new UnknownExerciseError(id);
      }
    }
  }
}

/** Thrown when a routine entry references an exercise that is not in the catalog. */
export class UnknownExerciseError extends Error {
  constructor(exerciseId: number) {
    super(`Exercise ${exerciseId} does not exist`);
    this.name = 'UnknownExerciseError';
  }
}
