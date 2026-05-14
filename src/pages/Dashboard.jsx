import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalConversations: 0,
    totalLeads: 0,
    totalMessages: 0,
    marketing: 0,
    utility: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        setStats(res.data);
        setError(null);
      } catch (error) {
        console.error(error);
        setError('You do not have permission to view this dashboard. Please contact your administrator.');
      }
    };
    if (user?.role === 'super_admin') {
      fetchStats();
    } else {
      setError('This dashboard is only available to super administrators.');
    }
  }, [user]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500 text-sm">Organizations</h3><p className="text-3xl font-bold">{stats.totalOrganizations}</p></div>
        <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500 text-sm">Conversations</h3><p className="text-3xl font-bold">{stats.totalConversations}</p></div>
        <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500 text-sm">Leads</h3><p className="text-3xl font-bold">{stats.totalLeads}</p></div>
        <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500 text-sm">Messages</h3><p className="text-3xl font-bold">{stats.totalMessages}</p></div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm">WhatsApp Messages</h3>
        <div className="flex justify-between items-baseline">
          <p className="text-3xl font-bold">{stats.marketing + stats.utility}</p>
          <select className="text-xs border rounded p-1">
            <option>This month</option>
          </select>
        </div>
        <div className="mt-2 text-sm">
          <span className="text-green-600">📢 Marketing: {stats.marketing}</span> |
          <span className="text-blue-600 ml-2">🔧 Utility: {stats.utility}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
