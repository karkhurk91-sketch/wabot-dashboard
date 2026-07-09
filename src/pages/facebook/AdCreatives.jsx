import React, { useState, useEffect } from 'react';
import { facebookApi } from '../../services/facebook/api';
import AdPreview from '../../components/facebook/AdPreview';

export default function AdCreatives() {
  const [creatives, setCreatives] = useState([]);

  useEffect(() => {
    // fetch creatives
  }, []);

  return <div className="max-w-6xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Ad Creatives</h1></div>;
}