import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { getBotAnalyticsOverview, getBotAnalyticsDropoffs, getBotAnalyticsCustomValues } from '../api/bots';

const BotAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [dropoffs, setDropoffs] = useState([]);
  const [customValues, setCustomValues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, dropoffRes, customRes] = await Promise.all([
          getBotAnalyticsOverview(30),
          getBotAnalyticsDropoffs(),
          getBotAnalyticsCustomValues()
        ]);
        setOverview(overviewRes.data);
        setDropoffs(dropoffRes.data.dropoffs || []);
        setCustomValues(customRes.data.custom_values || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading analytics...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Bot Performance Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Bot Conversations (30d)</p>
          <p className="text-2xl font-bold">{overview?.total_started || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Completed (Leads)</p>
          <p className="text-2xl font-bold">{overview?.completed || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Completion Rate</p>
          <p className="text-2xl font-bold">{overview?.completion_rate || 0}%</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Avg. Completion Time</p>
          <p className="text-2xl font-bold">{overview?.avg_completion_minutes || 0} min</p>
        </div>
      </div>

      {/* Drop-off Chart */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">User Drop-off by Field Step</h2>
        {dropoffs.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dropoffs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="field_index" label={{ value: 'Field Step', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: '% Completed', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="percent_completed" stroke="#8884d8" name="% of conversations reaching this field" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No drop-off data available.</p>
        )}
      </div>

      {/* Custom Values (from "Other" selections) */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Most Common Custom Values (from "Other")</h2>
        {customValues.length > 0 ? (
          <div className="space-y-2">
            {customValues.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-700 truncate max-w-md">{item.value}</span>
                <span className="text-gray-500">{item.count} times</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No custom values recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default BotAnalytics;