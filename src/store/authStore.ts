import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/authApi';

interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login({ email, password });
      const { accessToken, ...userData } = response.data.data;
      
      if (userData.role !== 'CUSTOMER') {
        throw new Error('Access denied. Please use the Driver App to login.');
      }
      
      await AsyncStorage.setItem('auth_token', accessToken);
      await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
      set({ token: accessToken, user: userData, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phoneNo: data.phoneNumber,
        role: 'CUSTOMER'
      };
      console.log('Sending Registration Payload to Backend:', JSON.stringify(payload, null, 2));
      await authApi.register(payload);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Registration API Error:', error?.response?.data || error.message);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    set({ token: null, user: null });
  },

  loadToken: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userStr = await AsyncStorage.getItem('auth_user');
      
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr) });
        return true;
      } else {
        // If either token or user is missing, force login
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('auth_user');
        set({ token: null, user: null });
        return false;
      }
    } catch (e) {
      set({ token: null, user: null });
      return false;
    }
  },
}));
