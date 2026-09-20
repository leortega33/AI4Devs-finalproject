import axios from 'axios';

import { API_BASE_URL } from './apiBaseUrl';

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

export interface DashboardKpis {
  activeClients: number;
  upToDate: number;
  overdue: number;
  noPayments: number;
  monthlyIncome: number;
}

export interface Dashboard {
  overduePayments: PaymentAlert[];
  paymentsDueSoon: PaymentAlert[];
  noPayments: PaymentAlert[];
  expiringRoutines: RoutineAlert[];
  kpis: DashboardKpis;
}

export const dashboardService = {
  get: async (): Promise<Dashboard> => {
    const response = await dashboardApi.get('/');
    return response.data.data;
  },
};
