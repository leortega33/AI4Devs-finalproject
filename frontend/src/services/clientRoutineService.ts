import axios from 'axios';
import type { RoutineTemplate, RoutineTemplateInput } from './routineTemplateService';

import { API_BASE_URL } from './apiBaseUrl';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/clients`,
  withCredentials: true,
});

/** An assigned client routine: a routine template plus computed expiration fields. */
export interface ClientRoutine extends RoutineTemplate {
  clientId: number;
  sourceTemplateId?: number | null;
  startDate?: string | null;
  durationWeeks?: number | null;
  endDate?: string | null;
  isExpired?: boolean;
}

export interface RoutineHistoryItem {
  id: number;
  name: string;
  objective: string | null;
  status: 'draft' | 'active' | 'expired';
  sessionCount: number;
}

export interface AssignRoutineData {
  templateId: number;
  startDate: string;
  durationWeeks: number;
}

export const clientRoutineService = {
  getActive: async (clientId: number): Promise<ClientRoutine | null> => {
    const response = await api.get(`/${clientId}/routine`);
    return response.data.data;
  },

  assign: async (clientId: number, data: AssignRoutineData): Promise<ClientRoutine> => {
    const response = await api.post(`/${clientId}/routine`, data);
    return response.data.data;
  },

  adjust: async (clientId: number, data: RoutineTemplateInput): Promise<ClientRoutine> => {
    const response = await api.put(`/${clientId}/routine`, data);
    return response.data.data;
  },

  getHistory: async (clientId: number): Promise<RoutineHistoryItem[]> => {
    const response = await api.get(`/${clientId}/routines/history`);
    return response.data.data;
  },
};
