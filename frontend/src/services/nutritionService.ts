import axios from 'axios';

import { API_BASE_URL } from './apiBaseUrl';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/clients`,
  withCredentials: true,
});

export interface NutritionFoodItem {
  id?: number;
  description: string;
  quantity?: string | null;
}

export interface NutritionMeal {
  id?: number;
  name: string;
  note?: string | null;
  items: NutritionFoodItem[];
}

export interface NutritionPlan {
  dailyCalories: number | null;
  proteinTargetG: number | null;
  generalNotes: string | null;
  meals: NutritionMeal[];
}

export interface NutritionPlanVersion {
  id: number;
  snapshot: NutritionPlan;
  createdAt: string;
}

/** Input for saving a plan (ids/order are managed server-side). */
export interface SaveNutritionPlanData {
  dailyCalories?: number | null;
  proteinTargetG?: number | null;
  generalNotes?: string | null;
  meals: { name: string; note?: string | null; items: { description: string; quantity?: string | null }[] }[];
}

export const nutritionService = {
  getPlan: async (clientId: number): Promise<NutritionPlan> => {
    const response = await api.get(`/${clientId}/nutrition-plan`);
    return response.data.data;
  },

  savePlan: async (clientId: number, data: SaveNutritionPlanData): Promise<NutritionPlan> => {
    const response = await api.put(`/${clientId}/nutrition-plan`, data);
    return response.data.data;
  },

  getVersions: async (clientId: number): Promise<NutritionPlanVersion[]> => {
    const response = await api.get(`/${clientId}/nutrition-plan/versions`);
    return response.data.data;
  },
};
