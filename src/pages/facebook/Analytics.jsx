import React, { useState, useEffect } from 'react';
import { facebookApi } from '../../services/facebook/api';

export default function Analytics() {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    facebookApi.getAnalytics()
      .then(res => setMetrics(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">Impressions: {metrics.impressions}</div>
        <div className="bg-white p-4 rounded shadow">Clicks: {metrics.clicks}</div>
        <div className="bg-white p-4 rounded shadow">Spend: ${metrics.spend}</div>
      </div>
    </div>
  );
}