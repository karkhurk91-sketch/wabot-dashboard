import React, { useState } from 'react';
import { facebookApi } from '../../services/facebook/api';

export default function AudienceBuilder({ onSave }) {
  const [name, setName] = useState('');
  const [targeting, setTargeting] = useState({ age_min: 18, age_max: 65, locations: [] });

  const save = async () => {
    await facebookApi.createAudience({ name, targeting });
    onSave();
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <input type="text" placeholder="Audience Name" className="w-full border p-2 rounded mb-2" value={name} onChange={e => setName(e.target.value)} />
      <button onClick={save} className="bg-green-600 text-white px-4 py-2 rounded">Save Audience</button>
    </div>
  );
}