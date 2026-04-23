import React, { useState, useEffect } from 'react';
import api from '../services/api';

const OrgDashboard = () => {
  const [stats, setStats] = useState({ totalCustomers: 0, totalConversations: 0, totalLeads: 0, totalMessages: 0 });

  useEffect(() => {
    api.get('/api/analytics/activity?period=daily').then(res => {
      // Just for counts, we can use separate endpoint
    });
    // For simplicity, fetch customers count
    api.get('/api/customers').then(res => setStats(prev => ({ ...prev, totalCustomers: res.data.length })));
    api.get('/api/leads').then(res => setStats(prev => ({ ...prev, totalLeads: res.data.length })));
    api.get('/api/conversations').then(res => setStats(prev => ({ ...prev, totalConversations: res.data.length })));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Customers</h3><p className="text-3xl font-bold">{stats.totalCustomers}</p></div>
        <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Conversations</h3><p className="text-3xl font-bold">{stats.totalConversations}</p></div>
        <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Leads</h3><p className="text-3xl font-bold">{stats.totalLeads}</p></div>
      </div>
    </div>
  );
};
export default OrgDashboard;