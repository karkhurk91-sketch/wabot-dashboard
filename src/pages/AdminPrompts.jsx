
// src/pages/AdminPrompts.jsx (replace with inline form version)
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminPrompts = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', prompt_text: '' });

  useEffect(() => { fetchOrgs(); }, []);

  const fetchOrgs = async () => {
    const res = await api.get('/api/admin/organizations');
    setOrganizations(res.data);
  };

  const fetchPrompts = async (orgId) => {
    if (!orgId) return;
    setLoading(true);
    const res = await api.get(`/api/admin/prompts/organizations/${orgId}`);
    setPrompts(res.data);
    setLoading(false);
  };

  const handleOrgChange = (e) => {
    const orgId = e.target.value;
    setSelectedOrg(orgId);
    setEditingId(null);
    setForm({ name: '', prompt_text: '' });
    if (orgId) fetchPrompts(orgId);
    else setPrompts([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/api/admin/prompts/${editingId}`, form);
    } else {
      await api.post('/api/admin/prompts/', { organization_id: selectedOrg, ...form });
    }
    setEditingId(null);
    setForm({ name: '', prompt_text: '' });
    fetchPrompts(selectedOrg);
  };

  const handleSetPrimary = async (promptId) => {
    await api.post(`/api/admin/prompts/${promptId}/set-primary`);
    fetchPrompts(selectedOrg);
  };

  const handleDelete = async (promptId, isPrimary) => {
    if (isPrimary) {
      alert('Cannot delete primary prompt. Set another prompt as primary first.');
      return;
    }
    if (window.confirm('Delete this prompt?')) {
      await api.delete(`/api/admin/prompts/${promptId}`);
      fetchPrompts(selectedOrg);
    }
  };

  const startEdit = (prompt) => {
    setEditingId(prompt.id);
    setForm({ name: prompt.name, prompt_text: prompt.prompt_text });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Organization Prompts</h1>
      <div className="mb-4">
        <label className="block mb-2">Select Organization</label>
        <select value={selectedOrg} onChange={handleOrgChange} className="border p-2 rounded w-64">
          <option value="">-- Choose --</option>
          {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
        </select>
      </div>
      {selectedOrg && (
        <>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-3">{editingId ? 'Edit Prompt' : 'Add New Prompt'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Prompt Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2 rounded" required />
              <textarea placeholder="Prompt Text" value={form.prompt_text} onChange={e => setForm({...form, prompt_text: e.target.value})} rows="4" className="w-full border p-2 rounded" required />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Add'}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', prompt_text: '' }); }} className="border rounded px-4 py-2">Cancel</button>}
              </div>
            </form>
          </div>
          {loading ? <div>Loading...</div> : (
            <div className="space-y-4">
              {prompts.map(p => (
                <div key={p.id} className="border rounded-lg p-4 bg-white shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{p.name}</h3>
                        {p.is_primary && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Primary</span>}
                      </div>
                      <p className="text-gray-700 mt-1 whitespace-pre-wrap">{p.prompt_text}</p>
                    </div>
                    <div className="space-x-2 ml-4">
                      {!p.is_primary && (
                        <>
                          <button onClick={() => startEdit(p)} className="text-blue-600">Edit</button>
                          <button onClick={() => handleSetPrimary(p.id)} className="text-green-600">Set Primary</button>
                        </>
                      )}
                      <button onClick={() => handleDelete(p.id, p.is_primary)} className="text-red-600">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
              {prompts.length === 0 && <div className="text-gray-500">No prompts added yet.</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default AdminPrompts;
