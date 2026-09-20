import axios from 'axios';

import { API_BASE_URL } from './apiBaseUrl';
import type { RegionCode } from '../constants/bodyRegions';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/clients`,
  withCredentials: true,
});

export interface MedicalFlagDetail {
  region: RegionCode;
  field: string;
  snippet: string;
}

export interface MedicalFlags {
  regions: RegionCode[];
  details: MedicalFlagDetail[];
}

export const medicalFlagsService = {
  get: async (clientId: number): Promise<MedicalFlags> => {
    const response = await api.get(`/${clientId}/medical-flags`);
    return response.data.data;
  },
};
