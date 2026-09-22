import axios from 'axios';

import { API_BASE_URL } from './apiBaseUrl';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/clients`,
  withCredentials: true,
});

export interface ProgressEntry {
  id: number;
  clientId: number;
  date: string;
  weightKg?: number | null;
  bodyFatPercent?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  note?: string | null;
}

export interface ProgressSummary {
  latestWeightKg: number | null;
  weightChangeKg: number | null;
  entryCount: number;
}

export interface ProgressListData {
  entries: ProgressEntry[];
  summary: ProgressSummary;
}

export interface RecordProgressData {
  date?: string;
  weightKg?: number | null;
  bodyFatPercent?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  note?: string;
}

export const progressService = {
  list: async (clientId: number): Promise<ProgressListData> => {
    const response = await api.get(`/${clientId}/progress`);
    return response.data.data;
  },

  create: async (clientId: number, data: RecordProgressData): Promise<ProgressEntry> => {
    const response = await api.post(`/${clientId}/progress`, data);
    return response.data.data;
  },

  remove: async (clientId: number, id: number): Promise<void> => {
    await api.delete(`/${clientId}/progress/${id}`);
  },
};
