import React, { useState, useEffect } from 'react';
import { fetchBots, createBot, updateBot, activateBot, deleteBot } from '../api/bots';
import { useAuth } from '../context/AuthContext';

const BotBuilder = () => {
  const { user } = useAuth();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rawJsonMode, setRawJsonMode] = useState(false);
  const [jsonError, setJsonError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: 1,
    config: {
      fields: [
        {
          name: 'intent',
          question: 'Are you looking to buy or rent?',
          type: 'button',
          required: true,
          options: [
            { id: 'buy', title: 'Buy' },
            { id: 'rent', title: 'Rent' }
          ]
        }
      ],
      confirmation: {
        enabled: true,
        message: 'Please confirm your details:',
        confirm_label: 'Confirm',
        change_label: 'Change'
      }
    }
  });

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    setLoading(true);
    try {
      const res = await fetchBots();
      setBots(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Field management
  const addField = () => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        fields: [
          ...prev.config.fields,
          { name: '', question: '', type: 'text', required: false, options: [] }
        ]
      }
    }));
  };

  const removeField = (index) => {
    const newFields = [...formData.config.fields];
    newFields.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, fields: newFields }
    }));
  };

  const updateField = (index, key, value) => {
    const newFields = [...formData.config.fields];
    newFields[index][key] = value;
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, fields: newFields }
    }));
  };

  const addOption = (fieldIndex) => {
    const newFields = [...formData.config.fields];
    if (!newFields[fieldIndex].options) newFields[fieldIndex].options = [];
    newFields[fieldIndex].options.push({ id: '', title: '' });
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, fields: newFields }
    }));
  };

  const updateOption = (fieldIndex, optIndex, key, value) => {
    const newFields = [...formData.config.fields];
    newFields[fieldIndex].options[optIndex][key] = value;
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, fields: newFields }
    }));
  };

  const removeOption = (fieldIndex, optIndex) => {
    const newFields = [...formData.config.fields];
    newFields[fieldIndex].options.splice(optIndex, 1);
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, fields: newFields }
    }));
  };

  // Raw JSON handling
  const [rawJson, setRawJson] = useState('');
  useEffect(() => {
    setRawJson(JSON.stringify(formData.config, null, 2));
  }, [formData.config]);

  const applyRawJson = () => {
    try {
      const parsed = JSON.parse(rawJson);
      setFormData(prev => ({ ...prev, config: parsed }));
      setJsonError('');
      setRawJsonMode(false);
    } catch (err) {
      setJsonError('Invalid JSON: ' + err.message);
    }
  };

  // Save bot
  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Bot name is required');
      return;
    }
    for (let i = 0; i < formData.config.fields.length; i++) {
      const f = formData.config.fields[i];
      if (!f.name || !f.question) {
        alert(`Field ${i + 1} missing name or question`);
        return;
      }
      if ((f.type === 'button' || f.type === 'list') && (!f.options || f.options.length === 0)) {
        alert(`Field "${f.name}" has no options`);
        return;
      }
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      config: formData.config,
      version: formData.version
    };

    try {
      if (isEditing && selectedBot) {
        await updateBot(selectedBot.id, payload);
        alert('Bot updated');
      } else {
        await createBot(payload);
        alert('Bot created');
      }
      resetForm();
      loadBots();
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  };

  const resetForm = () => {
    setSelectedBot(null);
    setIsEditing(false);
    setFormData({
      name: '',
      description: '',
      version: 1,
      config: {
        fields: [
          {
            name: 'intent',
            question: 'Are you looking to buy or rent?',
            type: 'button',
            required: true,
            options: [
              { id: 'buy', title: 'Buy' },
              { id: 'rent', title: 'Rent' }
            ]
          }
        ],
        confirmation: {
          enabled: true,
          message: 'Please confirm your details:',
          confirm_label: 'Confirm',
          change_label: 'Change'
        }
      }
    });
    setRawJsonMode(false);
  };

  const editBot = (bot) => {
    setSelectedBot(bot);
    setFormData({
      name: bot.name,
      description: bot.description || '',
      version: bot.version,
      config: bot.config
    });
    setIsEditing(true);
    setRawJsonMode(false);
  };

  const handleActivate = async (bot) => {
    if (window.confirm(`Activate "${bot.name}"? Only one bot can be active per organisation.`)) {
      try {
        await activateBot(bot.id);
        loadBots();
      } catch (err) {
        alert('Activation failed');
      }
    }
  };

  const handleDelete = async (bot) => {
    if (window.confirm(`Delete "${bot.name}"? This cannot be undone.`)) {
      try {
        await deleteBot(bot.id);
        loadBots();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Two‑column layout inside main content */}
      <div className="flex flex-1 min-h-0 gap-6">
        
        {/* LEFT COLUMN: Bot Editor (scrollable) */}
        <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-6">
          {/* Toggle (Form / Raw JSON) */}
          <div className="mb-6 flex justify-end">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Flow type:</span>
              <button
                onClick={() => setRawJsonMode(false)}
                className={`px-3 py-1 text-sm rounded-md ${!rawJsonMode ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Form
              </button>
              <button
                onClick={() => setRawJsonMode(true)}
                className={`px-3 py-1 text-sm rounded-md ${rawJsonMode ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Raw JSON
              </button>
            </div>
          </div>

          {/* Bot name & description */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                placeholder="e.g., Real Estate Bot"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Optional"
              />
            </div>
          </div>

          {rawJsonMode ? (
            <div>
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                rows={20}
                className="w-full font-mono text-sm border rounded-md p-3"
              />
              {jsonError && <p className="text-red-500 text-sm mt-2">{jsonError}</p>}
              <div className="mt-4 flex gap-2">
                <button onClick={applyRawJson} className="bg-indigo-600 text-white px-4 py-2 rounded-md">
                  Apply JSON
                </button>
                <button onClick={() => setRawJsonMode(false)} className="bg-gray-300 px-4 py-2 rounded-md">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {formData.config.fields.map((field, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-gray-50 relative">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-md font-medium">Step {idx + 1}</h3>
                      <button onClick={() => removeField(idx)} className="text-red-500 hover:text-red-700 text-sm">
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600">Field name</label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(idx, 'name', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="e.g., budget"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600">Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(idx, 'type', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="button">Button</option>
                          <option value="list">List</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600">Question / Prompt</label>
                      <input
                        type="text"
                        value={field.question}
                        onChange={(e) => updateField(idx, 'question', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="mb-3 flex items-center">
                      <input
                        type="checkbox"
                        checked={field.required || false}
                        onChange={(e) => updateField(idx, 'required', e.target.checked)}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">Required</label>
                    </div>
                    {(field.type === 'button' || field.type === 'list') && (
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Options</label>
                        <div className="space-y-2">
                          {(field.options || []).map((opt, optIdx) => (
                            <div key={optIdx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder="ID (e.g., buy)"
                                value={opt.id || ''}
                                onChange={(e) => updateOption(idx, optIdx, 'id', e.target.value)}
                                className="flex-1 border rounded px-2 py-1 text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Title (e.g., Buy)"
                                value={opt.title || ''}
                                onChange={(e) => updateOption(idx, optIdx, 'title', e.target.value)}
                                className="flex-1 border rounded px-2 py-1 text-sm"
                              />
                              <button onClick={() => removeOption(idx, optIdx)} className="text-red-500 text-sm">
                                ✕
                              </button>
                            </div>
                          ))}
                          <button onClick={() => addOption(idx)} className="text-sm text-indigo-600 hover:text-indigo-800">
                            + Add option
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between">
                <button onClick={addField} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">
                  + Add Step
                </button>
                <div className="flex gap-2">
                  <button onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded-md">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-md">
                    {isEditing ? 'Update Bot' : 'Create Bot'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Existing Bots list (scrollable) */}
        <div className="w-80 bg-white rounded-lg shadow p-4 overflow-y-auto flex-shrink-0">
          <h2 className="font-semibold text-gray-800 mb-3 sticky top-0 bg-white pb-2 border-b">Existing Bots</h2>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : bots.length === 0 ? (
            <p className="text-gray-400">No bots yet.</p>
          ) : (
            <ul className="space-y-3">
              {bots.map((bot) => (
                <li key={bot.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{bot.name}</p>
                      <p className="text-xs text-gray-500">v{bot.version} • {new Date(bot.created_at).toLocaleDateString()}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${bot.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {bot.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => editBot(bot)} className="text-blue-600 text-sm hover:underline">Edit</button>
                      {!bot.is_active && (
                        <button onClick={() => handleActivate(bot)} className="text-green-600 text-sm hover:underline">Activate</button>
                      )}
                      {!bot.is_active && (
                        <button onClick={() => handleDelete(bot)} className="text-red-600 text-sm hover:underline">Delete</button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotBuilder;