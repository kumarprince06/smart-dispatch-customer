import api from './axios';

export const authApi = {
  login: (payload: any) => api.post('/auth/login', payload),
  register: (payload: any) => api.post('/auth/register', payload), 
  getProfile: () => api.get('/customers/me'), 
};
