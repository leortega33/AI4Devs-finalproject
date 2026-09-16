import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const dashboardApi = axios.create({
  baseURL: `${API_BASE_URL}/api/dashboard`,
  withCredentials: true,
});

export interface PaymentAlert {
  clientId: number;
  clientName: string;
  periodMonth?: number;
  periodYear?: number;
}

export interface RoutineAlert {
  clientId: number;
  clientName: string;
  endDate: string;
  expired: boolean;
}

export interface Dashboard {
  overduePayments: PaymentAlert[];
  paymentsDueSoon: PaymentAlert[];
  noPayments: PaymentAlert[];
  expiringRoutines: RoutineAlert[];
}

export const dashboardService = {
  get: async (): Promise<Dashboard> => {
    const response = await dashboardApi.get('/');
    return response.data.data;
  },
};
