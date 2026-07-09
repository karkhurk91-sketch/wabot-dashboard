import React, { useState } from 'react';
import { facebookApi } from '../../services/facebook/api';
import AISuggestions from '../../components/facebook/AISuggestions';

export default function AIWizard() {
  const [product, setProduct] = useState({ name: '', price: '', location: '' });
  const [suggestions, setSuggestions] = useState(null);

  const generate = async () => {
    const res = await facebookApi.generateCampaign(product);
    setSuggestions(res.data);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Campaign Generator</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <input type="text" placeholder="Product" className="w-full border p-2 rounded" onChange={e => setProduct({...product, name: e.target.value})} />
          <button onClick={generate} className="mt-2 bg-purple-600 text-white px-4 py-2 rounded">Generate</button>
        </div>
        <div>
          {suggestions && <AISuggestions data={suggestions} />}
        </div>
      </div>
    </div>
  );
}