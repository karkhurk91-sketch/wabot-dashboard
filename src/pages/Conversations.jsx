import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Conversations() {
  const { user, userRole } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [globalTags, setGlobalTags] = useState([]);
  const [replyMode, setReplyMode] = useState('ai');
  const [newMessage, setNewMessage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const formatPhone = (phone) => {
    if (!phone) return '';
    if (phone.startsWith('91') && phone.length === 12) return `+${phone}`;
    if (phone.startsWith('0')) return `+91${phone.slice(1)}`;
    return phone;
  };

  const getCustomerDisplay = (conv) => {
    const name = conv.customer_name;
    const phone = conv.customer_phone_number ? formatPhone(conv.customer_phone_number) : '';
    if (name && phone) return `${name} (${phone})`;
    if (phone) return phone;
    if (name) return name;
    return 'Unknown';
  };

  const getStatusIcon = (status) => {
    if (status === 'sent') return <span className="text-gray-400 text-xs">✓</span>;
    if (status === 'delivered') return <span className="text-gray-500 text-xs">✓✓</span>;
    if (status === 'read') return <span className="text-blue-500 text-xs">✓✓</span>;
    return null;
  };

  useEffect(() => {
    fetchConversations();
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (selectedConv) {
      fetchMessages(selectedConv.id);
      fetchNotes(selectedConv.id);
      fetchTags(selectedConv.id);
      fetchGlobalTags();
      pollingIntervalRef.current = setInterval(() => {
        if (selectedConv) fetchMessages(selectedConv.id, true);
      }, 3000);
    }
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [selectedConv]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/conversations');
      setConversations(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchMessages = async (convId, silent = false) => {
    try {
      const res = await api.get(`/api/conversations/${convId}/messages`);
      setMessages(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(res.data)) {
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
          return res.data;
        }
        return prev;
      });
    } catch (err) { if (!silent) console.error(err); }
  };

  const fetchNotes = async (convId) => {
    try { const res = await api.get(`/api/conversations/${convId}/notes`); setNotes(res.data); } catch (err) { console.error(err); }
  };
  const fetchTags = async (convId) => {
    try { const res = await api.get(`/api/conversations/${convId}/tags`); setTags(res.data); } catch (err) { console.error(err); }
  };
  const fetchGlobalTags = async () => {
    try { const res = await api.get('/api/conversations/tags'); setGlobalTags(res.data); } catch (err) { console.error(err); }
  };
  const fetchAgents = async () => {
    if (userRole !== 'org_admin') return;
    try {
      const res = await api.get('/api/conversations/agents');
      setAgents(res.data);
    } catch (err) { console.error(err); }
  };

  const selectConversation = async (conv) => {
    if (selectedConv?.id === conv.id) return;
    setSelectedConv(conv);
    setReplyMode(conv.reply_mode || 'ai');
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || sending) return;
    setSending(true);
    try {
      await api.post(`/api/conversations/${selectedConv.id}/send`, {
        text: newMessage,
        sender_type: replyMode === 'human' ? 'agent' : 'ai',
      });
      setNewMessage('');
      await fetchMessages(selectedConv.id);
      await fetchConversations();
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) { console.error(err); alert('Failed to send message'); } finally { setSending(false); }
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedConv) return;
    try {
      await api.post(`/api/conversations/${selectedConv.id}/notes`, { note: newNote });
      setNewNote('');
      await fetchNotes(selectedConv.id);
    } catch (err) { console.error(err); alert('Failed to add note'); }
  };
  const deleteNote = async (noteId) => {
    try { await api.delete(`/api/conversations/notes/${noteId}`); await fetchNotes(selectedConv.id); } catch (err) { console.error(err); }
  };
  const createTag = async (name) => {
    const res = await api.post('/api/conversations/tags', { name });
    setGlobalTags([...globalTags, res.data]);
    return res.data;
  };
  const attachTag = async (tagId) => {
    if (!selectedConv) return;
    await api.post(`/api/conversations/${selectedConv.id}/tags/${tagId}`);
    await fetchTags(selectedConv.id);
  };
  const detachTag = async (tagId) => {
    if (!selectedConv) return;
    await api.delete(`/api/conversations/${selectedConv.id}/tags/${tagId}`);
    await fetchTags(selectedConv.id);
  };

  const assignAgent = async () => {
    if (!selectedAgentId) return;
    try {
      await api.post(`/api/conversations/${selectedConv.id}/assign`, { agent_id: selectedAgentId });
      setShowAssignModal(false);
      setSelectedConv(prev => ({ ...prev, assigned_agent_id: selectedAgentId, assigned_agent_name: agents.find(a => a.id === selectedAgentId)?.full_name }));
      await fetchConversations();
    } catch (err) {
      alert('Failed to assign agent');
    }
  };

  const unassignAgent = async () => {
    console.log('Unassign clicked for conversation', selectedConv?.id);
    if (!selectedConv) {
      console.warn('No conversation selected');
      return;
    }
    if (window.confirm('Unassign this conversation?')) {
      try {
        await api.post(`/api/conversations/${selectedConv.id}/unassign`);
        setSelectedConv(prev => ({ ...prev, assigned_agent_id: null, assigned_agent_name: 'Unassigned' }));
        await fetchConversations();
      } catch (err) {
        console.error('Unassign error:', err);
        alert('Failed to unassign');
      }
    }
  };

  const filteredConversations = conversations.filter(c =>
    getCustomerDisplay(c).toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (newTagName.length > 0) {
      const filtered = globalTags.filter(tag => tag.name.toLowerCase().includes(newTagName.toLowerCase()) && !tags.some(t => t.id === tag.id));
      setTagSuggestions(filtered);
    } else setTagSuggestions([]);
  }, [newTagName, globalTags, tags]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* LEFT: Conversation List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-md z-10">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Conversations</h2>
          <div className="relative mt-2">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
            <input type="text" placeholder="Search by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <div key={conv.id} onClick={() => selectConversation(conv)} className={`p-3 border-b border-gray-100 cursor-pointer transition ${selectedConv?.id === conv.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-gray-50'}`}>
              <div className="flex justify-between items-start">
                <div className="font-medium text-gray-800 truncate">{getCustomerDisplay(conv)}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full ${
                  conv.reply_mode === 'ai' ? 'bg-amber-100 text-amber-700' :
                  conv.reply_mode === 'human' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {conv.reply_mode === 'ai' ? '🤖 AI' : conv.reply_mode === 'human' ? '👤 Human' : '⚙️ Rule'}
                </div>
              </div>
              <div className="text-sm text-gray-500 truncate mt-1">{conv.last_message || 'No messages'}</div>
              {conv.assigned_agent_name && conv.assigned_agent_name !== 'Unassigned' && (
                <div className="text-xs text-gray-400 mt-1">👤 Assigned to: {conv.assigned_agent_name}</div>
              )}
            </div>
          ))}
          {filteredConversations.length === 0 && <div className="text-center text-gray-400 p-4">No conversations found</div>}
        </div>
      </div>

      {/* CENTER: Chat Window */}
      <div className="flex-1 flex flex-col bg-cover bg-center" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}>
        {selectedConv ? (
          <>
            <div className="bg-white bg-opacity-95 backdrop-blur-sm border-b px-6 py-3 flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{getCustomerDisplay(selectedConv)}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map((tag) => (<span key={tag.id} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">{tag.name}</span>))}
                </div>
                {selectedConv.assigned_agent_name && selectedConv.assigned_agent_name !== 'Unassigned' && (
                  <div className="text-xs text-gray-500 mt-1">👤 Assigned to: {selectedConv.assigned_agent_name}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {userRole === 'org_admin' && (
                  <div className="flex gap-1 bg-gray-100 p-0.5 rounded-full">
                    {['ai', 'human', 'rule'].map((mode) => (
                      <button
                        key={mode}
                        onClick={async () => {
                          if (!selectedConv) return;
                          await api.patch(`/api/conversations/${selectedConv.id}/mode?mode=${mode}`);
                          setReplyMode(mode);
                          await fetchConversations();
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          replyMode === mode
                            ? mode === 'ai' ? 'bg-amber-500 text-white' : mode === 'human' ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {mode === 'ai' && '🤖 AI'}
                        {mode === 'human' && '👤 Human'}
                        {mode === 'rule' && '⚙️ Rule'}
                      </button>
                    ))}
                  </div>
                )}
                {userRole === 'org_admin' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { fetchAgents(); setShowAssignModal(true); }}
                      className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full hover:bg-indigo-200"
                    >
                      Transfer
                    </button>
                    {selectedConv.assigned_agent_id && (
                      <button onClick={unassignAgent} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full hover:bg-red-200">
                        Unassign
                      </button>
                    )}
                  </div>
                )}
                <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-full hover:bg-gray-100 transition"><i className="fas fa-ellipsis-v text-gray-500"></i></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isOutbound = msg.direction === 'outbound';
                let senderLabel = '';
                if (!isOutbound) {
                  senderLabel = getCustomerDisplay(selectedConv);
                } else {
                  senderLabel = msg.sender_type === 'agent' ? 'Agent' : 'AI';
                }
                const bubbleClass = isOutbound ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200';
                const alignClass = isOutbound ? 'justify-end' : 'justify-start';
                return (
                  <div key={msg.id} className={`flex ${alignClass}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${bubbleClass}`}>
                      <div className="text-xs opacity-70 mb-1 flex justify-between items-center">
                        <span>{senderLabel}</span>
                        {isOutbound && getStatusIcon(msg.status)}
                      </div>
                      <div className="break-words">{msg.content}</div>
                      <div className={`text-xs mt-1 ${isOutbound ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  disabled={userRole === 'viewer'}
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim() || userRole === 'viewer'}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <i className="fas fa-paper-plane"></i> Send
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {replyMode === 'ai' && '🤖 AI mode – customer will receive automated replies'}
                {replyMode === 'human' && '👤 Human mode – you are directly talking to the customer'}
                {replyMode === 'rule' && '⚙️ Rule mode – predefined rules will reply (no AI cost)'}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-white bg-opacity-80">
            <div className="text-center text-gray-400">
              <i className="fas fa-comments text-6xl mb-3 opacity-30"></i>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT DRAWER - Notes & Tags */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setDrawerOpen(false)}></div>
          <div className="relative w-80 bg-white h-full shadow-xl flex flex-col animate-slide-in">
            <div className="flex border-b">
              <button onClick={() => setActiveTab('notes')} className={`flex-1 py-3 text-center font-medium ${activeTab === 'notes' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}><i className="fas fa-sticky-note mr-1"></i> Notes</button>
              <button onClick={() => setActiveTab('tags')} className={`flex-1 py-3 text-center font-medium ${activeTab === 'tags' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}><i className="fas fa-tags mr-1"></i> Tags</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'notes' ? (
                <div>
                  {notes.length === 0 && <p className="text-gray-400 text-center text-sm">No notes yet</p>}
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 p-3 rounded-lg mb-3 relative border border-gray-100">
                      <p className="text-sm text-gray-700">{note.note}</p>
                      <div className="text-xs text-gray-400 mt-1">{new Date(note.created_at).toLocaleString()}</div>
                      <button onClick={() => deleteNote(note.id)} className="absolute top-2 right-2 text-red-400 text-xs hover:text-red-600">✕</button>
                    </div>
                  ))}
                  <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows="3" className="w-full border border-gray-200 rounded-lg p-2 mt-2 focus:outline-none focus:ring-1 focus:ring-indigo-300" placeholder="Add a private note (customer cannot see this)..." />
                  <button onClick={addNote} className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">Add Note</button>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                      <div key={tag.id} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full flex items-center gap-1 text-sm">
                        {tag.name}
                        <button onClick={() => detachTag(tag.id)} className="text-red-500 text-xs hover:text-red-700">✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="relative">
                    <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Add tag (e.g., #urgent)" className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                    {tagSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-32 overflow-y-auto shadow-lg">
                        {tagSuggestions.map((tag) => (
                          <div key={tag.id} onClick={() => { attachTag(tag.id); setNewTagName(''); setTagSuggestions([]); }} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{tag.name}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={async () => {
                    if (!newTagName.trim()) return;
                    const existing = globalTags.find(t => t.name.toLowerCase() === newTagName.trim().toLowerCase());
                    if (existing) await attachTag(existing.id);
                    else { const newTag = await createTag(newTagName.trim()); await attachTag(newTag.id); }
                    setNewTagName('');
                  }} className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">Add Tag</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Transfer to Agent</h3>
            <select
              className="w-full border rounded p-2 mb-4"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              <option value="">Select an agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.full_name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={assignAgent} className="px-4 py-2 bg-indigo-600 text-white rounded">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}