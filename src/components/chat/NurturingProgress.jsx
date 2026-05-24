import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const NurturingProgress = ({ leadId }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leadId) return;
    
    setLoading(true);
    api.get(`/api/leads/${leadId}/nurturing/progress`)
      .then(res => setProgress(res.data))
      .catch(err => console.error('Failed to fetch nurturing progress:', err))
      .finally(() => setLoading(false));
  }, [leadId]);

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (!progress) return null;

  return (
    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <h4 className="font-bold text-blue-900">Nurturing Sequence</h4>
      <div className="mt-2 space-y-2 text-sm">
        <p><span className="text-gray-600">Sequence:</span> <span className="font-semibold">{progress.sequence_name}</span></p>
        <p><span className="text-gray-600">Progress:</span> Step {progress.current_step} of {progress.total_steps}</p>
        {progress.next_action_at ? (
          <p><span className="text-gray-600">Next action:</span> {new Date(progress.next_action_at).toLocaleString()}</p>
        ) : (
          <p className="text-green-600">✓ Sequence completed</p>
        )}
      </div>
    </div>
  );
};

export default NurturingProgress;
