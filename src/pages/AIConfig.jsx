import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AIConfig = () => {
  const { userRole } = useAuth();
  const [config, setConfig] = useState({
    system_prompt: '',
    temperature: 0.7,
    max_tokens: 500,
    enable_lead_capture: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUserMessage, setPreviewUserMessage] = useState('Hi');
  const [previewBotResponse, setPreviewBotResponse] = useState('');
  const isEditable = userRole === 'org_admin';

  useEffect(() => {
    fetchConfig();
  }, []);

  // Update preview whenever system_prompt changes
  useEffect(() => {
    generatePreview();
  }, [config.system_prompt, previewUserMessage]);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/api/ai/config');
      setConfig(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = () => {
    // Simulate AI response based on the system prompt
    const system = config.system_prompt || 'You are a helpful assistant.';
    const userMsg = previewUserMessage.toLowerCase();
    let botReply = '';

    if (userMsg.includes('hi') || userMsg.includes('hello')) {
      botReply = `👋 ${system.split('.')[0]}. How can I help you today?`;
    } else if (userMsg.includes('menu') || userMsg.includes('show')) {
      botReply = `📋 Sure! Based on your request, here's what I can assist with:\n- View products\n- Check order status\n- Get support\nWould you like more details?`;
    } else {
      botReply = `🤖 I'm here to help. Could you please clarify your request? (System prompt preview: "${system.substring(0, 80)}...")`;
    }
    setPreviewBotResponse(botReply);
  };

  const handleSave = async () => {
    if (!isEditable) {
      alert('You do not have permission to edit AI configuration');
      return;
    }
    setSaving(true);
    try {
      await api.put('/api/ai/config', config);
      alert('Configuration saved');
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading AI configuration...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-2 rounded-2xl">
          <i className="fas fa-robot text-indigo-600 text-xl"></i>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">AI Configuration</h1>
          <p className="text-slate-500 text-sm">Fine‑tune your assistant’s behaviour and capabilities</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Panel – Settings */}
        <div className="md:col-span-2 space-y-6">
          {/* System Prompt Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <i className="fas fa-comment-dots text-indigo-500"></i>
              <h2 className="font-semibold text-slate-800">System Prompt</h2>
              <span className="text-xs text-slate-400 ml-auto bg-white px-2 py-0.5 rounded-full border">Instructions</span>
            </div>
            <div className="p-6">
              <textarea
                rows="5"
                value={config.system_prompt}
                onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
                disabled={!isEditable}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-y"
                placeholder="Enter system prompt..."
              />
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <i className="fas fa-lightbulb text-amber-400"></i>
                <span>Pro tip: Include your business tone, key policies, and how to handle uncertainties.</span>
              </div>
            </div>
          </div>

          {/* Temperature & Max Tokens */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <i className="fas fa-thermometer-half text-orange-500"></i>
                  <h3 className="font-medium text-slate-800">Temperature</h3>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-mono px-2 py-0.5 rounded-full">{config.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                disabled={!isEditable}
                className="w-full mb-2"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>⚡ Deterministic</span>
                <span>🎨 Creative</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Higher values = more creative, lower = more focused.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-sort-amount-up-alt text-emerald-500"></i>
                <h3 className="font-medium text-slate-800">Max Tokens</h3>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={config.max_tokens}
                  onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
                  disabled={!isEditable}
                  step="10"
                  className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-200"
                />
                <span className="text-slate-400 text-sm">~ {Math.floor(config.max_tokens * 0.75)}-{config.max_tokens} words</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Maximum length of AI responses.</p>
            </div>
          </div>

          {/* Lead capture & Save */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={config.enable_lead_capture}
                  onChange={(e) => setConfig({ ...config, enable_lead_capture: e.target.checked })}
                  disabled={!isEditable}
                  className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
              </div>
              <div>
                <span className="font-medium text-slate-700">Enable automatic lead capture</span>
                <p className="text-xs text-slate-400">Extract name, phone, interest from conversations</p>
              </div>
            </label>
            {isEditable && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition flex items-center gap-2"
              >
                <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            )}
          </div>
        </div>

        {/* Right Panel – Live Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden sticky top-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-3 border-b border-indigo-100 flex items-center gap-2">
              <i className="fas fa-message text-indigo-500"></i>
              <span className="font-semibold text-indigo-800 text-sm">Preview assistant style</span>
            </div>
            <div className="p-5 space-y-4">
              {/* Dynamic conversation preview */}
              <div className="space-y-3">
                <div className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">👤</div>
                  <div className="flex-1 bg-slate-100 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-slate-700">{previewUserMessage}</div>
                </div>
                <div className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">🤖</div>
                  <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-2xl rounded-tr-sm px-3 py-2 text-sm text-slate-700 whitespace-pre-wrap">
                    {previewBotResponse || '🤖 Generating preview...'}
                  </div>
                </div>
              </div>

              {/* Input to test custom message */}
              <div className="border-t border-slate-100 pt-3 mt-2">
                <label className="text-xs text-slate-500 block mb-1">Try a sample message:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={previewUserMessage}
                    onChange={(e) => setPreviewUserMessage(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-indigo-200"
                    placeholder="Type a message..."
                  />
                  <button
                    onClick={() => generatePreview()}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-sm hover:bg-indigo-200"
                  >
                    Send
                  </button>
                </div>
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <i className="fas fa-robot"></i>
                  <span>Preview uses your current system prompt (demo simulation).</span>
                </div>
              </div>
            </div>
          </div>

          {/* Help card */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
            <div className="flex gap-2 items-start">
              <i className="fas fa-circle-info text-indigo-400 text-sm mt-0.5"></i>
              <div>
                <h4 className="text-sm font-medium text-slate-700">Need help?</h4>
                <p className="text-xs text-slate-500">Adjust temperature to control creativity; keep lead capture on to automatically qualify prospects.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 pt-10 border-t border-slate-200 mt-8">
        <i className="fas fa-shield-alt"></i> Changes apply immediately to active conversations.
      </div>
    </div>
  );
};

export default AIConfig;