
// src/pages/AdminChannels.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminChannels = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [formData, setFormData] = useState({});

  const channelConfigFields = {
    whatsapp: [
      { name: 'access_token', label: 'WhatsApp Access Token', type: 'textarea' },
      { name: 'phone_number_id', label: 'Phone Number ID', type: 'text' },
      { name: 'verify_token', label: 'Verify Token', type: 'text' },
      { name: 'business_account_id', label: 'WhatsApp Business Account ID', type: 'text' }
    ],
    facebook: [
      { name: 'page_access_token', label: 'Page Access Token', type: 'textarea' },
      { name: 'page_id', label: 'Page ID', type: 'text' }
    ],
    instagram: [
      { name: 'instagram_business_account_id', label: 'Instagram Business Account ID', type: 'text' },
      { name: 'page_access_token', label: 'Page Access Token (same as FB)', type: 'textarea' }
    ],
    telegram: [
      { name: 'bot_token', label: 'Bot Token', type: 'text' }
    ],
    email: [
      { name: 'smtp_host', label: 'SMTP Host', type: 'text' },
      { name: 'smtp_port', label: 'SMTP Port', type: 'number' },
      { name: 'smtp_user', label: 'SMTP User', type: 'text' },
      { name: 'smtp_password', label: 'SMTP Password', type: 'password' },
      { name: 'imap_host', label: 'IMAP Host', type: 'text' },
      { name: 'imap_user', label: 'IMAP User', type: 'text' },
      { name: 'imap_password', label: 'IMAP Password', type: 'password' }
    ]
  };

  const allChannels = ['whatsapp', 'facebook', 'instagram', 'telegram', 'email'];

  useEffect(() => { fetchOrgs(); }, []);

  const fetchOrgs = async () => {
    const res = await api.get('/api/admin/organizations');
    setOrganizations(res.data);
  };

  const fetchChannels = async (orgId) => {
    if (!orgId) return;
    setLoading(true);
    const res = await api.get(`/api/admin/organizations/${orgId}/channels`);
    setChannels(res.data);
    setLoading(false);
  };

  const handleOrgChange = (e) => {
    const orgId = e.target.value;
    setSelectedOrg(orgId);
    if (orgId) fetchChannels(orgId);
  };

  const handleSave = async (channelType) => {
    await api.post(`/api/admin/organizations/${selectedOrg}/channels/${channelType}`, {
      enabled: true,
      config: formData[channelType] || {}
    });
    setEditingChannel(null);
    fetchChannels(selectedOrg);
  };

  const handleDelete = async (channelType) => {
    if (window.confirm(`Delete ${channelType} configuration?`)) {
      await api.delete(`/api/admin/organizations/${selectedOrg}/channels/${channelType}`);
      fetchChannels(selectedOrg);
    }
  };

  const getChannelConfig = (channelType) => {
    const ch = channels.find(c => c.channel_type === channelType);
    return ch ? ch.config : {};
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Organization Channels</h1>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Organization</label>
        <select value={selectedOrg} onChange={handleOrgChange} className="border p-2 rounded w-64">
          <option value="">-- Choose --</option>
          {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
        </select>
      </div>
      {selectedOrg && (
        <div className="grid md:grid-cols-2 gap-6">
          {allChannels.map(channel => {
            const config = getChannelConfig(channel);
            const isEditing = editingChannel === channel;
            return (
              <div key={channel} className="border rounded-lg p-4 bg-white shadow">
                <h2 className="text-xl font-semibold capitalize mb-4">{channel}</h2>
                {!isEditing ? (
                  <>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">{JSON.stringify(config, null, 2)}</pre>
                    <div className="mt-4 space-x-2">
                      <button onClick={() => { setEditingChannel(channel); setFormData({...formData, [channel]: config}); }} className="bg-blue-600 text-white px-3 py-1 rounded">Edit</button>
                      {Object.keys(config).length > 0 && <button onClick={() => handleDelete(channel)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>}
                    </div>
                  </>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleSave(channel); }}>
                    {channelConfigFields[channel]?.map(field => (
                      <div key={field.name} className="mb-3">
                        <label className="block text-sm font-medium mb-1">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={formData[channel]?.[field.name] || ''}
                            onChange={e => setFormData(prev => ({
                              ...prev,
                              [channel]: { ...prev[channel], [field.name]: e.target.value }
                            }))}
                            rows={3}
                            className="w-full border p-2 rounded font-mono text-sm"
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={formData[channel]?.[field.name] || ''}
                            onChange={e => setFormData(prev => ({
                              ...prev,
                              [channel]: { ...prev[channel], [field.name]: e.target.value }
                            }))}
                            className="w-full border p-2 rounded"
                          />
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2 mt-4">
                      <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                      <button type="button" onClick={() => setEditingChannel(null)} className="border px-3 py-1 rounded">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default AdminChannels;
