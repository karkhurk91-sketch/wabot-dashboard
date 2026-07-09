import React, { useState, useEffect } from 'react';
import { facebookApi } from '../../services/facebook/api';

export default function LeadAttribution() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    facebookApi.getFacebookLeads()
      .then(res => setLeads(res.data))
      .catch(console.error);
  }, []);

  return <div className="max-w-6xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Lead Attribution</h1></div>;
}