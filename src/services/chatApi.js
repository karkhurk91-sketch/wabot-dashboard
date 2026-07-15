import api from './api';

// If you need API_BASE_URL elsewhere, define it; but we'll use api instance.
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchConversations = (filterType = 'all') => api.get(`/api/conversations${filterType && filterType !== 'all' ? `?filter=${encodeURIComponent(filterType)}` : ''}`);

export const createConversation = (phoneNumber) =>
  api.post('/api/conversations', { phone_number: phoneNumber });

export const searchConversations = (searchTerm, searchType = 'name_phone') =>
  api.get(`/api/conversations/search?q=${encodeURIComponent(searchTerm)}&search_type=${encodeURIComponent(searchType)}`);

export const fetchConversationMessages = (convId, limit = 50, offset = 0) =>
  api.get(`/api/conversations/${convId}/messages?limit=${limit}&offset=${offset}`);

export const sendTextMessage = (convId, text, senderType, replyToId = null) =>
  api.post(`/api/conversations/${convId}/messages`, {
    text,
    sender_type: senderType,
    reply_to_id: replyToId,
  });

export const sendMediaMessage = (convId, formData, onUploadProgress, replyToId = null) => {
  // If replyToId is provided, append it to formData
  if (replyToId) {
    formData.append('reply_to_id', replyToId);
  }
  return api.post(`/api/conversations/${convId}/media`, formData, {
    onUploadProgress,
  });
};

// ========== PINNED MESSAGES ==========
export const pinMessage = (convId, msgId) =>
  api.post(`/api/conversations/${convId}/messages/${msgId}/pin`);

export const unpinMessage = (convId, msgId) =>
  api.delete(`/api/conversations/${convId}/messages/${msgId}/pin`);

export const fetchPinnedMessages = (convId) =>
  api.get(`/api/conversations/${convId}/pins`);

// ========== Existing exports ==========
export const fetchConversationNotes = (convId) => api.get(`/api/conversations/${convId}/notes`);
export const fetchConversationTags = (convId) => api.get(`/api/conversations/${convId}/tags`);
export const listAgents = () => api.get('/api/conversations/agents');
export const toggleConversationMode = (convId, mode) =>
  api.patch(`/api/conversations/${convId}/mode?mode=${mode}`);

export const assignAgent = (convId, agentId) =>
  api.post(`/api/conversations/${convId}/assign`, { agent_id: agentId });

export const unassignAgent = (convId) => api.post(`/api/conversations/${convId}/unassign`);

export const addConversationNote = (convId, note) =>
  api.post(`/api/conversations/${convId}/notes`, { note });

export const listOrgTags = () => api.get('/api/conversations/tags');

export const listQuickReplies = (q) => api.get(`/api/quick-replies${q ? `?q=${encodeURIComponent(q)}` : ''}`);
export const createQuickReply = (payload) => api.post('/api/quick-replies', payload);
export const updateQuickReply = (id, payload) => api.put(`/api/quick-replies/${id}`, payload);
export const deleteQuickReply = (id) => api.delete(`/api/quick-replies/${id}`);

export const createOrgTag = (name, color = '#4F46E5') =>
  api.post('/api/conversations/tags', { name, color });

export const attachConversationTag = (convId, tagId) =>
  api.post(`/api/conversations/${convId}/tags/${tagId}`);

export const detachConversationTag = (convId, tagId) =>
  api.delete(`/api/conversations/${convId}/tags/${tagId}`);

// Conversation counts and mark read
export const getConversationCounts = () => api.get('/api/conversations/counts');
export const markConversationAsRead = (id) => api.put(`/api/conversations/${id}/mark-read`);

// Assignment history and custom fields
export const getAssignmentHistory = (id) => api.get(`/api/conversations/${id}/assignment-history`);
export const updateConversationCustomFields = (id, customFields) => api.patch(`/api/conversations/${id}/custom-fields`, { custom_fields: customFields });
export const updateCustomerOptIn = (id, optIn) => api.put(`/api/customers/${id}/opt-in`, { opt_in: optIn });

// Custom field definitions
export const fetchCustomFieldDefs = () => api.get('/api/conversations/custom-fields-definitions');
export const createCustomFieldDef = (data) => api.post('/api/conversations/custom-fields-definitions', data);
export const updateCustomFieldDef = (id, data) => api.patch(`/api/conversations/custom-fields-definitions/${id}`, data);
export const deleteCustomFieldDef = (id) => api.delete(`/api/conversations/custom-fields-definitions/${id}`);

// Lead nurturing API
export const listNurturingSequences = () => api.get('/api/leads/nurturing/sequences');
export const createNurturingSequence = (payload) => api.post('/api/leads/nurturing/sequences', payload);
export const getNurturingSequence = (id) => api.get(`/api/leads/nurturing/sequences/${id}`);
export const updateNurturingSequence = (id, payload) => api.put(`/api/leads/nurturing/sequences/${id}`, payload);
export const deleteNurturingSequence = (id) => api.delete(`/api/leads/nurturing/sequences/${id}`);

export const assignNurturingToLead = (leadId, sequenceId) => api.post(`/api/leads/${leadId}/nurturing/assign`, { sequence_id: sequenceId });
export const unassignNurturingFromLead = (leadId) => api.post(`/api/leads/${leadId}/nurturing/unassign`);
export const triggerNurturingForLead = (leadId) => api.post(`/api/leads/${leadId}/nurturing/trigger`);

// Follow-up management
export const scheduleFollowUp = (leadId, scheduledAtISO) => api.post(`/api/leads/${leadId}/followup/schedule`, { scheduled_at: scheduledAtISO });
export const cancelFollowUp = (leadId) => api.post(`/api/leads/${leadId}/followup/cancel`);
export const triggerFollowUp = (leadId) => api.post(`/api/leads/${leadId}/followup/trigger`);
export const listFollowUps = (limit = 50, offset = 0) => api.get(`/api/leads/followups?limit=${limit}&offset=${offset}`);

export const getLeadByConversation = (convId) => api.get(`/api/leads/by-conversation/${convId}`);

// Send location - uses the configured api instance
export const sendLocation = (conversationId, latitude, longitude, name, address) => {
  return api.post(`/api/conversations/${conversationId}/send-location`, {
    latitude,
    longitude,
    name,
    address,
  });
};