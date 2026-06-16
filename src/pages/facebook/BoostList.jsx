import React, { useState, useEffect } from 'react';
import { facebookApi } from '../../services/facebook/api';

export default function BoostList() {
  const [boosts, setBoosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBoosts = async () => {
    try {
      const res = await facebookApi.listBoosts();
      setBoosts(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load boosts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoosts();
  }, []);

  const handlePause = async (boostId) => {
    if (!window.confirm('Pause this boost? The ad will stop spending.')) return;
    setActionLoading(boostId);
    try {
      await facebookApi.pauseBoost(boostId);
      await fetchBoosts(); // Refresh list
    } catch (err) {
      alert('Failed to pause boost: ' + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (boostId) => {
    setActionLoading(boostId);
    try {
      await facebookApi.resumeBoost(boostId);
      await fetchBoosts();
    } catch (err) {
      alert('Failed to resume boost: ' + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Boosted Posts
        </h1>
        <button
          onClick={fetchBoosts}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {boosts.map((boost) => (
          <div key={boost.id} className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-gray-500">ID: {boost.id.slice(0, 8)}...</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(boost.status)}`}>
                    {boost.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Daily Budget:</span> ₹{boost.daily_budget_cents / 100}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Duration:</span> {boost.duration_days} days
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Targeting:</span> {JSON.stringify(boost.targeting)}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Created: {new Date(boost.created_at).toLocaleString()}
                </p>
                {boost.meta_campaign_id && (
                  <p className="text-xs text-gray-400 mt-1">
                    Meta Campaign ID: {boost.meta_campaign_id}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                {boost.status === 'active' && (
                  <button
                    onClick={() => handlePause(boost.id)}
                    disabled={actionLoading === boost.id}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition disabled:opacity-50"
                  >
                    {actionLoading === boost.id ? '...' : 'Pause'}
                  </button>
                )}
                {boost.status === 'paused' && (
                  <button
                    onClick={() => handleResume(boost.id)}
                    disabled={actionLoading === boost.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition disabled:opacity-50"
                  >
                    {actionLoading === boost.id ? '...' : 'Resume'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {boosts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-100">
            <p className="text-gray-500">No boosts found.</p>
            <p className="text-sm text-gray-400 mt-1">Create a post and click "Boost" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}