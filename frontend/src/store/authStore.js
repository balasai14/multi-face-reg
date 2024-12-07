import { create } from 'zustand';
import axios from 'axios';

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  isCheckingAuth: true,
  token: null,

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      const response = await axios.get('/api/auth/check', {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        isAuthenticated: true,
        user: response.data.user,
        token,
        isCheckingAuth: false,
      });
    } catch (error) {
      set({ isAuthenticated: false, user: null, isCheckingAuth: false });
    }
  },

  login: async (rollNumber, faceDescriptor) => {
    try {
      const response = await axios.post('/api/auth/login', { rollNumber, faceDescriptor });
      const { token, user } = response.data;

      localStorage.setItem('authToken', token);

      set({
        isAuthenticated: true,
        user,
        token,
      });

      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed.' };
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    set({ isAuthenticated: false, user: null, token: null });
  },
}));
