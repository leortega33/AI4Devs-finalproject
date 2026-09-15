import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/exercises`,
  withCredentials: true,
});

export type ExerciseCategory = 'mobility' | 'activation' | 'main';

export interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  category: ExerciseCategory;
  defaultSets?: number | null;
  defaultReps?: number | null;
  technique?: string | null;
  equipment?: string | null;
}

export interface ExerciseFormData {
  name: string;
  muscleGroup: string;
  category: ExerciseCategory;
  defaultSets?: number | null;
  defaultReps?: number | null;
  technique?: string | null;
  equipment?: string | null;
}

export interface ExerciseListParams {
  search?: string;
  category?: ExerciseCategory;
}

export const exerciseService = {
  list: async (params: ExerciseListParams = {}): Promise<Exercise[]> => {
    const response = await api.get('/', { params });
    return response.data.data;
  },

  get: async (id: number): Promise<Exercise> => {
    const response = await api.get(`/${id}`);
    return response.data.data;
  },

  create: async (data: ExerciseFormData): Promise<Exercise> => {
    const response = await api.post('/', data);
    return response.data.data;
  },

  update: async (id: number, data: ExerciseFormData): Promise<Exercise> => {
    const response = await api.put(`/${id}`, data);
    return response.data.data;
  },
};
