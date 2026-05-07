// src/pages/Broadcast.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Customer selector component with search, pagination, and checkboxes
const CustomerSelector = ({ selectedIds, onToggle, customers }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = (customers || []).filter(c =>
    (c.name?.toLowerCase().includes(search.toLowerCase()) ||
     c.phone_number?.includes(search) ||
     c.email?.toLowerCase().includes(search.toLowerCase()))
  );
  const paginated = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const allCurrentPageSelected = paginated.length > 0 && paginated.every(c => selectedIds.includes(c.id));

  const handleMasterCheck = (e) => {
    const pageIds = paginated.map(c => c.id);
    if (e.target.checked) {
      onToggle(pageIds, true);
    } else {
      onToggle(pageIds, false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center gap-2">
        <input
          type="text"
          placeholder="Search by name, phone, email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Rows:</span>
          <select
            value={rowsPerPage}
            onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
          >
            <option>10</option><option>25</option><option>50</option>
          </select>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allCurrentPageSelected} onChange={handleMasterCheck} className="h-4 w-4" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginated.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c.id)}
                    onChange={() => onToggle(c.id)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.phone_number || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.email || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {(page * rowsPerPage) + 1} – {Math.min((page+1)*rowsPerPage, filtered.length)} of {filtered.length}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(page-1)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            disabled={page+1 >= totalPages}
            onClick={() => setPage(page+1)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const Broadcast = () => {
  const { userRole } = useAuth();
  const [channels, setChannels] = useState([]);
  const [expandedChannel, setExpandedChannel] = useState(null);
  const [metaTemplates, setMetaTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState({});
  const [messageText, setMessageText] = useState({});
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState({});
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchChannels();
    fetchCustomers();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await api.get('/api/organizations/channels');
      setChannels(res.data.filter(ch => ch.enabled));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/api/customers');
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  const fetchMetaTemplates = async (channel) => {
    if (channel !== 'whatsapp') return;
    try {
      const res = await api.get('/api/broadcast/meta-templates?status=APPROVED');
      setMetaTemplates(prev => ({ ...prev, whatsapp: res.data }));
    } catch (err) {
      setStatusMsg('Failed to load WhatsApp templates');
    }
  };

  const toggleChannel = (channel) => {
    if (expandedChannel === channel) {
      setExpandedChannel(null);
    } else {
      setExpandedChannel(channel);
      if (channel === 'whatsapp' && !metaTemplates.whatsapp) {
        fetchMetaTemplates(channel);
      }
    }
  };

  const toggleCustomerSelection = (channel, ids, addMode = null) => {
    setSelectedCustomers(prev => {
      const current = prev[channel] || [];
      let updated;
      if (Array.isArray(ids)) {
        if (addMode === true) {
          updated = [...current, ...ids.filter(id => !current.includes(id))];
        } else if (addMode === false) {
          updated = current.filter(id => !ids.includes(id));
        } else {
          updated = [...ids];
        }
      } else {
        updated = current.includes(ids) ? current.filter(id => id !== ids) : [...current, ids];
      }
      return { ...prev, [channel]: updated };
    });
  };

  const handleSendWhatsApp = async (channel) => {
    if (userRole !== 'org_admin' && userRole !== 'agent') {
      setStatusMsg('You do not have permission to send broadcasts');
      return;
    }
    const template = selectedTemplate[channel];
    if (!template) {
      setStatusMsg('Please select a template for WhatsApp');
      return;
    }
    const recipients = selectedCustomers[channel] || [];
    if (recipients.length === 0) {
      setStatusMsg('Select at least one customer');
      return;
    }
    setSending(prev => ({ ...prev, [channel]: true }));
    try {
      const res = await api.post('/api/broadcast/send-meta-template', {
        template_name: template.name,
        language_code: template.language || 'en_US',
        recipient_ids: recipients
      });
      setStatusMsg(`Broadcast queued via WhatsApp to ${res.data.recipient_count} customers`);
      setSelectedCustomers(prev => ({ ...prev, [channel]: [] }));
      setSelectedTemplate(prev => ({ ...prev, [channel]: null }));
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'Send failed');
    } finally {
      setSending(prev => ({ ...prev, [channel]: false }));
    }
  };

  const handleSendOther = async (channel) => {
    if (userRole !== 'org_admin' && userRole !== 'agent') {
      setStatusMsg('You do not have permission to send broadcasts');
      return;
    }
    const msg = messageText[channel];
    if (!msg?.trim()) {
      setStatusMsg('Enter message content');
      return;
    }
    const recipients = selectedCustomers[channel] || [];
    if (recipients.length === 0) {
      setStatusMsg('Select at least one customer');
      return;
    }
    setSending(prev => ({ ...prev, [channel]: true }));
    try {
      const res = await api.post('/api/broadcast/send-multichannel', {
        channel: channel,
        message: { type: 'text', content: msg },
        recipient_ids: recipients
      });
      setStatusMsg(`Broadcast queued via ${channel} to ${res.data.recipient_count} customers`);
      setSelectedCustomers(prev => ({ ...prev, [channel]: [] }));
      setMessageText(prev => ({ ...prev, [channel]: '' }));
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'Send failed');
    } finally {
      setSending(prev => ({ ...prev, [channel]: false }));
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Broadcast</h1>
        <p className="text-gray-500 mt-1">Send messages to your customers across multiple channels</p>
      </div>

      {statusMsg && (
        <div className="mb-4 p-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
          {statusMsg}
        </div>
      )}

      <div className="space-y-6">
        {channels.map(ch => (
          <div key={ch.channel_type} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
            <button
              onClick={() => toggleChannel(ch.channel_type)}
              className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                {ch.channel_type === 'whatsapp' && <i className="fab fa-whatsapp text-2xl text-green-500"></i>}
                {ch.channel_type === 'facebook' && <i className="fab fa-facebook text-2xl text-blue-600"></i>}
                {ch.channel_type === 'instagram' && <i className="fab fa-instagram text-2xl text-pink-500"></i>}
                <span className="font-semibold text-lg capitalize">{ch.channel_type}</span>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedChannel === ch.channel_type ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedChannel === ch.channel_type && (
              <div className="p-5 border-t border-gray-100 bg-gray-50">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Panel – Message Input */}
                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <i className="fas fa-edit text-indigo-500"></i> Message
                    </h3>
                    {ch.channel_type === 'whatsapp' ? (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {(metaTemplates.whatsapp || []).map(t => (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTemplate(prev => ({ ...prev, whatsapp: t }))}
                            className={`p-3 border rounded-xl cursor-pointer transition ${
                              selectedTemplate.whatsapp?.id === t.id
                                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="font-semibold text-gray-800">{t.name}</div>
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">{t.components?.[0]?.text?.substring(0, 80)}...</div>
                            <div className="text-xs text-gray-400 mt-1">{t.language}</div>
                          </div>
                        ))}
                        {!metaTemplates.whatsapp && <div className="text-gray-500 text-center py-8">Loading templates...</div>}
                        {metaTemplates.whatsapp?.length === 0 && (
                          <div className="text-gray-500 text-center py-8">No approved templates found</div>
                        )}
                      </div>
                    ) : (
                      <textarea
                        rows="6"
                        placeholder="Type your message here..."
                        value={messageText[ch.channel_type] || ''}
                        onChange={e => setMessageText(prev => ({ ...prev, [ch.channel_type]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      />
                    )}
                  </div>

                  {/* Right Panel – Customer Selector */}
                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <i className="fas fa-users text-indigo-500"></i> Select Customers
                    </h3>
                    <CustomerSelector
                      customers={customers}
                      selectedIds={selectedCustomers[ch.channel_type] || []}
                      onToggle={(ids, addMode) => toggleCustomerSelection(ch.channel_type, ids, addMode)}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={ch.channel_type === 'whatsapp' ? () => handleSendWhatsApp(ch.channel_type) : () => handleSendOther(ch.channel_type)}
                    disabled={
                      sending[ch.channel_type] ||
                      (selectedCustomers[ch.channel_type] || []).length === 0 ||
                      (userRole !== 'org_admin' && userRole !== 'agent')
                    }
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition disabled:opacity-50"
                  >
                    {sending[ch.channel_type] ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>🚀 Send via {ch.channel_type.toUpperCase()}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {channels.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <i className="fas fa-plug text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">No channels enabled. Contact your super admin to configure channels.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Broadcast;