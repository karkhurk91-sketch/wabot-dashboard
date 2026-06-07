import api from './api';

export const fetchOrganizationProfile = () =>
  api.get('/api/organizations/profile');

export const updateOrganizationProfile = (data) =>
  api.put('/api/organizations/profile', data);

export const fetchMaskingSettings = () =>
  api.get('/api/organizations/masking-settings');

export const updateMaskingSettings = (settings) =>
  api.put('/api/organizations/masking-settings', settings);

export const changePassword = (data) =>
  api.post('/api/organizations/change-password', data);

export const fetchConversationFlow = (orgId, flowType = 'buyer') =>
  api.get(`/api/organizations/${orgId}/conversation-flows/${flowType}`);

export const updateConversationFlow = (orgId, flowType = 'buyer', data) =>
  api.put(`/api/organizations/${orgId}/conversation-flows/${flowType}`, data);

export const deleteConversationFlow = (orgId, flowType = 'buyer') =>
  api.delete(`/api/organizations/${orgId}/conversation-flows/${flowType}`);

export default api;
