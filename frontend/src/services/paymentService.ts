import axios from 'axios';

import { API_BASE_URL } from './apiBaseUrl';

const clientsApi = axios.create({
  baseURL: `${API_BASE_URL}/api/clients`,
  withCredentials: true,
});

const paymentsApi = axios.create({
  baseURL: `${API_BASE_URL}/api/payments`,
  withCredentials: true,
});

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card';
export type PaymentStatus = 'up_to_date' | 'overdue' | 'no_payments';

export interface Payment {
  id: number;
  clientId: number;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  periodMonth: number;
  periodYear: number;
}

export interface PaymentFormData {
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  periodMonth: number;
  periodYear: number;
}

export interface ClientPayments {
  payments: Payment[];
  status: PaymentStatus;
}

export const paymentService = {
  list: async (clientId: number): Promise<ClientPayments> => {
    const response = await clientsApi.get(`/${clientId}/payments`);
    return response.data.data;
  },

  create: async (clientId: number, data: PaymentFormData): Promise<Payment> => {
    const response = await clientsApi.post(`/${clientId}/payments`, data);
    return response.data.data;
  },

  update: async (id: number, data: PaymentFormData): Promise<Payment> => {
    const response = await paymentsApi.put(`/${id}`, data);
    return response.data.data;
  },

  remove: async (id: number): Promise<void> => {
    await paymentsApi.delete(`/${id}`);
  },

  exportPdf: async (clientId: number, lang: string): Promise<void> => {
    const response = await clientsApi.get(`/${clientId}/payments/export`, {
      params: { lang },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-history-${clientId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
