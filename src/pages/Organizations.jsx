import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Organizations = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await api.get('/api/organizations');
        setOrgs(res.data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchOrgs();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md">+ New Organization</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">WhatsApp Number</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Plan</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-200">{orgs.map(org => (<tr key={org.id}><td className="px-6 py-4">{org.name}</td><td className="px-6 py-4">{org.whatsapp_phone_number || '-'}</td><td className="px-6 py-4">{org.plan}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{org.status}</span></td><td className="px-6 py-4"><button className="text-blue-600 hover:underline">View</button></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};
export default Organizations;
