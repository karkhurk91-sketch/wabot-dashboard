import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

const OrgDashboard = () => {
  const [stats, setStats] = useState({ customers: 0, conversations: 0, leads: 0, bookings: 0 });
  const [messageData, setMessageData] = useState([]);
  const [leadStatusData, setLeadStatusData] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const customersRes = await api.get('/api/customers');
      const conversationsRes = await api.get('/api/conversations');
      const leadsRes = await api.get('/api/leads');
      const bookingsRes = await api.get('/api/bookings');
      
      setStats({
        customers: customersRes.data.length,
        conversations: conversationsRes.data.length,
        leads: leadsRes.data.length,
        bookings: bookingsRes.data.length,
      });

      setRecentLeads(leadsRes.data.slice(0, 5));
      setRecentConversations(conversationsRes.data.slice(0, 5));

      const activityRes = await api.get('/api/analytics/activity?period=daily');
      setMessageData(activityRes.data.messages.slice(-7));

      const statusCount = {};
      leadsRes.data.forEach(lead => {
        const status = lead.status || 'new';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      const statusArray = Object.keys(statusCount).map(key => ({ name: key, value: statusCount[key] }));
      setLeadStatusData(statusArray);

    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Customers</p>
              <p className="text-3xl font-bold">{stats.customers}</p>
            </div>
            <div className="text-blue-500 text-3xl">👥</div>
          </div>
          <Link to="/customers" className="text-blue-600 text-sm mt-2 inline-block">View all →</Link>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Conversations</p>
              <p className="text-3xl font-bold">{stats.conversations}</p>
            </div>
            <div className="text-green-500 text-3xl">💬</div>
          </div>
          <Link to="/conversations" className="text-green-600 text-sm mt-2 inline-block">View all →</Link>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Leads</p>
              <p className="text-3xl font-bold">{stats.leads}</p>
            </div>
            <div className="text-yellow-500 text-3xl">🎯</div>
          </div>
          <Link to="/leads" className="text-yellow-600 text-sm mt-2 inline-block">View all →</Link>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Bookings</p>
              <p className="text-3xl font-bold">{stats.bookings}</p>
            </div>
            <div className="text-purple-500 text-3xl">📅</div>
          </div>
          <Link to="/bookings" className="text-purple-600 text-sm mt-2 inline-block">View all →</Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Message Activity (Last 7 days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={messageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Lead Status</h2>
          {leadStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={leadStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {leadStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">No lead data yet</div>
          )}
        </div>
      </div>

      {/* Recent Tables */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Leads</h2>
            <Link to="/leads" className="text-blue-600 text-sm hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Interest</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentLeads.map(lead => (
                  <tr key={lead.id}>
                    <td className="px-4 py-2">{lead.customer_phone}</td>
                    <td className="px-4 py-2">{lead.interest || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                        lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lead.status || 'new'}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-center text-gray-500">No leads yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Conversations</h2>
            <Link to="/conversations" className="text-blue-600 text-sm hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Last Message</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentConversations.map(conv => (
                  <tr key={conv.id}>
                    <td className="px-4 py-2">{conv.customer_phone}</td>
                    <td className="px-4 py-2">{conv.last_message || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${conv.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {conv.status || 'open'}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentConversations.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-center text-gray-500">No conversations yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/customers" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-xl text-center transition">
          <div className="text-2xl mb-1">➕</div>
          <div className="font-medium">Add Customer</div>
        </Link>
        <Link to="/broadcast" className="bg-green-50 hover:bg-green-100 p-4 rounded-xl text-center transition">
          <div className="text-2xl mb-1">📢</div>
          <div className="font-medium">Send Broadcast</div>
        </Link>
        <Link to="/bookings" className="bg-purple-50 hover:bg-purple-100 p-4 rounded-xl text-center transition">
          <div className="text-2xl mb-1">📅</div>
          <div className="font-medium">View Bookings</div>
        </Link>
        <Link to="/ai-chat" className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-xl text-center transition">
          <div className="text-2xl mb-1">💬</div>
          <div className="font-medium">AI Chat Test</div>
        </Link>
      </div>
    </div>
  );
};

export default OrgDashboard;