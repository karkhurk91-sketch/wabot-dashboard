import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

/** API returns last_message as either a string or { text, content, ... } — never render raw objects in JSX. */
function formatLastMessagePreview(lastMessage) {
  if (lastMessage == null || lastMessage === '') return '—';
  if (typeof lastMessage === 'string') return lastMessage;
  if (typeof lastMessage === 'object') {
    return lastMessage.text ?? lastMessage.content ?? '—';
  }
  return String(lastMessage);
}

function conversationCustomerLabel(conv) {
  const name = conv.customer_name?.trim();
  if (name) return name;
  return conv.customer_phone_number ?? conv.customer_phone ?? '—';
}

/** Avoid rendering objects in table cells */
function formatScalar(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

const OrgDashboard = () => {
  const [stats, setStats] = useState({ customers: 0, conversations: 0, leads: 0, bookings: 0 });
  const [messageData, setMessageData] = useState([]);
  const [leadStatusData, setLeadStatusData] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all required data in parallel
      const [customersRes, conversationsRes, leadsRes, bookingsRes, activityRes] = await Promise.all([
        api.get('/api/customers?limit=1'), // we only need the total count
        api.get('/api/conversations'),
        api.get('/api/leads'),
        api.get('/api/bookings'),
        api.get('/api/analytics/activity?period=daily').catch(() => ({ data: { messages: [] } }))
      ]);

      // Extract counts (handles both array and paginated responses)
      const getCount = (res) => {
        const d = res?.data;
        if (Array.isArray(d)) return d.length;
        if (d && typeof d === 'object' && 'total' in d) return Number(d.total) || 0;
        if (Array.isArray(res)) return res.length;
        return 0;
      };

      const customerPayload = customersRes?.data;
      const customerCount =
        customerPayload && typeof customerPayload === 'object' && !Array.isArray(customerPayload) && 'total' in customerPayload
          ? Number(customerPayload.total) || 0
          : Array.isArray(customerPayload)
            ? customerPayload.length
            : 0;

      const asArray = (res) => {
        const d = res?.data;
        if (Array.isArray(d)) return d;
        if (d && typeof d === 'object' && Array.isArray(d.data)) return d.data;
        return [];
      };

      setStats({
        customers: customerCount,
        conversations: getCount(conversationsRes),
        leads: getCount(leadsRes),
        bookings: getCount(bookingsRes),
      });

      // Recent items (first 5)
      const leadsArray = asArray(leadsRes);
      const convsArray = asArray(conversationsRes);
      setRecentLeads(leadsArray.slice(0, 5));
      setRecentConversations(convsArray.slice(0, 5));

      // Lead status breakdown
      const statusCount = {};
      leadsArray.forEach((lead) => {
        const status = formatScalar(lead.status) || 'new';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      const statusArray = Object.keys(statusCount).map(key => ({ name: key, value: statusCount[key] }));
      setLeadStatusData(statusArray);

      // Message activity (last 7 days)
      const messages = activityRes?.data?.messages || [];
      setMessageData(messages.slice(-7));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setError('Unable to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        <button onClick={fetchDashboardData} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Retry
        </button>
      </div>
    );
  }

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={fetchDashboardData} className="text-sm text-blue-600 hover:underline">
          Refresh
        </button>
      </div>

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
          {messageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={messageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">No message activity yet</div>
          )}
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
                  label={({ name, percent }) =>
                    `${name} ${typeof percent === 'number' ? (percent * 100).toFixed(0) : 0}%`
                  }
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
                {recentLeads.map((lead, idx) => (
                  <tr key={lead.id ?? `lead-${idx}`}>
                    <td className="px-4 py-2">{formatScalar(lead.customer_phone)}</td>
                    <td className="px-4 py-2">{formatScalar(lead.interest)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                        lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {formatScalar(lead.status) || 'new'}
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
                {recentConversations.map((conv, idx) => (
                  <tr key={conv.id ?? `conv-${idx}`}>
                    <td className="px-4 py-2">{conversationCustomerLabel(conv)}</td>
                    <td className="px-4 py-2">{formatLastMessagePreview(conv.last_message)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${conv.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {formatScalar(conv.status) || 'open'}
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