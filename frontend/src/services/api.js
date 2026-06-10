import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiKeyService = {
  generateKey: async (name) => {
    const response = await apiClient.post('/keys', { name });
    return response.data;
  },
  
  getKeys: async () => {
    const response = await apiClient.get('/keys');
    return response.data;
  },
};

export const dashboardService = {
  getStats: async (apiKey) => {
    const params = apiKey ? { apiKey } : {};
    const response = await apiClient.get('/dashboard-stats', { params });
    return response.data;
  },
};

export const publicApiService = {
  callPublicApi: async (apiKey) => {
    // We send x-api-key header for authentication
    const response = await apiClient.post('/public', {}, {
      headers: {
        'x-api-key': apiKey,
      },
    });
    return response;
  },
};

export default apiClient;
