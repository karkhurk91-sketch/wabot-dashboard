// src/pages/Conversations.jsx
import React, { useState, useEffect } from 'react';
import { ChatProvider, useChat } from '../context/ChatContext';
import { useChatData } from '../hooks/useChatData';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import ConversationSidebar from '../components/chat/ConversationSidebar';
import StatisticsBar from '../components/chat/StatisticsBar';
import { getConversationCounts, markConversationAsRead, sendLocation } from '../services/chatApi';
import { getLeadByConversation } from '../services/leadService';
import AISummaryPanel from '../components/chat/AISummaryPanel';
import { useAuth } from '../context/AuthContext';

// Inner component that uses the context
const ConversationsContent = () => {
  const { state, dispatch } = useChat();
  const { conversations, selectedConversation, messages, loading, notes, tags } = state;
  const { user } = useAuth(); // for org_id and token
  const {
    loadConversations,
    searchConversations,
    selectConversation,
    loadMessages,
    sendText,
    sendMedia,
    addNote,
    attachTag,
    detachTag,
    createOrgTag,
    assignAgent,
    unassignAgent,
    toggleMode,
  } = useChatData();

  const [filter, setFilter] = useState('all');
  const [searchType, setSearchType] = useState('name_phone');
  const [counts, setCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  // ✅ GOOD
  const [filteredConversations, setFilteredConversations] = useState([]);  const [leadData, setLeadData] = useState(null);

  // Disable scrolling on main element
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.classList.add('overflow-hidden');
    }
    return () => {
      if (mainElement) {
        mainElement.classList.remove('overflow-hidden');
      }
    };
  }, []);

  // ✅ GOOD
  useEffect(() => {
    const fetchList = async () => {
      const list = await loadConversations(filter);
      if (!searchTerm.trim()) {
        setFilteredConversations(list || []);
      }
    };
    fetchList();
    fetchCounts();
  }, [filter, searchTerm]);  // ← added searchTerm

  useEffect(() => {
    const runSearch = async () => {
      if (!searchTerm.trim()) {
        setFilteredConversations(conversations);
        return;
      }
      try {
        const results = await searchConversations(searchTerm.trim(), searchType);
        setFilteredConversations(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error('Search failed', error);
        setFilteredConversations([]);
      }
    };
    runSearch();
  }, [searchTerm, searchType, conversations, searchConversations]);

  useEffect(() => {
    const fetchLead = async () => {
      if (!selectedConversation?.id) {
        setLeadData(null);
        return;
      }
      try {
        const res = await getLeadByConversation(selectedConversation.id);
        setLeadData(res.data);
      } catch (err) {
        console.error('Failed to fetch lead for conversation', err);
        setLeadData(null);
      }
    };
    fetchLead();
  }, [selectedConversation]);

  const fetchCounts = async () => {
    try {
      const res = await getConversationCounts();
      setCounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectConversation = async (conv) => {
    await selectConversation(conv);
    try {
      await markConversationAsRead(conv.id);
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleSend = async (text, formData, onUploadProgress, replyToId = null) => {
    if (!selectedConversation) return null;
    if (formData) {
      return sendMedia(selectedConversation.id, formData, onUploadProgress, replyToId);
    }
    return sendText(selectedConversation.id, text, 'agent', replyToId);
  };

  const handleLoadOlder = async () => {
    if (!selectedConversation) return;
    await loadMessages(selectedConversation.id);
  };

  const handleSendLocation = async (latitude, longitude, name, address) => {
    if (!selectedConversation) return null;
    try {
      const response = await sendLocation(selectedConversation.id, latitude, longitude, name, address);
      return response;
    } catch (error) {
      console.error('Failed to send location', error);
    }
  };

  // ----- WEBSOCKET FOR REAL‑TIME UPDATES (typing indicator, new messages) -----
  useEffect(() => {
    if (!selectedConversation?.id) return;

    const token = localStorage.getItem('access_token');
    const orgId = user?.org_id;
    if (!token || !orgId) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `ws://localhost:8000/ws/alerts?org_id=${orgId}&token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      // Optionally subscribe to the current conversation
      ws.send(JSON.stringify({ type: 'subscribe', conversation_id: selectedConversation.id }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Typing indicator events
        if (data.type === 'typing_start' && data.entity_id === selectedConversation.id) {
          dispatch({ type: 'SET_TYPING', payload: true });
        } else if (data.type === 'typing_stop' && data.entity_id === selectedConversation.id) {
          dispatch({ type: 'SET_TYPING', payload: false });
        }
        // New message events (already handled by NEW_MESSAGE from HTTP polling, but for completeness)
        else if (data.type === 'new_message' && data.entity_id === selectedConversation.id) {
          dispatch({ type: 'NEW_MESSAGE', payload: data.data });
        }
      } catch (err) {
        console.error('WebSocket message error', err);
      }
    };

    ws.onerror = (err) => console.error('WebSocket error', err);
    ws.onclose = () => console.log('WebSocket closed');

    return () => ws.close();
  }, [selectedConversation?.id, dispatch, user]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <StatisticsBar counts={counts} activeFilter={filter} onFilterChange={setFilter} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ConversationList
          conversations={filteredConversations || []}
          activeId={selectedConversation?.id}
          onSelect={handleSelectConversation}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          searchType={searchType}
          onSearchTypeChange={setSearchType}
          loading={loading}
          error={state.error}
        />
        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          loading={loading}
          typing={state.typing}
          onSend={handleSend}
          onSendLocation={handleSendLocation}
          onLoadOlder={handleLoadOlder}
        />
        <ConversationSidebar
          conversation={selectedConversation}
          notes={notes}
          tags={tags}
          readOnly={false}
          onAddNote={addNote}
          onAttachTag={attachTag}
          onDetachTag={detachTag}
          onCreateOrgTag={createOrgTag}
          onAssignAgent={assignAgent}
          onUnassignAgent={unassignAgent}
          onToggleMode={toggleMode}
          onRefresh={() => {
            loadConversations();
          }}
          leadData={leadData}
        />
      </div>

    </div>
  );
};

// Main component that provides the ChatProvider
const Conversations = () => {
  return (
    <ChatProvider>
      <ConversationsContent />
    </ChatProvider>
  );
};

export default Conversations;