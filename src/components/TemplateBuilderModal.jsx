import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TemplateBuilderModal = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('UTILITY');
  const [language, setLanguage] = useState('en_US');
  const [bodyText, setBodyText] = useState('Hi {{1}}, your order #{{2}} has been confirmed.');
  const [footerText, setFooterText] = useState('');
  const [headerType, setHeaderType] = useState('none');
  const [headerText, setHeaderText] = useState('');
  const [headerMediaUrl, setHeaderMediaUrl] = useState('');
  const [buttons, setButtons] = useState([]);
  const [variables, setVariables] = useState([]);
  const [sampleValues, setSampleValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setCategory('UTILITY');
    setLanguage('en_US');
    setBodyText('Hi {{1}}, your order #{{2}} has been confirmed.');
    setFooterText('');
    setHeaderType('none');
    setHeaderText('');
    setHeaderMediaUrl('');
    setButtons([]);
    setError('');
  }, [open]);

  useEffect(() => {
    const matches = bodyText.match(/\{\{(\d+)\}\}/g);
    const varNumbers = matches ? [...new Set(matches.map(m => parseInt(m.match(/\d+/)[0])))].sort((a,b)=>a-b) : [];
    setVariables(varNumbers);
    const newSamples = {};
    varNumbers.forEach(v => {
      if (!sampleValues[v]) newSamples[v] = v === 1 ? 'John' : v === 2 ? 'ORD-12345' : 'May 25, 2026';
      else newSamples[v] = sampleValues[v];
    });
    setSampleValues(prev => ({...prev, ...newSamples}));
  }, [bodyText]);

  const addButton = () => {
    if (buttons.length >= 3) return alert('Maximum 3 buttons');
    setButtons([...buttons, { type: 'QUICK_REPLY', text: 'Reply', payload: '' }]);
  };

  const removeButton = (idx) => setButtons(buttons.filter((_, i) => i !== idx));
  const updateButton = (idx, field, value) => {
    const newButtons = [...buttons];
    newButtons[idx][field] = value;
    setButtons(newButtons);
  };

  const buildComponents = () => {
    const components = [];
    if (headerType !== 'none') {
      if (headerType === 'text') {
        components.push({ type: 'HEADER', format: 'TEXT', text: headerText });
      } else {
        const comp = { type: 'HEADER', format: headerType.toUpperCase() };
        if (headerMediaUrl) comp.example = { header_handle: [headerMediaUrl] };
        components.push(comp);
      }
    }
    components.push({ type: 'BODY', text: bodyText });
    if (footerText) components.push({ type: 'FOOTER', text: footerText });
    if (buttons.length) {
      const btns = buttons.map(b => {
        const btnObj = { type: b.type, text: b.text };
        if (b.type === 'URL') btnObj.url = b.url || '';
        if (b.type === 'PHONE_NUMBER') btnObj.phone_number = b.phone || '';
        if (b.type === 'QUICK_REPLY') btnObj.payload = b.payload || '';
        return btnObj;
      });
      components.push({ type: 'BUTTONS', buttons: btns });
    }
    return components;
  };

  const handleSubmit = async () => {
    if (!name) return setError('Template name is required');
    if (!bodyText) return setError('Body text is required');
    setSubmitting(true);
    try {
      await api.post('/api/whatsapp/templates', {
        name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        category,
        language,
        components: buildComponents()
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create template');
    } finally {
      setSubmitting(false);
    }
  };

  const getPreviewText = (text) => {
    let result = text;
    variables.forEach(v => {
      const sample = sampleValues[v] || `[${v}]`;
      result = result.replace(new RegExp(`\\{\\{${v}\\}\\}`, 'g'), sample);
    });
    return result;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 mx-4">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Create WhatsApp Template</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times text-xl"></i></button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm">
                <option value="MARKETING">📢 MARKETING</option>
                <option value="UTILITY">🔧 UTILITY</option>
                <option value="AUTHENTICATION">🔐 AUTHENTICATION</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Template name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="lowercase_with_underscores" className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm">
                  <option value="en_US">English (US) – en_US</option>
                  <option value="hi_IN">Hindi – hi_IN</option>
                  <option value="es_MX">Spanish – es_MX</option>
                </select>
              </div>
            </div>

            {/* Header */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Header (optional)</label>
              <select value={headerType} onChange={e => setHeaderType(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm">
                <option value="none">None</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
              </select>
              {headerType === 'text' && (
                <input type="text" value={headerText} onChange={e => setHeaderText(e.target.value)} placeholder="Header text (supports {{1}})" className="mt-2 w-full border border-slate-300 rounded-xl px-4 py-2 text-sm" />
              )}
              {(headerType === 'image' || headerType === 'video' || headerType === 'document') && (
                <input type="url" value={headerMediaUrl} onChange={e => setHeaderMediaUrl(e.target.value)} placeholder="Public sample URL for approval" className="mt-2 w-full border border-slate-300 rounded-xl px-4 py-2 text-sm" />
              )}
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Body * <span className="text-xs text-slate-400">(use {'{{1}}'}, {'{{2}}'}...)</span></label>
              <textarea rows="4" value={bodyText} onChange={e => setBodyText(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm" />
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => setBodyText(bodyText + '{{1}}')} className="text-xs bg-slate-100 px-2 py-1 rounded-full">➕ Insert {'{{1}}'}</button>
                <button type="button" onClick={() => setBodyText(bodyText + '{{2}}')} className="text-xs bg-slate-100 px-2 py-1 rounded-full">➕ Insert {'{{2}}'}</button>
                <button type="button" onClick={() => setBodyText(bodyText + '{{3}}')} className="text-xs bg-slate-100 px-2 py-1 rounded-full">➕ Insert {'{{3}}'}</button>
              </div>
            </div>

            {/* Footer */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Footer (optional)</label>
              <input type="text" value={footerText} onChange={e => setFooterText(e.target.value)} placeholder="Static footer text" maxLength="60" className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm" />
            </div>

            {/* Buttons */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700">Buttons (max 3)</label>
                <button onClick={addButton} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">+ Add button</button>
              </div>
              <div className="space-y-3 mt-3">
                {buttons.map((btn, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-semibold">Button {idx+1}</span>
                      <button onClick={() => removeButton(idx)} className="text-red-400 text-sm"><i className="fas fa-trash-alt"></i></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={btn.type} onChange={e => updateButton(idx, 'type', e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1 text-sm">
                        <option value="QUICK_REPLY">Quick Reply</option>
                        <option value="URL">URL (CTA)</option>
                        <option value="PHONE_NUMBER">Phone (CTA)</option>
                        <option value="COPY_CODE">Copy Code</option>
                      </select>
                      <input type="text" value={btn.text} onChange={e => updateButton(idx, 'text', e.target.value)} placeholder="Button label" className="border border-slate-300 rounded-lg px-2 py-1 text-sm" />
                    </div>
                    {btn.type === 'URL' && <input type="url" value={btn.url || ''} onChange={e => updateButton(idx, 'url', e.target.value)} placeholder="URL (can use {{1}})" className="mt-2 w-full border border-slate-300 rounded-lg px-2 py-1 text-sm" />}
                    {btn.type === 'PHONE_NUMBER' && <input type="tel" value={btn.phone || ''} onChange={e => updateButton(idx, 'phone', e.target.value)} placeholder="Phone number" className="mt-2 w-full border border-slate-300 rounded-lg px-2 py-1 text-sm" />}
                    {btn.type === 'QUICK_REPLY' && <input type="text" value={btn.payload || ''} onChange={e => updateButton(idx, 'payload', e.target.value)} placeholder="Payload (returned to webhook)" className="mt-2 w-full border border-slate-300 rounded-lg px-2 py-1 text-sm" />}
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>

          {/* Right: Live Preview */}
          <div className="bg-slate-50 rounded-2xl p-5 sticky top-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-3">
              <i className="fab fa-whatsapp text-emerald-600 text-xl"></i>
              <span className="font-medium text-slate-700">Live preview</span>
            </div>
            <div className="bg-[#efeae2] p-4 rounded-xl min-h-[400px]">
              <div className="bg-[#dcf8c5] rounded-2xl p-3 max-w-md">
                {headerType !== 'none' && (
                  <div className="mb-2 text-sm font-semibold">
                    {headerType === 'text' && getPreviewText(headerText)}
                    {headerType === 'image' && headerMediaUrl && <img src={headerMediaUrl} className="max-h-32 rounded-lg" alt="header" />}
                    {headerType === 'video' && headerMediaUrl && <video src={headerMediaUrl} className="max-h-32 rounded-lg" controls />}
                  </div>
                )}
                <div className="text-slate-800 text-base">{getPreviewText(bodyText)}</div>
                {footerText && <div className="text-xs text-slate-500 mt-2 pt-1 border-t border-slate-200">{footerText}</div>}
                {buttons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {buttons.map((btn, i) => (
                      <span key={i} className="bg-white border border-slate-300 rounded-full px-3 py-1 text-xs font-medium">{btn.text}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4">
              <details>
                <summary className="text-xs font-mono text-slate-500 cursor-pointer">📋 JSON payload</summary>
                <pre className="text-xs bg-slate-800 text-slate-100 p-3 rounded-lg overflow-auto max-h-60 mt-2">
                  {JSON.stringify({
                    name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'template_name',
                    category,
                    language,
                    components: buildComponents()
                  }, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilderModal;