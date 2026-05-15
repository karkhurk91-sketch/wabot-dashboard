import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data,
    });
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      message: error.message,
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetchCustomers = (page, search) =>
  api.get(`/api/customers?page=${page}&search=${search}`);

export const uploadCustomers = (formData) =>
  api.post(`/api/customers/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const toggleStatus = (id) =>
  api.put(`/api/customers/${id}/status`);

export const sendConversationMedia = (convId, formData, onUploadProgress) =>
  api.post(`/api/conversations/${convId}/media`, formData, {
    onUploadProgress,
  });

export const fetchConversationMessages = (convId, limit = 50, offset = 0) =>
  api.get(`/api/conversations/${convId}/messages?limit=${limit}&offset=${offset}`);

export default api;
