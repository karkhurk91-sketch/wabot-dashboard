import api from '../services/api'; // adjust path to your axios config file

export const fetchBots = (organizationId = null) => {
  const params = organizationId ? { organization_id: organizationId } : {};
  return api.get('/api/bots', { params });
};

export const createBot = (data) => {
  return api.post('/api/bots', data);
};

export const updateBot = (botId, data) => {
  return api.put(`/api/bots/${botId}`, data);
};

export const activateBot = (botId) => {
  return api.post(`/api/bots/${botId}/activate`);
};

export const deleteBot = (botId) => {
  return api.delete(`/api/bots/${botId}`);
};

export const getBot = (botId) => {
  return api.get(`/api/bots/${botId}`);
};