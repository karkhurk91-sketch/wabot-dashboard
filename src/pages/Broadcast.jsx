// src/pages/Broadcast.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Reusable customer selector with pagination, search, and checkboxes
const CustomerSelector = ({ selectedIds, onToggle, customers, loading }) => {
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
      // Add all page IDs to selection (without duplicates)
      onToggle(pageIds, true);  // true means add
    } else {
      // Remove page IDs from selection
      onToggle(pageIds, false); // false means remove
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <input
          type="text"
          placeholder="Search by name, phone, email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="border p-2 rounded w-64"
        />
        <div className="flex items-center gap-2">
          <span>Rows:</span>
          <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }} className="border p-1 rounded">
            <option>10</option><option>25</option><option>50</option>
          </select>
        </div>
      </div>
      <div className="border rounded overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 w-10">
                <input
                  type="checkbox"
                  checked={allCurrentPageSelected}
                  onChange={handleMasterCheck}
                />
              </th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(c => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c.id)}
                    onChange={() => onToggle(c.id)}
                  />
                </td>
                <td className="px-4 py-2">{c.name || '-'}</td>
                <td className="px-4 py-2">{c.phone_number || '-'}</td>
                <td className="px-4 py-2">{c.email || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="text-sm text-gray-500">{(page * rowsPerPage) + 1} – {Math.min((page+1)*rowsPerPage, filtered.length)} of {filtered.length}</div>
        <div className="flex gap-2">
          <button disabled={page === 0} onClick={() => setPage(page-1)} className="px-3 py-1 border rounded">Previous</button>
          <button disabled={page+1 >= totalPages} onClick={() => setPage(page+1)} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </div>
  );
};

const Broadcast = () => {
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
      // The API returns paginated object { data: [...], total, page }
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

  // Universal toggle for customer selection (handles both single ID and array)
  const toggleCustomerSelection = (channel, ids, addMode = null) => {
    setSelectedCustomers(prev => {
      const current = prev[channel] || [];
      let updated;
      if (Array.isArray(ids)) {
        if (addMode === true) {
          // Add all ids not already in selection
          updated = [...current, ...ids.filter(id => !current.includes(id))];
        } else if (addMode === false) {
          // Remove all ids from selection
          updated = current.filter(id => !ids.includes(id));
        } else {
          // If addMode not provided, replace selection with these ids
          updated = [...ids];
        }
      } else {
        // Single ID toggle
        updated = current.includes(ids)
          ? current.filter(id => id !== ids)
          : [...current, ids];
      }
      return { ...prev, [channel]: updated };
    });
  };

  const handleSendWhatsApp = async (channel) => {
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Broadcast</h1>
      {statusMsg && <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">{statusMsg}</div>}
      <div className="space-y-4">
        {channels.map(ch => (
          <div key={ch.channel_type} className="border rounded-lg bg-white shadow-sm">
            <button
              onClick={() => toggleChannel(ch.channel_type)}
              className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg hover:bg-gray-50 transition"
            >
              <span className="capitalize">{ch.channel_type}</span>
              <span>{expandedChannel === ch.channel_type ? '▲' : '▼'}</span>
            </button>
            {expandedChannel === ch.channel_type && (
              <div className="p-4 border-t">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left panel – Message input */}
                  <div>
                    <h3 className="font-medium mb-2">Message</h3>
                    {ch.channel_type === 'whatsapp' ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
                        {(metaTemplates.whatsapp || []).map(t => (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTemplate(prev => ({ ...prev, whatsapp: t }))}
                            className={`p-2 border rounded cursor-pointer ${selectedTemplate.whatsapp?.id === t.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                          >
                            <div className="font-semibold">{t.name}</div>
                            <div className="text-sm text-gray-600">{t.components?.[0]?.text?.substring(0, 60)}...</div>
                            <div className="text-xs text-gray-500">{t.language}</div>
                          </div>
                        ))}
                        {!metaTemplates.whatsapp && <div>Loading templates...</div>}
                        {metaTemplates.whatsapp?.length === 0 && <div>No approved templates</div>}
                      </div>
                    ) : (
                      <textarea
                        placeholder="Message content"
                        rows="5"
                        value={messageText[ch.channel_type] || ''}
                        onChange={e => setMessageText(prev => ({ ...prev, [ch.channel_type]: e.target.value }))}
                        className="w-full border p-2 rounded"
                      />
                    )}
                  </div>
                  {/* Right panel – Customers */}
                  <div>
                    <h3 className="font-medium mb-2">Select Customers</h3>
                    <CustomerSelector
                      customers={customers}
                      selectedIds={selectedCustomers[ch.channel_type] || []}
                      onToggle={(ids, addMode) => toggleCustomerSelection(ch.channel_type, ids, addMode)}
                      loading={false}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={ch.channel_type === 'whatsapp' ? () => handleSendWhatsApp(ch.channel_type) : () => handleSendOther(ch.channel_type)}
                    disabled={sending[ch.channel_type] || (selectedCustomers[ch.channel_type] || []).length === 0}
                    className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50"
                  >
                    {sending[ch.channel_type] ? 'Sending...' : `Send via ${ch.channel_type.toUpperCase()}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {channels.length === 0 && <div className="text-gray-500">No channels enabled. Contact super admin.</div>}
      </div>
    </div>
  );
};

export default Broadcast;