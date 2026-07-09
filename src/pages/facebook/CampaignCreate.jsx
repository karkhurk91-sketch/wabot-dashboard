import React, { useState } from 'react';
import CampaignWizard from '../../components/facebook/CampaignWizard';

export default function CampaignCreate() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Campaign</h1>
      <CampaignWizard />
    </div>
  );
}