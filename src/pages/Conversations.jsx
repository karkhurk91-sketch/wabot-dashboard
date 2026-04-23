import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await api.get('/api/conversations'); setConversations(res.data); } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Conversations</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Organization</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Last Message</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Lead Score</th></tr></thead>
          <tbody className="divide-y divide-gray-200">{conversations.map(conv => (<tr key={conv.id}><td className="px-6 py-4">{conv.customer_phone}</td><td className="px-6 py-4">{conv.organization_name || conv.organization_id}</td><td className="px-6 py-4">{conv.last_message?.substring(0,50)}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${conv.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{conv.status}</span></td><td className="px-6 py-4">{conv.lead_score}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};
export default Conversations;
