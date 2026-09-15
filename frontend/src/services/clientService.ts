import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const client = axios.create({
  baseURL: `${API_BASE_URL}/api/clients`,
  withCredentials: true,
});

export type ClientStatus = 'active' | 'inactive';

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  birthDate: string;
  address?: string | null;
  goal?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
  status: ClientStatus;
  hasActiveRoutine?: boolean;
}

export interface ClientFormData {
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  birthDate: string;
  address?: string;
  goal?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface ClientListParams {
  search?: string;
  status?: ClientStatus;
}

export const clientService = {
  list: async (params: ClientListParams = {}): Promise<Client[]> => {
    const response = await client.get('/', { params });
    return response.data.data;
  },

  get: async (id: number): Promise<Client> => {
    const response = await client.get(`/${id}`);
    return response.data.data;
  },

  create: async (data: ClientFormData): Promise<Client> => {
    const response = await client.post('/', data);
    return response.data.data;
  },

  update: async (id: number, data: ClientFormData): Promise<Client> => {
    const response = await client.put(`/${id}`, data);
    return response.data.data;
  },

  setStatus: async (id: number, status: ClientStatus): Promise<Client> => {
    const response = await client.patch(`/${id}/status`, { status });
    return response.data.data;
  },
};
