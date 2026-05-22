import api from './api';

export const getLeadsWithScores = (filters) => api.get('/api/leads', { params: { sort_by: 'score', ...filters } });
export const getLeadTimeline = (id) => api.get(`/api/leads/${id}/timeline`);
export const addLeadNote = (id, note) => api.post(`/api/leads/${id}/notes`, { note });
export const bulkAssign = (leadIds, agentId) => api.post('/api/leads/bulk/assign', { lead_ids: leadIds, agent_id: agentId });