import React, { useState, useEffect } from 'react';
import { fetchBots, createBot, updateBot, activateBot, deleteBot } from '../api/bots';
import { useAuth } from '../context/AuthContext';

const BotBuilder = () => {
  const { user } = useAuth();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    config: JSON.stringify({
      fields: [
        { name: 'name', question: 'What is your name?', type: 'text', required: true }
      ],
      confirmation: { enabled: true, message: 'Please confirm your details:' }
    }, null, 2),
    version: 1
  });
  const [jsonError, setJsonError] = useState('');
  const [templateId, setTemplateId] = useState('');

  // Load bots on mount
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
      alert('Failed to load bots');
    } finally {
      setLoading(false);
    }
  };

  // Load a template (copy config from another bot)
  const loadTemplate = async () => {
    if (!templateId) return;
    const templateBot = bots.find(b => b.id === templateId);
    if (!templateBot) return;
    setFormData({
      name: `${templateBot.name} (Copy)`,
      description: templateBot.description || '',
      config: JSON.stringify(templateBot.config, null, 2),
      version: 1
    });
    setJsonError('');
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setJsonError('');
    let config;
    try {
      config = typeof formData.config === 'string' ? JSON.parse(formData.config) : formData.config;
    } catch (err) {
      setJsonError('Invalid JSON configuration');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      config: config,
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
      alert('Operation failed');
    }
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

  const editBot = (bot) => {
    setSelectedBot(bot);
    setFormData({
      name: bot.name,
      description: bot.description || '',
      config: JSON.stringify(bot.config, null, 2),
      version: bot.version
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setSelectedBot(null);
    setIsEditing(false);
    setFormData({
      name: '',
      description: '',
      config: JSON.stringify({
        fields: [{ name: 'name', question: 'What is your name?', type: 'text', required: true }],
        confirmation: { enabled: true, message: 'Please confirm your details:' }
      }, null, 2),
      version: 1
    });
    setJsonError('');
    setTemplateId('');
  };

  // Filter bots that can be used as templates (all inactive bots, excluding the one being edited)
  const availableTemplates = bots.filter(b => !b.is_active && (!selectedBot || b.id !== selectedBot.id));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Bot Builder</h1>

      {/* Form for Create/Edit */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Bot' : 'Create New Bot'}</h2>

        {/* Template Loader (only when creating new bot) */}
        {!isEditing && availableTemplates.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
            <label className="block text-sm font-medium mb-1">Load from Template</label>
            <div className="flex gap-2">
              <select
                className="flex-1 border rounded px-3 py-2"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                <option value="">-- Select a template --</option>
                {availableTemplates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>{tpl.name} (v{tpl.version})</option>
                ))}
              </select>
              <button
                type="button"
                onClick={loadTemplate}
                disabled={!templateId}
                className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Load
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Load configuration from an existing bot as a starting point.</p>
          </div>
        )}

        <form onSubmit={handleCreateOrUpdate}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Bot Name</label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">JSON Configuration</label>
            <textarea
              className="w-full font-mono text-sm border rounded px-3 py-2"
              rows="12"
              value={formData.config}
              onChange={(e) => setFormData({ ...formData, config: e.target.value })}
            />
            {jsonError && <p className="text-red-500 text-sm mt-1">{jsonError}</p>}
            <p className="text-gray-500 text-xs mt-1">
              Must contain "fields" array with name, question, type (text/button/list).
            </p>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {isEditing ? 'Update Bot' : 'Create Bot'}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bot List (unchanged) */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b">Existing Bots</h2>
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : bots.length === 0 ? (
          <p className="p-4 text-gray-500">No bots yet. Create one above.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bots.map((bot) => (
                <tr key={bot.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{bot.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bot.version}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${bot.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {bot.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(bot.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button onClick={() => editBot(bot)} className="text-blue-600 hover:underline">Edit</button>
                    {!bot.is_active && (
                      <button onClick={() => handleActivate(bot)} className="text-green-600 hover:underline">Activate</button>
                    )}
                    {!bot.is_active && (
                      <button onClick={() => handleDelete(bot)} className="text-red-600 hover:underline">Delete</button>
                    )}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BotBuilder;