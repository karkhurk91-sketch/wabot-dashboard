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
  api.patch(`/api/conversations/${convId}/mode?mode=${mode}`);
