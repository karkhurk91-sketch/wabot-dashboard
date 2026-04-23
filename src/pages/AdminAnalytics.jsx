import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const AdminAnalytics = () => {
  const [data, setData] = useState({ messages: [], organizations: [] });
  const [period, setPeriod] = useState('daily');

  useEffect(() => {
    api.get(`/api/analytics/global?period=${period}`).then(res => setData(res.data));
  }, [period]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Global Analytics</h1>
      <select value={period} onChange={e => setPeriod(e.target.value)} className="mb-4 border p-2 rounded">
        <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
      </select>
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Messages Over Time</h2>
        <ResponsiveContainer width="100%" height={300}><LineChart data={data.messages}><CartesianGrid /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="count" stroke="#3b82f6" /></LineChart></ResponsiveContainer>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Organization Growth</h2>
        <ResponsiveContainer width="100%" height={300}><LineChart data={data.organizations}><CartesianGrid /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="count" stroke="#10b981" /></LineChart></ResponsiveContainer>
      </div>
    </div>
  );
};
export default AdminAnalytics;
