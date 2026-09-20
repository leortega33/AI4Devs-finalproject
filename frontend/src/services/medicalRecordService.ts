import axios from 'axios';

import { API_BASE_URL } from './apiBaseUrl';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/clients`,
  withCredentials: true,
});

export interface MedicalRecord {
  id: number;
  clientId: number;
  preexistingConditions?: string | null;
  injuries?: string | null;
  surgeriesOrProsthetics?: string | null;
  physicalRestrictions?: string | null;
  medication?: string | null;
  allergies?: string | null;
  bloodType?: string | null;
  notes?: string | null;
}

export interface MedicalRecordFormData {
  preexistingConditions?: string;
  injuries?: string;
  surgeriesOrProsthetics?: string;
  physicalRestrictions?: string;
  medication?: string;
  allergies?: string;
  bloodType?: string;
  notes?: string;
}

export interface MedicalRecordVersion {
  id: number;
  clientId: number;
  preexistingConditions?: string | null;
  injuries?: string | null;
  surgeriesOrProsthetics?: string | null;
  physicalRestrictions?: string | null;
  medication?: string | null;
  allergies?: string | null;
  bloodType?: string | null;
  notes?: string | null;
  createdAt: string;
}

export const medicalRecordService = {
  get: async (clientId: number): Promise<MedicalRecord | null> => {
    const response = await api.get(`/${clientId}/medical-record`);
    return response.data.data;
  },

  save: async (clientId: number, data: MedicalRecordFormData): Promise<MedicalRecord> => {
    const response = await api.put(`/${clientId}/medical-record`, data);
    return response.data.data;
  },

  getHistory: async (clientId: number): Promise<MedicalRecordVersion[]> => {
    const response = await api.get(`/${clientId}/medical-record/history`);
    return response.data.data;
  },
};
