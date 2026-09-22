import axios from 'axios';

import { API_BASE_URL } from './apiBaseUrl';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/clients`,
  withCredentials: true,
});

export interface ProgressPhoto {
  id: number;
  contentType: string;
}

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
  photos: ProgressPhoto[];
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

/** Builds a multipart body from the metric fields plus any selected photo files. */
function buildFormData(data: RecordProgressData, photos: File[]): FormData {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, String(value));
    }
  });
  photos.forEach((file) => form.append('photos', file));
  return form;
}

export const progressService = {
  list: async (clientId: number): Promise<ProgressListData> => {
    const response = await api.get(`/${clientId}/progress`);
    return response.data.data;
  },

  create: async (clientId: number, data: RecordProgressData, photos: File[] = []): Promise<ProgressEntry> => {
    const response = await api.post(`/${clientId}/progress`, buildFormData(data, photos));
    return response.data.data;
  },

  remove: async (clientId: number, id: number): Promise<void> => {
    await api.delete(`/${clientId}/progress/${id}`);
  },

  addPhotos: async (clientId: number, entryId: number, photos: File[]): Promise<ProgressPhoto[]> => {
    const form = new FormData();
    photos.forEach((file) => form.append('photos', file));
    const response = await api.post(`/${clientId}/progress/${entryId}/photos`, form);
    return response.data.data;
  },

  deletePhoto: async (clientId: number, entryId: number, photoId: number): Promise<void> => {
    await api.delete(`/${clientId}/progress/${entryId}/photos/${photoId}`);
  },

  photoUrl: (clientId: number, entryId: number, photoId: number): string =>
    `${API_BASE_URL}/api/clients/${clientId}/progress/${entryId}/photos/${photoId}`,
};
