import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TemplateBuilderModal from '../components/TemplateBuilderModal';

const WhatsAppTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Send modal states
  const [sendingTemplate, setSendingTemplate] = useState(null);
  const [sendVariables, setSendVariables] = useState([]);
  const [sendValues, setSendValues] = useState({});
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (sendModalOpen) {
      fetchCustomers();
    }
  }, [sendModalOpen]);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/api/customers');
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/whatsapp/templates', {
        params: { status: filterStatus !== 'all' ? filterStatus : undefined }
      });
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncTemplates = async () => {
    await api.get('/api/whatsapp/templates/sync');
    fetchTemplates();
  };

  useEffect(() => {
    fetchTemplates();
  }, [filterStatus]);

  const openSendModal = async (template) => {
    setSendingTemplate(template);
    setSelectedCustomerIds([]);
    try {
      const res = await api.get(`/api/whatsapp/templates/${template.id}/variables`);
      const vars = res.data.variables;
      setSendVariables(vars);
      // Initialize values object with empty strings using placeholder name as key
      const initial = {};
      vars.forEach(v => { initial[v.label] = ''; });
      setSendValues(initial);
      setSendModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Could not load template variables');
    }
  };

  const handleCustomerToggle = (customerId) => {
    setSelectedCustomerIds(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSend = async () => {
    if (!sendingTemplate) return;
    if (selectedCustomerIds.length === 0) {
      alert('Select at least one customer');
      return;
    }
    // Check all variables filled
    const missing = sendVariables.filter(v => !sendValues[v.label]?.trim());
    if (missing.length) {
      alert(`Please fill all variables: ${missing.map(v => v.label).join(', ')}`);
      return;
    }
    setSending(true);
    try {
      await api.post('/api/whatsapp/templates/send', {
        template_id: sendingTemplate.id,
        recipient_ids: selectedCustomerIds,
        values: sendValues   // keys are placeholder names (e.g., "name", "1")
      });
      alert('Template queued for sending');
      setSendModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.language.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">WhatsApp Message Templates</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and send approved templates</p>
        </div>
        <div className="flex gap-3">
          <button onClick={syncTemplates} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 text-sm font-medium shadow-sm hover:bg-slate-50">
            <i className="fas fa-sync-alt text-emerald-600"></i> Sync from Meta
          </button>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium shadow-md hover:bg-emerald-700">
            <i className="fas fa-plus"></i> Create New Template
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'approved', 'pending', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${
                  filterStatus === status
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search by name or language"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl w-64 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No templates found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{t.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{t.language}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(t.status)} capitalize`}>{t.status}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openSendModal(t)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-full transition"
                    title="Send"
                  >
                    <i className="fas fa-paper-plane">Send</i>
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-amber-600 rounded-full transition" title="Edit">
                    <i className="fas fa-edit">Edit</i>
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-500 line-clamp-2">
                {t.components.find(c => c.type === 'BODY')?.text || 'No body text'}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <span className={`text-xs font-medium ${t.category === 'MARKETING' ? 'text-purple-600' : t.category === 'AUTHENTICATION' ? 'text-indigo-600' : 'text-blue-600'}`}>
                  {t.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <TemplateBuilderModal open={showModal} onClose={() => setShowModal(false)} onSuccess={fetchTemplates} />

      {/* Send Modal */}
      {sendModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 mx-4">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Send Template: {sendingTemplate?.name}</h2>
              <button onClick={() => setSendModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Variables Form */}
              {sendVariables.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700">Template Variables</h3>
                  {sendVariables.map(v => (
                    <div key={v.label}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {v.label} <span className="text-xs text-slate-400">{`({{${v.label}}})`}</span>
                      </label>
                      <input
                        type="text"
                        value={sendValues[v.label] || ''}
                        onChange={e => setSendValues({...sendValues, [v.label]: e.target.value})}
                        className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm"
                        placeholder={`Enter value for {{${v.label}}}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Selection */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Customers</h3>
                {customers.length === 0 ? (
                  <div className="text-sm text-slate-400">Loading customers...</div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 w-10"></th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customers.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleCustomerToggle(c.id)}>
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selectedCustomerIds.includes(c.id)}
                                onChange={() => {}}
                                className="h-4 w-4"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-700">{c.name || '-'}</td>
                            <td className="px-4 py-2 text-sm text-slate-500">{c.phone_number || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="mt-2 text-xs text-slate-400">
                  {selectedCustomerIds.length} customer(s) selected
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setSendModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTemplates;