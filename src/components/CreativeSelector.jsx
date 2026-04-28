import React from 'react';

export default function CreativeSelector({ creatives, selectedId, onSelect }) {
  return (
    <div className="space-y-4">
      {creatives.map((c) => (
        <div
          key={c.id}
          className={`p-4 border rounded-lg cursor-pointer transition ${
            selectedId === c.id ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelect(c.id)}
        >
          {c.type === 'text' && <p className="text-gray-800">{c.content}</p>}
          {c.type === 'image' && (
            <div>
              <img
                src={c.media_url}
                alt="Generated"
                className="max-w-full h-auto rounded mb-2"
                onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Image+failed+to+load'; console.error('Image load error:', c.media_url); }}
              />
              <p className="text-xs text-gray-500 mt-1">Prompt: {c.content?.substring(0, 100)}...</p>
            </div>
          )}
          {selectedId === c.id && <span className="text-indigo-600 text-sm mt-2 inline-block">✓ Selected</span>}
        </div>
      ))}
    </div>
  );
}