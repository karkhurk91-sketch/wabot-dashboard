import api from './api';

export const campaignApi = {
  create: (data) => api.post('/api/campaign', data),
  list: () => api.get('/api/campaign'),
  getOne: (id) => api.get(`/api/campaign/${id}`),
  generateContent: (id, data) => api.post(`/api/campaign/${id}/generate-content`, data),
  getCreatives: (id) => api.get(`/api/campaign/${id}/creatives`),
  selectCreative: (campaignId, creativeId) => api.post(`/api/campaign/${campaignId}/select-creative`, { creative_id: creativeId }),
  getWhatsappLink: (id) => api.get(`/api/campaign/${id}/whatsapp-link`),
  getAdKit: (id) => api.get(`/api/campaign/${id}/ad-kit`),
  postToFacebook: (campaignId, data) => api.post(`/api/campaign/${campaignId}/post-to-facebook`, data),
  delete: (id) => api.delete(`/api/campaign/${id}`),
  suggestTags: (data) => api.post('/api/campaign/suggest-tags', data),
  generateAdKit: (data) => api.post('/api/campaign/generate-ad-kit', data),
  createAdCampaign: (campaignId, data) => api.post(`/api/campaign/${campaignId}/create-ad-campaign`, data),

};