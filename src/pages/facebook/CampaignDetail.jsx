import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    // Fetch campaign details
  }, [id]);

  return <div className="max-w-6xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Campaign Detail</h1></div>;
}