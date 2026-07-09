import React, { useState, useEffect } from 'react';
import { facebookApi } from '../../services/facebook/api';
import AudienceBuilder from '../../components/facebook/AudienceBuilder';

export default function Audiences() {
  const [audiences, setAudiences] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    facebookApi.listAudiences()
      .then(res => setAudiences(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Audiences</h1>
        <button onClick={() => setShowBuilder(!showBuilder)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
          + New Audience
        </button>
      </div>
      {showBuilder && <AudienceBuilder onSave={() => setShowBuilder(false)} />}
    </div>
  );
}