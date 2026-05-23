import React, { useState, useEffect } from 'react';
import { ChatProvider, useChat } from '../context/ChatContext';
import { useChatData } from '../hooks/useChatData';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import ConversationSidebar from '../components/chat/ConversationSidebar';
import StatisticsBar from '../components/chat/StatisticsBar';
import { getConversationCounts, markConversationAsRead } from '../services/chatApi';
import { getLeadByConversation } from '../services/leadService'; // new API call
import AISummaryPanel from '../components/chat/AISummaryPanel';

 // import your component

// Inner component that uses the context
const ConversationsContent = () => {
  const { state, dispatch } = useChat();
  const { conversations, selectedConversation, messages, loading, notes, tags } = state;
  const {
    loadConversations,
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
  const [counts, setCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [leadData, setLeadData] = useState(null); // state for AI insights

  // Disable scrolling on the main element for this page only
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

  useEffect(() => {
    loadConversations(filter);
    fetchCounts();
  }, [filter]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredConversations(
        conversations.filter(c =>
          c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.customer_phone_number?.includes(searchTerm)
        )
      );
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchTerm, conversations]);

  // Fetch lead data when selected conversation changes
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

  const handleSend = async (text, formData, onUploadProgress) => {
    if (!selectedConversation) return null;
    if (formData) {
      return sendMedia(selectedConversation.id, formData, onUploadProgress);
    }
    return sendText(selectedConversation.id, text, 'agent');
  };

  const handleLoadOlder = async () => {
    if (!selectedConversation) return;
    await loadMessages(selectedConversation.id);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <StatisticsBar counts={counts} activeFilter={filter} onFilterChange={setFilter} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ConversationList
          conversations={filteredConversations}
          activeId={selectedConversation?.id}
          onSelect={handleSelectConversation}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onCreateConversation={() => {}}
        />
        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          loading={loading}
          onSend={handleSend}
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
          // Pass leadData to sidebar – you must modify ConversationSidebar to accept and display it
          leadData={leadData}
        />
      </div>
      {/* Optional: if you don’t want to modify ConversationSidebar, you can render the panel here */}
      {leadData && (
        <div className="absolute bottom-4 right-4 w-80 z-10 shadow-lg">
          <AISummaryPanel lead={leadData} />
        </div>
      )}
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