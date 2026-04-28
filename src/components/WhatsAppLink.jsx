import React, { useState } from 'react';
import { campaignApi } from '../services/campaignApi';

export default function WhatsAppLink({ campaignId, onGenerated }) {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const res = await campaignApi.getWhatsappLink(campaignId);
      setLink(res.data.whatsapp_link);
      if (onGenerated) onGenerated();
    } catch (err) {
      alert('Failed to generate WhatsApp link. Make sure your organization has a phone number configured.');
    } finally {
      setLoading(false);
    }
  };

  if (link) {
    return (
      <div>
        <p className="mb-2">Share this link with your customers:</p>
        <div className="flex items-center gap-2">
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all underline">{link}</a>
          <button onClick={() => navigator.clipboard.writeText(link)} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm">Copy</button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={generateLink} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
      {loading ? 'Generating...' : 'Generate WhatsApp Link'}
    </button>
  );
}
