import React from 'react';

export default function LeadMatch({ fbLead }) {
  return (
    <div className="border p-2 rounded">
      <p>{fbLead.name} - {fbLead.email}</p>
      <button className="bg-indigo-600 text-white px-2 py-1 rounded text-sm">Match</button>
    </div>
  );
}