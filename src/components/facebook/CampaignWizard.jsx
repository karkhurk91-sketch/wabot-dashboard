import React, { useState } from 'react';
import { facebookApi } from '../../services/facebook/api';

export default function CampaignWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', objective: '', budget: 500 });

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold">Step {step}/3</h2>
      <div className="mt-4">{step === 1 && <div>Objective selection</div>}</div>
      <div className="mt-4 flex justify-between">
        <button onClick={() => setStep(step-1)} disabled={step===1} className="px-4 py-2 border rounded">Back</button>
        <button onClick={() => setStep(step+1)} className="px-4 py-2 bg-indigo-600 text-white rounded">Next</button>
      </div>
    </div>
  );
}