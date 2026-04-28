// src/pages/AdminAITest.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const AdminAITest = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedOrgName, setSelectedOrgName] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    const res = await api.get('/api/admin/organizations');
    setOrganizations(res.data);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending || !selectedOrg) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await api.post('/api/admin/ai-test/chat', {
        organization_id: selectedOrg,
        message: userMsg.content
      });
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Error: ${err.response?.data?.detail || 'Unknown error'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      }]);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleOrgChange = (e) => {
    const orgId = e.target.value;
    const org = organizations.find(o => o.id === orgId);
    setSelectedOrg(orgId);
    setSelectedOrgName(org ? org.name : '');
    setMessages([]);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header with org selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Agent Test</h1>
          <p className="text-sm text-gray-500">Test responses for any organization</p>
        </div>
        <div className="w-64">
          <label className="block text-xs font-medium text-gray-500 mb-1">Organization</label>
          <select
            value={selectedOrg}
            onChange={handleOrgChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Select organization --</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat container – fixed height, no page shift */}
      {selectedOrg ? (
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Chat header */}
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-sm">
              {selectedOrgName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{selectedOrgName}</div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span>AI Agent ready</span>
              </div>
            </div>
          </div>

          {/* Messages area – fixed height, scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 280px)' }}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">Send a message to start testing</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-none'
                      : msg.isError
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>
                  <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="bg-green-600 text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg font-medium">Select an organization</p>
            <p className="text-sm">Choose an organization from the dropdown to start testing the AI.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAITest;