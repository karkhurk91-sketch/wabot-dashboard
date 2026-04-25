
// src/pages/OrganizationChannels.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const OrganizationChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await api.get('/api/organizations/channels');
        setChannels(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Connected Channels</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {channels.map(ch => (
          <div key={ch.channel_type} className="border rounded-lg p-4 bg-white shadow">
            <h2 className="text-xl font-semibold capitalize mb-2">{ch.channel_type}</h2>
            <p className="text-sm text-gray-500">Status: {ch.enabled ? '✅ Enabled' : '❌ Disabled'}</p>
            {ch.config && Object.keys(ch.config).length > 0 && (
              <pre className="bg-gray-100 p-2 rounded text-xs mt-2 overflow-auto">{JSON.stringify(ch.config, null, 2)}</pre>
            )}
          </div>
        ))}
        {channels.length === 0 && <div className="text-gray-500">No channels configured yet. Contact super admin.</div>}
      </div>
    </div>
  );
};
export default OrganizationChannels;
