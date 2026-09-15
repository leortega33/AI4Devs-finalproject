import { RoutineTemplate } from '../../domain/models/RoutineTemplate';
import {
  RoutineTemplateRepository,
  RoutineTemplateInput,
  RoutineTemplateSummary,
} from '../../domain/repositories/RoutineTemplateRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ExerciseRepository } from '../../domain/repositories/ExerciseRepository';
import { ClientNotFoundError } from './clientService';
import {
  RoutineTemplateNotFoundError,
  UnknownExerciseError,
} from './routineTemplateService';

export interface AssignRoutineData {
  templateId: number;
  startDate: Date;
  durationWeeks: number;
}

/** Business logic for assigning routines to clients (see US-006). */
export class ClientRoutineService {
  constructor(
    private readonly routineTemplateRepository: RoutineTemplateRepository,
    private readonly clientRepository: ClientRepository,
    private readonly exerciseRepository: ExerciseRepository,
  ) {}

  async assign(clientId: number, data: AssignRoutineData): Promise<RoutineTemplate> {
    await this.ensureClientExists(clientId);
    const routine = await this.routineTemplateRepository.assignCloneToClient(
      clientId,
      data.templateId,
      data.startDate,
      data.durationWeeks,
    );
    if (!routine) {
      throw new RoutineTemplateNotFoundError();
    }
    return routine;
  }

  async getActive(clientId: number): Promise<RoutineTemplate | null> {
    await this.ensureClientExists(clientId);
    return this.routineTemplateRepository.findActiveByClient(clientId);
  }

  async getHistory(clientId: number): Promise<RoutineTemplateSummary[]> {
    await this.ensureClientExists(clientId);
    return this.routineTemplateRepository.findHistoryByClient(clientId);
  }

  async adjust(clientId: number, data: RoutineTemplateInput): Promise<RoutineTemplate> {
    await this.ensureClientExists(clientId);
    const active = await this.routineTemplateRepository.findActiveByClient(clientId);
    if (!active || active.id === undefined) {
      throw new RoutineTemplateNotFoundError();
    }
    await this.assertExercisesExist(data);
    return this.routineTemplateRepository.replaceNested(active.id, data);
  }

  private async ensureClientExists(clientId: number): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundError();
    }
  }

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
