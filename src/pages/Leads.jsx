import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await api.get('/api/leads'); setLeads(res.data); } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const updateStatus = async (id, status) => {
    try { await api.patch(`/api/leads/${id}`, { status }); window.location.reload(); } catch(e) { console.error(e); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leads</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Phone</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Interest</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-200">{leads.map(lead => (<tr key={lead.id}><td className="px-6 py-4">{lead.customer_name || '-'}</td><td className="px-6 py-4">{lead.customer_phone}</td><td className="px-6 py-4">{lead.interest}</td><td className="px-6 py-4"><select value={lead.status} onChange={(e) => updateStatus(lead.id, e.target.value)} className="text-sm border rounded px-2 py-1"><option value="new">New</option><option value="contacted">Contacted</option><option value="converted">Converted</option><option value="lost">Lost</option></select></td><td className="px-6 py-4"><button className="text-blue-600 hover:underline">Export</button></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};
export default Leads;
