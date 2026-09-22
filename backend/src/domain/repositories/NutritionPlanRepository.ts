import { NutritionPlan } from '../models/NutritionPlan';

/** A food item to persist (order is derived from its array position). */
export interface NutritionFoodItemInput {
  description: string;
  quantity?: string | null;
}

/** A meal to persist (order is derived from its array position). */
export interface NutritionMealInput {
  name: string;
  note?: string | null;
  items: NutritionFoodItemInput[];
}

/** The whole plan to upsert for a client. */
export interface NutritionPlanInput {
  dailyCalories?: number | null;
  proteinTargetG?: number | null;
  generalNotes?: string | null;
  meals: NutritionMealInput[];
}

/** A read-only version snapshot of a plan. */
export interface NutritionPlanVersionRecord {
  id: number;
  snapshot: unknown;
  createdAt: Date;
}

/** Data access contract for client nutrition plans (see docs/backend-standards.md). */
export interface NutritionPlanRepository {
  findByClientId(clientId: number): Promise<NutritionPlan | null>;
  upsert(clientId: number, data: NutritionPlanInput): Promise<NutritionPlan>;
  listVersionsByClientId(clientId: number): Promise<NutritionPlanVersionRecord[]>;
}
