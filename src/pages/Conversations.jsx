// src/pages/Conversations.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { ChatProvider, useChat } from '../context/ChatContext';
import { useChatData } from '../hooks/useChatData';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import ConversationSidebar from '../components/chat/ConversationSidebar';
import StatisticsBar from '../components/chat/StatisticsBar';
import { getConversationCounts, markConversationAsRead, sendLocation } from '../services/chatApi';
import { getLeadByConversation } from '../services/leadService';
import { useAuth } from '../context/AuthContext';

const ConversationsContent = () => {
  const { state, dispatch } = useChat();
  const { conversations, selectedConversation, messages, loading, notes, tags } = state;
  const { user } = useAuth();
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
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [leadData, setLeadData] = useState(null);
  // ✅ Pin refresh counter – increment when pin_updated event is received
  const [pinRefreshCounter, setPinRefreshCounter] = useState(0);

  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) mainElement.classList.add('overflow-hidden');
    return () => {
      if (mainElement) mainElement.classList.remove('overflow-hidden');
    };
  }, []);

  // Fetch conversations when filter or search changes
  useEffect(() => {
    const fetchList = async () => {
      const list = await loadConversations(filter);
      if (!searchTerm.trim()) {
        setFilteredConversations(list || []);
      }
    };
    fetchList();
    fetchCounts();
  }, [filter, searchTerm]);

  // Search
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
  }, [searchTerm, searchType, conversations]);

  // Derive displayed conversations from context state
  const displayConversations = useMemo(() => {
    if (searchTerm.trim()) {
      return filteredConversations;
    }
    return conversations;
  }, [conversations, filteredConversations, searchTerm]);

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
    const fullConv = conversations.find(c => c.id === conv.id) || conv;
    await selectConversation(fullConv);
    try {
      await markConversationAsRead(fullConv.id);
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
    const offset = messages.length;
    await loadMessages(selectedConversation.id, false, offset);
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

  // WebSocket
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const orgId = user?.org_id;
    if (!token || !orgId) return;

    const wsUrl = `ws://localhost:8000/ws/alerts?org_id=${orgId}&token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', conversation_id: 'all' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const convId = data.entity_id;

        if (data.type === 'typing_start' && convId === selectedConversation?.id) {
          dispatch({ type: 'SET_TYPING', payload: true });
        } else if (data.type === 'typing_stop' && convId === selectedConversation?.id) {
          dispatch({ type: 'SET_TYPING', payload: false });
        } else if (data.type === 'new_message' && convId) {
          const newMsg = data.data;
          dispatch({
            type: 'UPDATE_CONVERSATION_META',
            payload: {
              id: convId,
              updates: {
                last_message_at: newMsg.sort_timestamp || newMsg.created_at,
                last_message_preview: newMsg.text || newMsg.content || 'New message',
                last_message_sender: newMsg.sender_type || 'customer',
                unread_count: newMsg.unread_count || 0,
              },
            },
          });
          if (convId === selectedConversation?.id) {
            dispatch({ type: 'NEW_MESSAGE', payload: newMsg });
          }
        }
        // ✅ Handle pin_updated events
        else if (data.type === 'pin_updated' && data.conversation_id === selectedConversation?.id) {
          // Increment the refresh counter to trigger reload of pins in ChatWindow
          setPinRefreshCounter(prev => prev + 1);
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
          conversations={displayConversations || []}
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
          customer={leadData}
          pinRefreshTrigger={pinRefreshCounter} // ✅ Pass refresh trigger
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

const Conversations = () => {
  return (
    <ChatProvider>
      <ConversationsContent />
    </ChatProvider>
  );
};

export default Conversations;