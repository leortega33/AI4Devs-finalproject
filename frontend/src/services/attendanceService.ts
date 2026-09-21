import axios from 'axios';

import { API_BASE_URL } from './apiBaseUrl';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/clients`,
  withCredentials: true,
});

export interface Attendance {
  id: number;
  clientId: number;
  checkInAt: string;
  note?: string | null;
}

export interface AttendanceSummary {
  total: number;
  thisMonth: number;
  last30Days: number;
  lastCheckInAt: string | null;
}

export interface AttendanceListData {
  attendances: Attendance[];
  summary: AttendanceSummary;
}

export interface RecordAttendanceData {
  checkInAt?: string;
  note?: string;
}

export const attendanceService = {
  list: async (clientId: number): Promise<AttendanceListData> => {
    const response = await api.get(`/${clientId}/attendance`);
    return response.data.data;
  },

  create: async (clientId: number, data: RecordAttendanceData): Promise<Attendance> => {
    const response = await api.post(`/${clientId}/attendance`, data);
    return response.data.data;
  },

  remove: async (clientId: number, id: number): Promise<void> => {
    await api.delete(`/${clientId}/attendance/${id}`);
  },
};
