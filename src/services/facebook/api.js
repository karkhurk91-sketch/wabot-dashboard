import api from '../api';

export const facebookApi = {
  // Posts
  createPost: (data) => api.post('/api/facebook/posts', data),
  listPosts: (params) => api.get('/api/facebook/posts', { params }),
  getPost: (id) => api.get(`/api/facebook/posts/${id}`),
  deletePost: (id) => api.delete(`/api/facebook/posts/${id}`),

  // Pages
  getPages: () => api.get('/api/facebook/pages'),
  syncPages: () => api.post('/api/facebook/pages/sync'),
  activatePage: (pageUuid) => api.post(`/api/facebook/pages/${pageUuid}/activate`),

  // Boosts
  boostPost: (postId, data) => api.post(`/api/facebook/posts/${postId}/boost`, data),
  listBoosts: () => api.get('/api/facebook/boosts'),
  pauseBoost: (boostId) => api.post(`/api/facebook/boosts/${boostId}/pause`),
  resumeBoost: (boostId) => api.post(`/api/facebook/boosts/${boostId}/resume`),

  // Sync & Eligibility
  syncFacebookPosts: () => api.post('/api/facebook/posts/sync'),
  checkPostEligibility: (postId) => api.get(`/api/facebook/posts/${postId}/eligibility`),

  // Media Upload
  uploadMedia: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/facebook/upload-media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};