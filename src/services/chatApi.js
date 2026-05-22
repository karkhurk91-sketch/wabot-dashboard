import api from './api';


export const fetchConversations = () => api.get('/api/conversations');

export const createConversation = (phoneNumber) =>
  api.post('/api/conversations', { phone_number: phoneNumber });

export const searchConversations = (searchTerm) =>
  api.get(`/api/conversations/search?q=${encodeURIComponent(searchTerm)}`);

export const fetchConversationMessages = (convId, limit = 50, offset = 0) =>
  api.get(`/api/conversations/${convId}/messages?limit=${limit}&offset=${offset}`);

export const sendTextMessage = (convId, text, senderType) =>
  api.post(`/api/conversations/${convId}/messages`, {
    text,
    sender_type: senderType,
  });

export const sendMediaMessage = (convId, formData, onUploadProgress) =>
  api.post(`/api/conversations/${convId}/media`, formData, {
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

// Add these to your existing chatApi.js
export const getConversationCounts = () => api.get('/api/conversations/counts');
export const markConversationAsRead = (id) => api.put(`/api/conversations/${id}/mark-read`);
// Add these to your existing chatApi.js
export const getAssignmentHistory = (id) => api.get(`/api/conversations/${id}/assignment-history`);
export const updateConversationCustomFields = (id, customFields) => api.patch(`/api/conversations/${id}/custom-fields`, { custom_fields: customFields });
export const updateCustomerOptIn = (id, optIn) => api.put(`/api/customers/${id}/opt-in`, { opt_in: optIn });
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
