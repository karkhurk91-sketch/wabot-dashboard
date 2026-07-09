import React, { useState, useEffect } from 'react';
import { facebookApi } from '../../services/facebook/api';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facebookApi.listCampaigns()
      .then(res => setCampaigns(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Campaigns</h1>
      {campaigns.length === 0 && <p className="text-gray-500">No campaigns found.</p>}
    </div>
  );
}