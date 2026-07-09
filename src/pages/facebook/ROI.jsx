import React, { useState, useEffect } from 'react';
import { facebookApi } from '../../services/facebook/api';

export default function ROI() {
  const [roiData, setRoiData] = useState({});

  useEffect(() => {
    facebookApi.getROI()
      .then(res => setRoiData(res.data))
      .catch(console.error);
  }, []);

  return <div className="max-w-6xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">ROI Dashboard</h1></div>;
}