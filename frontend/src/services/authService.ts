import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const client = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
});

export interface AuthenticatedUser {
  id: number;
  email: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthenticatedUser> => {
    const response = await client.post('/login', { email, password });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await client.post('/logout');
  },

  getCurrentUser: async (): Promise<AuthenticatedUser | null> => {
    try {
      const response = await client.get('/me');
      return response.data.data;
    } catch {
      return null;
    }
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    await client.post('/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await client.post('/reset-password', { token, newPassword });
  },
};
