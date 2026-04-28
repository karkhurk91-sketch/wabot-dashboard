import React, { useEffect, useState } from 'react';
import { campaignApi } from '../services/campaignApi';

export default function AdKit({ campaignId }) {
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignApi.getAdKit(campaignId)
      .then(res => setKit(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [campaignId]);

  if (loading) return <div>Loading Ad Kit...</div>;
  if (!kit) return <div>Ad Kit not available yet.</div>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Product:</strong> {kit.product_name}</div>
        <div><strong>Price:</strong> {kit.price}</div>
        <div><strong>Location:</strong> {kit.location}</div>
        <div><strong>Selected Caption:</strong> {kit.caption}</div>
      </div>
      <div>
        <strong>WhatsApp Link:</strong>
        <a href={kit.whatsapp_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-2 break-all">{kit.whatsapp_link}</a>
      </div>
      <div className="border-t pt-4 mt-2">
        <h3 className="font-semibold text-lg">📢 Meta Ad Suggestions</h3>
        <p><strong>Audience:</strong> {kit.audience}</p>
        <p><strong>Budget:</strong> {kit.suggested_budget}</p>
        <p><strong>Platforms:</strong> {kit.platform}</p>
      </div>
    </div>
  );
}
