import api from '../api';

export const instagramApi = {
  createPost: (data) => api.post('/api/instagram/posts', data),
  listPosts: () => api.get('/api/instagram/posts'),
  getAccount: () => api.get('/api/instagram/accounts'),
  syncAccount: () => api.post('/api/instagram/accounts/sync'),
};