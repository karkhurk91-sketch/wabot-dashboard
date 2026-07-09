import React from 'react';

export default function AISuggestions({ data }) {
  return (
    <div className="border p-4 rounded bg-purple-50">
      <h3 className="font-bold">AI Suggestions</h3>
      <p>Audience: {data.audience}</p>
      <p>Budget: {data.budget}</p>
      <p>Platforms: {data.platforms}</p>
    </div>
  );
}