import React from 'react';

const AISummaryPanel = ({ lead }) => (
  <div className="bg-gray-50 p-3 rounded">
    <h4 className="font-bold">AI Insights</h4>
    <p>Score: {lead.lead_score}</p>
    <p>Intent: {lead.intent_label}</p>
    <p>Sentiment: {lead.sentiment}</p>
    <p>Extracted: {JSON.stringify(lead.data)}</p>
  </div>
);

export default AISummaryPanel;