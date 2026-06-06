import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchConversationFlow, updateConversationFlow } from '../services/organizationApi';

const DEFAULT_FLOW = [
  { field: 'name', action: 'ask_name', required: true, prompt: 'May I know your name?', type: 'text' },
  {
    field: 'budget',
    action: 'ask_budget',
    required: true,
    prompt: 'What is your budget range?',
    type: 'button',
    options: [
      { id: 'budget_less_20', title: '< ₹20L', value: '< ₹20L' },
      { id: 'budget_20_50', title: '₹20–50L', value: '₹20–50L' },
      { id: 'budget_more_50', title: '> ₹50L', value: '> ₹50L' }
    ]
  },
  {
    field: 'location',
    action: 'ask_location',
    required: true,
    prompt: 'Choose one from the list.',
    type: 'list',
    header: 'Select preferred location',
    body: 'Choose one from the list',
    footer: 'Indore properties',
    interactive_action: {
      button: 'View locations',
      sections: [
        {
          title: 'Popular Areas',
          rows: [
            { id: 'loc_rajendra', title: 'Rajendra Nagar' },
            { id: 'loc_vijay', title: 'Vijay Nagar' },
            { id: 'loc_scheme78', title: 'Scheme No. 78' }
          ]
        }
      ]
    }
  },
  {
    field: 'bhk',
    action: 'ask_bhk',
    required: true,
    prompt: 'How many bedrooms do you need?',
    type: 'button',
    options: [
      { id: 'bhk_1', title: '1 BHK', value: '1 BHK' },
      { id: 'bhk_2', title: '2 BHK', value: '2 BHK' },
      { id: 'bhk_3', title: '3 BHK', value: '3 BHK' }
    ]
  },
  {
    field: 'possession',
    action: 'ask_possession',
    required: true,
    prompt: 'When would you like to move in?',
    type: 'button',
    options: [
      { id: 'possession_immediate', title: 'Immediate', value: 'immediate' },
      { id: 'possession_1_2', title: '1-2 months', value: '1-2 months' },
      { id: 'possession_3_6', title: '3-6+ months', value: '3-6+ months' }
    ]
  },
  {
    field: 'confirm',
    action: 'ask_confirmation',
    required: false,
    prompt: 'Please confirm your details:',
    type: 'button',
    options: [
      { id: 'confirm_yes', title: 'Confirm', value: true },
      { id: 'confirm_no', title: 'Change', value: false }
    ]
  }
];

function validateSteps(flow) {
  if (!Array.isArray(flow)) {
    return ['Flow must be an array of step objects.'];
  }

  const errors = [];
  flow.forEach((step, idx) => {
    const prefix = `Step ${idx + 1}`;
    if (!step || typeof step !== 'object') {
      errors.push(`${prefix}: step must be an object.`);
      return;
    }
    if (!step.field || typeof step.field !== 'string') {
      errors.push(`${prefix}: field is required and must be a string.`);
    }
    if (!step.action || (typeof step.action !== 'string' && typeof step.action !== 'object')) {
      errors.push(`${prefix}: action is required and should be a string or object.`);
    }
    if (!step.type || !['text', 'button', 'list'].includes(step.type)) {
      errors.push(`${prefix}: type is required and must be text, button, or list.`);
    }
    if (step.type === 'button') {
      if (!Array.isArray(step.options) || step.options.length === 0) {
        errors.push(`${prefix}: button steps require an options array.`);
      } else {
        if (step.options.length > 3) {
          errors.push(`${prefix}: button steps can have at most 3 options.`);
        }
        step.options.forEach((opt, optIdx) => {
          if (!opt || typeof opt !== 'object') {
            errors.push(`${prefix}: option ${optIdx + 1} must be an object.`);
            return;
          }
          if (!opt.id) errors.push(`${prefix}: option ${optIdx + 1} is missing id.`);
          if (!opt.title) errors.push(`${prefix}: option ${optIdx + 1} is missing title.`);
        });
      }
    }
    if (step.type === 'list') {
      if (!step.action || typeof step.action !== 'string') {
        errors.push(`${prefix}: list steps require a string action name like ask_location.`);
      }
      if (step.interactive_action && typeof step.interactive_action !== 'object') {
        errors.push(`${prefix}: interactive_action must be an object when provided.`);
      }
    }
  });
  return errors;
}

const ConversationFlows = () => {
  const { user } = useAuth();
  const orgId = user?.org_id;
  const [flowType, setFlowType] = useState('buyer');
  const [steps, setSteps] = useState([]);
  const [rawJsonMode, setRawJsonMode] = useState(false);
  const [rawJson, setRawJson] = useState('');
  const [flowSource, setFlowSource] = useState('custom');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (orgId) loadFlow();
  }, [orgId, flowType]);

  const loadFlow = async () => {
    setLoading(true);
    setMessage(null);
    setErrors([]);
    try {
      const res = await fetchConversationFlow(orgId, flowType);
      const data = res.data;
      const loaded = data?.steps && data.steps.length ? data.steps : DEFAULT_FLOW;
      setSteps(loaded);
      setRawJson(JSON.stringify(loaded, null, 2));
      setFlowSource(data?.source || 'custom');
    } catch (err) {
      console.error('Failed to load flow', err);
      setMessage({ type: 'error', text: (err.response?.data?.detail) || 'Failed to load flow; loading default.' });
      setSteps(DEFAULT_FLOW);
      setRawJson(JSON.stringify(DEFAULT_FLOW, null, 2));
      setFlowSource('default');
    } finally {
      setLoading(false);
    }
  };

  const syncRawToSteps = () => {
    try {
      const parsed = JSON.parse(rawJson || '[]');
      if (!Array.isArray(parsed)) {
        setErrors(['Raw JSON must contain an array.']);
        return false;
      }
      setSteps(parsed);
      setErrors([]);
      return true;
    } catch (err) {
      setErrors(['Raw JSON is invalid: ' + err.message]);
      return false;
    }
  };

  const syncStepsToRaw = (currentSteps) => {
    setRawJson(JSON.stringify(currentSteps, null, 2));
  };

  const toggleRawJsonMode = () => {
    if (!rawJsonMode) {
      setRawJson(JSON.stringify(steps, null, 2));
      setRawJsonMode(true);
    } else {
      if (syncRawToSteps()) {
        setRawJsonMode(false);
      }
    }
  };

  const saveFlow = async () => {
    setMessage(null);
    setErrors([]);
    let payloadSteps = rawJsonMode ? null : steps;

    if (rawJsonMode) {
      const parsed = syncRawToSteps();
      if (!parsed) {
        return;
      }
      payloadSteps = JSON.parse(rawJson || '[]');
    }

    const validation = validateSteps(payloadSteps);
    if (validation.length > 0) {
      setErrors(validation);
      setMessage({ type: 'error', text: 'Fix validation issues before saving.' });
      return;
    }

    try {
      const payload = { flow_type: flowType, steps: payloadSteps, is_active: true };
      await updateConversationFlow(orgId, flowType, payload);
      setMessage({ type: 'success', text: 'Conversation flow saved' });
      setSteps(payloadSteps);
      setRawJson(JSON.stringify(payloadSteps, null, 2));
      setFlowSource('custom');
    } catch (err) {
      console.error('Failed to save flow', err);
      setMessage({ type: 'error', text: (err.response?.data?.detail) || err.message || 'Save failed' });
    }
  };

  const addStep = () => setSteps(prev => ([...prev, { field: '', action: '', prompt: '', type: 'text', required: true, options: [] }]));
  const removeStep = (idx) => setSteps(prev => prev.filter((_, i) => i !== idx));
  const updateStep = (idx, key, value) => setSteps(prev => prev.map((s, i) => {
    if (i !== idx) return s;
    const nextStep = { ...s, [key]: value };
    if (key === 'type' && value === 'button' && !Array.isArray(nextStep.options)) {
      nextStep.options = [];
    }
    return nextStep;
  }));
  const getOptionCount = (step) => (step.options || []).length;
  const addOption = (stepIndex) => setSteps(prev => prev.map((step, idx) => {
    if (idx !== stepIndex) return step;
    const currentOptions = step.options || [];
    if (currentOptions.length >= 3) return step;
    return { ...step, options: [...currentOptions, { id: '', title: '', value: '' }] };
  }));
  const updateOption = (stepIndex, optionIndex, key, value) => setSteps(prev => prev.map((step, idx) => {
    if (idx !== stepIndex) return step;
    const options = (step.options || []).map((opt, optIdx) => optIdx === optionIndex ? { ...opt, [key]: value } : opt);
    return { ...step, options };
  }));
  const removeOption = (stepIndex, optionIndex) => setSteps(prev => prev.map((step, idx) => {
    if (idx !== stepIndex) return step;
    const options = (step.options || []).filter((_, optIdx) => optIdx !== optionIndex);
    return { ...step, options };
  }));

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Conversation Flows</h1>
      <p className="text-sm text-gray-600 mb-4">Create or edit organization-specific conversation flows. You can use the form editor or raw JSON.</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm">Flow type:</label>
        <select value={flowType} onChange={(e) => setFlowType(e.target.value)} className="border px-2 py-1 rounded">
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="renter">Renter</option>
        </select>
        <button disabled={loading} onClick={loadFlow} className="ml-2 bg-gray-200 px-3 py-1 rounded">Reload</button>
        <button disabled={loading} onClick={toggleRawJsonMode} className="ml-2 bg-gray-100 px-3 py-1 rounded">{rawJsonMode ? 'Form Editor' : 'Raw JSON'}</button>
        <div className="ml-auto text-sm text-gray-500">Source: <span className="font-medium text-gray-700">{flowSource}</span></div>
      </div>

      {message && (
        <div className={`mb-4 p-2 rounded ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message.text}
        </div>
      )}
      {errors.length > 0 && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <strong className="block font-semibold mb-2">Validation errors:</strong>
          <ul className="list-disc ml-5 space-y-1">
            {errors.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        </div>
      )}

      {!rawJsonMode ? (
        <div>
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-semibold text-gray-600">Step {idx + 1}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">{step.type || 'text'}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${step.required !== false ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{step.required !== false ? 'Required' : 'Optional'}</span>
                  </div>
                  <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => removeStep(idx)}>Remove</button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Field</label>
                    <input className="w-full border px-3 py-2 rounded" placeholder="field" value={step.field || ''} onChange={(e) => updateStep(idx, 'field', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
                    <input className="w-full border px-3 py-2 rounded" placeholder="action" value={step.action || ''} onChange={(e) => updateStep(idx, 'action', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                    <select className="w-full border px-3 py-2 rounded" value={step.type || 'text'} onChange={(e) => updateStep(idx, 'type', e.target.value)}>
                      <option value="text">text</option>
                      <option value="button">button</option>
                      <option value="list">list</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Prompt</label>
                  <input className="w-full border px-3 py-2 rounded" placeholder="prompt" value={step.prompt || ''} onChange={(e) => updateStep(idx, 'prompt', e.target.value)} />
                </div>

                {step.type === 'button' && (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Button options</p>
                        <p className="text-xs text-gray-500">Each option generates a reply button. WhatsApp allows up to 3 buttons.</p>
                      </div>
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
                        onClick={() => addOption(idx)}
                        disabled={getOptionCount(step) >= 3}
                      >
                        Add option
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(step.options || []).map((opt, optIdx) => (
                        <div key={optIdx} className="grid gap-2 md:grid-cols-[1fr_2fr_2fr_auto]">
                          <input className="border px-2 py-2 rounded" placeholder="id" value={opt.id || ''} onChange={(e) => updateOption(idx, optIdx, 'id', e.target.value)} />
                          <input className="border px-2 py-2 rounded" placeholder="title" value={opt.title || ''} onChange={(e) => updateOption(idx, optIdx, 'title', e.target.value)} />
                          <input className="border px-2 py-2 rounded" placeholder="value" value={opt.value || ''} onChange={(e) => updateOption(idx, optIdx, 'value', e.target.value)} />
                          <button className="bg-red-500 text-white rounded px-3 py-2" onClick={() => removeOption(idx, optIdx)}>Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step.type === 'list' && (
                  <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
                    List steps require structured payload. Please use raw JSON mode to edit list action sections.
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={addStep} className="bg-blue-500 text-white px-4 py-2 rounded">Add Step</button>
            <button onClick={() => { setSteps(DEFAULT_FLOW); setRawJson(JSON.stringify(DEFAULT_FLOW, null, 2)); }} className="bg-gray-200 px-4 py-2 rounded">Load Default</button>
          </div>
        </div>
      ) : (
        <textarea rows={20} className="w-full border rounded p-3 font-mono text-sm" value={rawJson} onChange={(e) => setRawJson(e.target.value)} />
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={saveFlow} className="bg-green-600 text-white px-4 py-2 rounded">Save Flow</button>
        <button onClick={() => { setSteps([]); setRawJson('[]'); }} className="bg-gray-200 px-4 py-2 rounded">Clear</button>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <strong>Note:</strong> Each step is an object with keys such as <code>field</code>, <code>action</code>, <code>prompt</code>, <code>type</code>, <code>required</code>, and <code>options</code>. Use <em>Load Default</em> to start from a recommended buyer flow.
      </div>
    </div>
  );
};

export default ConversationFlows;
