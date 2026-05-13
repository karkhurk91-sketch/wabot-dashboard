import api from './api';

export const fetchConversations = () => api.get('/api/conversations');

export const fetchConversationMessages = (convId, limit = 50, offset = 0) =>
  api.get(`/api/conversations/${convId}/messages?limit=${limit}&offset=${offset}`);

export const sendTextMessage = (convId, text, senderType) =>
  api.post(`/api/conversations/${convId}/messages`, {
    text,
    sender_type: senderType,
  });

export const sendMediaMessage = (convId, formData, onUploadProgress) =>
  api.post(`/api/conversations/${convId}/media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

export const fetchConversationNotes = (convId) => api.get(`/api/conversations/${convId}/notes`);
export const fetchConversationTags = (convId) => api.get(`/api/conversations/${convId}/tags`);
export const listAgents = () => api.get('/api/conversations/agents');
export const toggleConversationMode = (convId, mode) =>
  api.post(`/api/conversations/${convId}/mode`, { mode });

export const assignAgent = (convId, agentId) =>
  api.post(`/api/conversations/${convId}/assign`, { agent_id: agentId });

export const unassignAgent = (convId) => api.post(`/api/conversations/${convId}/unassign`);

export const addConversationNote = (convId, note) =>
  api.post(`/api/conversations/${convId}/notes`, { note });

export const listOrgTags = () => api.get('/api/conversations/tags');

export const createOrgTag = (name, color = '#4F46E5') =>
  api.post('/api/conversations/tags', { name, color });

export const attachConversationTag = (convId, tagId) =>
  api.post(`/api/conversations/${convId}/tags/${tagId}`);

export const detachConversationTag = (convId, tagId) =>
  api.delete(`/api/conversations/${convId}/tags/${tagId}`);
