import axios from 'axios';

import { API_BASE_URL } from './apiBaseUrl';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/routine-templates`,
  withCredentials: true,
});

export type RoutinePhase = 'warmup' | 'main';
export type RoutineStatus = 'draft' | 'active' | 'expired';

export interface RoutineExerciseEntry {
  id?: number;
  exerciseId: number;
  exerciseName?: string;
  phase: RoutinePhase;
  block?: string | null;
  kg?: number | null;
  reps?: number | null;
  series?: number | null;
  notes?: string | null;
  order: number;
}

export interface RoutineSession {
  id?: number;
  name: string;
  warmupPrescription?: string | null;
  order: number;
  entries: RoutineExerciseEntry[];
}

export interface RoutineTemplate {
  id: number;
  name: string;
  description?: string | null;
  objective?: string | null;
  generalConsiderations?: string | null;
  status: RoutineStatus;
  sessions: RoutineSession[];
}

export interface RoutineTemplateSummary {
  id: number;
  name: string;
  objective: string | null;
  status: RoutineStatus;
  sessionCount: number;
}

export interface RoutineExerciseEntryInput {
  exerciseId: number;
  phase: RoutinePhase;
  block?: string | null;
  kg?: number | null;
  reps?: number | null;
  series?: number | null;
  notes?: string | null;
  order: number;
}

export interface RoutineSessionInput {
  name: string;
  warmupPrescription?: string | null;
  order: number;
  entries: RoutineExerciseEntryInput[];
}

export interface RoutineTemplateInput {
  name: string;
  description?: string | null;
  objective?: string | null;
  generalConsiderations?: string | null;
  sessions: RoutineSessionInput[];
}

export const routineTemplateService = {
  list: async (): Promise<RoutineTemplateSummary[]> => {
    const response = await api.get('/');
    return response.data.data;
  },

  get: async (id: number): Promise<RoutineTemplate> => {
    const response = await api.get(`/${id}`);
    return response.data.data;
  },

  create: async (data: RoutineTemplateInput): Promise<RoutineTemplate> => {
    const response = await api.post('/', data);
    return response.data.data;
  },

  update: async (id: number, data: RoutineTemplateInput): Promise<RoutineTemplate> => {
    const response = await api.put(`/${id}`, data);
    return response.data.data;
  },

  duplicate: async (id: number): Promise<RoutineTemplate> => {
    const response = await api.post(`/${id}/duplicate`);
    return response.data.data;
  },

  exportPdf: async (id: number, lang: string): Promise<void> => {
    await downloadRoutineExport(id, 'pdf', 'application/pdf', lang);
  },

  exportExcel: async (id: number, lang: string): Promise<void> => {
    await downloadRoutineExport(
      id,
      'xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      lang,
    );
  },
};

async function downloadRoutineExport(
  id: number,
  extension: 'pdf' | 'xlsx',
  contentType: string,
  lang: string,
): Promise<void> {
  const response = await api.get(`/${id}/export.${extension}`, {
    params: { lang },
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `routine-${id}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
