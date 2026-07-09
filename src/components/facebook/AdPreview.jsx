import React from 'react';

export default function AdPreview({ creative }) {
  return (
    <div className="border rounded p-4 max-w-md">
      <img src={creative.image} alt="Ad" className="w-full h-48 object-cover" />
      <h3 className="font-bold">{creative.headline}</h3>
      <p>{creative.description}</p>
      <button className="bg-blue-600 text-white px-4 py-1 rounded">{creative.cta}</button>
    </div>
  );
}