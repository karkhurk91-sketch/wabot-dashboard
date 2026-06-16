import React, { useState } from 'react';
import { campaignApi } from '../../services/campaignApi';

export default function HashtagInput({ value, onChange, productName = '', location = '' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    if (!productName && !value) return;
    setLoading(true);
    try {
      const res = await campaignApi.suggestTags({
        text: value,
        product_name: productName,
        location: location,
        industry: 'general'
      });
      const tags = res.data.tags.split(',').map(t => t.trim());
      setSuggestions(tags);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Hashtags #example #sale"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {suggestions.map(tag => (
          <button
            key={tag}
            onClick={() => onChange((value + ' ' + tag).trim())}
            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm hover:bg-blue-100 transition"
          >
            {tag}
          </button>
        ))}
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Suggest hashtags'}
        </button>
      </div>
    </div>
  );
}
