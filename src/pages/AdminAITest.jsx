
// src/pages/AdminAITest.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminAITest = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = React.useRef(null);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    const res = await api.get('/api/admin/organizations');
    setOrganizations(res.data);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/api/admin/ai-test/chat', {
        organization_id: selectedOrg,
        message: input
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + (err.response?.data?.detail || 'Unknown error') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI Agent Test (Super Admin)</h1>
      <div className="mb-4">
        <label className="block mb-2">Select Organization</label>
        <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className="border p-2 rounded w-64">
          <option value="">-- Choose --</option>
          {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
        </select>
      </div>
      {selectedOrg && (
        <div className="border rounded-lg bg-white shadow">
          <div className="h-96 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-gray-100 rounded-lg px-4 py-2">Typing...</div></div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="border-t p-2 flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type to test AI..." className="flex-1 border rounded px-3 py-2" disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default AdminAITest;
