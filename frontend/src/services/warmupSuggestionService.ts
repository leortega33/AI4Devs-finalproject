import axios from 'axios';

import { API_BASE_URL } from './apiBaseUrl';
import type { Exercise } from './exerciseService';
import type { RegionCode } from '../constants/bodyRegions';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/clients`,
  withCredentials: true,
});

export interface WarmupSuggestionGroup {
  region: RegionCode;
  exercises: Exercise[];
}

export interface WarmupSuggestions {
  regions: RegionCode[];
  suggestions: WarmupSuggestionGroup[];
}

export const warmupSuggestionService = {
  get: async (clientId: number): Promise<WarmupSuggestions> => {
    const response = await api.get(`/${clientId}/warmup-suggestions`);
    return response.data.data;
  },
};
