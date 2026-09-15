import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

export const medicalRecordService = {
  get: async (clientId: number): Promise<MedicalRecord | null> => {
    const response = await api.get(`/${clientId}/medical-record`);
    return response.data.data;
  },

  save: async (clientId: number, data: MedicalRecordFormData): Promise<MedicalRecord> => {
    const response = await api.put(`/${clientId}/medical-record`, data);
    return response.data.data;
  },
};
