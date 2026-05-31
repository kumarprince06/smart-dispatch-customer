import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = 'https://fatafat-backend.onrender.com/api/v1';
const BASE_URL = 'http://192.168.1.10:8080/api/v1'; // Using local IP instead of localhost for Android compatibility

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Attach Token & Log Request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(`\n🚀 [API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  if (config.data) console.log('📦 [PAYLOAD]:', JSON.stringify(config.data, null, 2));

  return config;
}, (error) => {
  console.error('❌ [API REQUEST ERROR]:', error);
  return Promise.reject(error);
});

// Response Interceptor: Log Response
api.interceptors.response.use((response) => {
  console.log(`✅ [API RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
  return response;
}, (error) => {
  console.error(`❌ [API RESPONSE ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response?.status}`);
  if (error.response?.data) {
    console.error('📄 [ERROR DATA]:', JSON.stringify(error.response.data, null, 2));
  }
  return Promise.reject(error);
});

export default api;
