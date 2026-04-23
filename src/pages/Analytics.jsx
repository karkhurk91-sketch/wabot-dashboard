import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const Analytics = () => {
  const [data, setData] = useState({ messages: [], leads: [], top_customers: [], funnel: { total_leads: 0, contacted: 0, converted: 0 } });
  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/analytics/activity?period=${period}`);
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  if (loading) return <div className="p-6">Loading analytics...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      
      <div className="mb-4">
        <label className="mr-2 font-medium">Period:</label>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)} 
          className="border rounded px-3 py-1"
        >
          <option value="daily">Daily (last 30 days)</option>
          <option value="weekly">Weekly (last 12 weeks)</option>
          <option value="monthly">Monthly (last 12 months)</option>
          <option value="yearly">Yearly (last 5 years)</option>
        </select>
      </div>

      {/* Messages Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Messages Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.messages}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Messages" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Leads Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Leads Captured Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.leads}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#10b981" name="Leads" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Lead Conversion Funnel</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-2xl font-bold">{data.funnel.total_leads}</p>
            <p className="text-sm text-gray-600">Total Leads</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded">
            <p className="text-2xl font-bold">{data.funnel.contacted}</p>
            <p className="text-sm text-gray-600">Contacted</p>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <p className="text-2xl font-bold">{data.funnel.converted}</p>
            <p className="text-sm text-gray-600">Converted</p>
          </div>
        </div>
      </div>

      {/* Top Active Customers */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Top Active Customers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Phone Number</th>
                <th className="px-4 py-2 text-left">Messages</th>
              </tr>
            </thead>
            <tbody>
              {data.top_customers.map((c, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{c.phone}</td>
                  <td className="px-4 py-2">{c.messages}</td>
                </tr>
              ))}
              {data.top_customers.length === 0 && (
                <tr><td colSpan="2" className="px-4 py-2 text-center text-gray-500">No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;