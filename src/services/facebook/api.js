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

  // ====== PHASE 05-11: Campaigns, Audiences, Creatives, Analytics, Leads, ROI, AI ======
  // Campaigns
  createCampaign: (data) => api.post('/api/facebook/campaigns', data),
  listCampaigns: () => api.get('/api/facebook/campaigns'),
  pauseCampaign: (id) => api.post(`/api/facebook/campaigns/${id}/pause`),
  resumeCampaign: (id) => api.post(`/api/facebook/campaigns/${id}/resume`),

  // Audiences
  createAudience: (data) => api.post('/api/facebook/audiences', data),
  listAudiences: () => api.get('/api/facebook/audiences'),

  // Creatives
  createCreative: (data) => api.post('/api/facebook/creatives', data),
  listCreatives: () => api.get('/api/facebook/creatives'),

  // Analytics
  getAnalytics: () => api.get('/api/facebook/analytics'),

  // Leads
  getFacebookLeads: () => api.get('/api/facebook/leads'),
  matchLead: (leadId, crmLeadId) => api.post(`/api/facebook/leads/${leadId}/match`, { crm_lead_id: crmLeadId }),

  // ROI
  getROI: () => api.get('/api/facebook/roi'),

  // AI
  generateCampaign: (data) => api.post('/api/facebook/ai/generate-campaign', data),
};