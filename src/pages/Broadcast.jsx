import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Broadcast = () => {
  // State for Meta templates
  const [metaTemplates, setMetaTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // State for customers
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  // UI state
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch templates and customers on mount
  useEffect(() => {
    fetchMetaTemplates();
    fetchCustomers();
  }, []);

  const fetchMetaTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await api.get('/api/broadcast/meta-templates?status=APPROVED');
      setMetaTemplates(res.data);
      if (res.data.length === 0) {
        setMessage('No approved templates found in Meta. Please create a template in WhatsApp Manager.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to load templates. Ensure your WhatsApp number is connected.');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSendBroadcast = async () => {
    if (!selectedTemplate) {
      setMessage('Please select a template');
      return;
    }
    if (selectedCustomers.length === 0) {
      setMessage('Please select at least one customer');
      return;
    }

    // Get phone numbers of selected customers
    const recipientPhones = selectedCustomers
      .map(cid => customers.find(c => c.id === cid)?.phone_number)
      .filter(Boolean);

    setSending(true);
    try {
      const res = await api.post('/api/broadcast/send-meta', {
        template_name: selectedTemplate.name,
        language_code: selectedTemplate.language || 'en_US',
        recipient_phone_numbers: recipientPhones
      });
      setMessage(`Broadcast queued! Sending to ${res.data.recipient_count} customer(s) using template "${selectedTemplate.name}".`);
      setSelectedCustomers([]);
      setSelectedTemplate(null);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Broadcast</h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700 border border-blue-200">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Meta Templates */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Select Template (Meta)</h2>
          {loadingTemplates && <div className="text-gray-500">Loading templates...</div>}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {metaTemplates.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className={`p-3 border rounded cursor-pointer transition ${
                  selectedTemplate?.id === t.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs text-gray-500">{t.category} · {t.language}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {t.components?.[0]?.text?.substring(0, 80)}...
                </div>
                <div className="mt-1">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
            {!loadingTemplates && metaTemplates.length === 0 && (
              <div className="text-gray-500 text-center py-4">
                No approved templates. Create one in WhatsApp Manager.
              </div>
            )}
          </div>
        </div>

        {/* Right: Customers */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Select Recipients</h2>
          <div className="max-h-96 overflow-y-auto">
            {customers.map(c => (
              <label key={c.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCustomers.includes(c.id)}
                  onChange={() => toggleCustomerSelection(c.id)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">{c.name || c.phone_number}</div>
                  <div className="text-sm text-gray-500">{c.phone_number}</div>
                </div>
              </label>
            ))}
            {customers.length === 0 && (
              <div className="text-gray-500 text-center py-4">No customers added yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Send Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSendBroadcast}
          disabled={sending || !selectedTemplate || selectedCustomers.length === 0}
          className={`px-6 py-2 rounded ${
            sending || !selectedTemplate || selectedCustomers.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {sending ? 'Sending...' : `Send to ${selectedCustomers.length} customer(s)`}
        </button>
      </div>
    </div>
  );
};

export default Broadcast;