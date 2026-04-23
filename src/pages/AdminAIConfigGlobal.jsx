import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminAIConfigGlobal = () => {
  const [config, setConfig] = useState({ system_prompt: '', temperature: 0.7, max_tokens: 500, enable_lead_capture: true });

  useEffect(() => {
    api.get('/api/ai/config/global').then(res => setConfig(res.data));
  }, []);

  const handleSave = async () => {
    await api.put('/api/ai/config/global', config);
    alert('Global config saved');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Global AI Configuration</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <textarea value={config.system_prompt} onChange={e => setConfig({...config, system_prompt: e.target.value})} rows="6" className="w-full border p-2 mb-4 rounded" />
        <label className="block mb-2">Temperature: {config.temperature}</label>
        <input type="range" min="0" max="1" step="0.1" value={config.temperature} onChange={e => setConfig({...config, temperature: parseFloat(e.target.value)})} className="w-full mb-4" />
        <label className="block mb-2">Max Tokens: {config.max_tokens}</label>
        <input type="number" value={config.max_tokens} onChange={e => setConfig({...config, max_tokens: parseInt(e.target.value)})} className="w-full border p-2 mb-4 rounded" />
        <label className="flex items-center mb-4"><input type="checkbox" checked={config.enable_lead_capture} onChange={e => setConfig({...config, enable_lead_capture: e.target.checked})} className="mr-2" /> Enable lead capture</label>
        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </div>
    </div>
  );
};
export default AdminAIConfigGlobal;
