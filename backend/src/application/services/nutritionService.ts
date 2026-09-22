import { NutritionPlan } from '../../domain/models/NutritionPlan';
import {
  NutritionPlanRepository,
  NutritionPlanInput,
  NutritionPlanVersionRecord,
} from '../../domain/repositories/NutritionPlanRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ClientNotFoundError } from './clientService';

/** An empty plan payload returned when a client has no plan yet. */
export interface EmptyNutritionPlan {
  dailyCalories: null;
  proteinTargetG: null;
  generalNotes: null;
  meals: [];
}

/** Business logic for client nutrition plans (see US-027). */
export class NutritionService {
  constructor(
    private readonly nutritionPlanRepository: NutritionPlanRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  async getPlan(clientId: number): Promise<NutritionPlan | EmptyNutritionPlan> {
    await this.ensureClientExists(clientId);
    const plan = await this.nutritionPlanRepository.findByClientId(clientId);
    return plan ?? { dailyCalories: null, proteinTargetG: null, generalNotes: null, meals: [] };
  }

  async savePlan(clientId: number, data: NutritionPlanInput): Promise<NutritionPlan> {
    await this.ensureClientExists(clientId);
    return this.nutritionPlanRepository.upsert(clientId, data);
  }

  async getVersions(clientId: number): Promise<NutritionPlanVersionRecord[]> {
    await this.ensureClientExists(clientId);
    return this.nutritionPlanRepository.listVersionsByClientId(clientId);
  }

  private async ensureClientExists(clientId: number): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundError();
    }
  }
}
