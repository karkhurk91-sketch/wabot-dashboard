import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useChatData } from '../../hooks/useChatData';
import ConversationList from './ConversationList';
import ChatHeader from './ChatHeader';
import ChatWindow from './ChatWindow';
import ConversationDetailsDrawer from './ConversationDetailsDrawer';
import ChatSkeleton from './ChatSkeleton';

const ChatShell = () => {
  const { state, darkMode, dispatch } = useChat();
  const {
    conversations,
    selectedConversation,
    messages,
    notes,
    tags,
    loading,
    messagesLoading,
    error,
    typing,
  } = state;

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
    createConversation,
    searchConversations,
  } = useChatData();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchedConversations, setSearchedConversations] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const conversationsToShow = useMemo(
    () => (searchedConversations !== null ? searchedConversations : conversations),
    [conversations, searchedConversations]
  );

  const handleSearch = useCallback(
    async (term) => {
      setSearchTerm(term);
      if (!term.trim()) {
        setSearchedConversations(null);
        return;
      }
      const results = await searchConversations(term);
      setSearchedConversations(results);
    },
    [searchConversations]
  );

  const handleSelectConversation = useCallback(
    async (conversation) => {
      setHasMoreMessages(true);
      const count = await selectConversation(conversation);
      setHasMoreMessages(count === 50);
    },
    [selectConversation]
  );

  const handleCreateConversation = useCallback(
    async (phoneNumber) => {
      const newConv = await createConversation(phoneNumber);
      if (!newConv) return;
      await loadConversations();
      await handleSelectConversation(newConv);
      setSearchTerm('');
      setSearchedConversations(null);
    },
    [createConversation, handleSelectConversation, loadConversations]
  );

  const handleLoadOlder = useCallback(
    async (event) => {
      if (!selectedConversation || messagesLoading || !hasMoreMessages) return;
      const target = event.target;
      if (target.scrollTop > 120) return;
      const count = await loadMessages(selectedConversation.id, false);
      setHasMoreMessages(count === 50);
    },
    [hasMoreMessages, loadMessages, messagesLoading, selectedConversation]
  );

  const handleSend = useCallback(
    async (text, formData, onUploadProgress) => {
      if (!selectedConversation) return null;
      if (formData) {
        return sendMedia(selectedConversation.id, formData, onUploadProgress);
      }
      return sendText(selectedConversation.id, text, 'agent');
    },
    [selectedConversation, sendMedia, sendText]
  );

  const handleMessageSent = (response) => {
    console.log('📨 handleMessageSent called with response:', response);
    
    if (!response.media_url) {
      console.warn('No media_url in response, skipping optimistic update');
      return;
    }

    const newMessage = {
      id: response.message_id,
      media_url: response.media_url,
      message_type: response.message_type || 'image',
      content: response.caption || '',
      direction: 'outbound',
      status: 'sent',
      created_at: new Date().toISOString(),
      media_file_name: response.media_file_name || '',
    };

    // Check if message already exists in state
    const exists = state.messages.some(msg => msg.id === newMessage.id);
    if (!exists) {
      console.log('✅ Dispatching APPEND_MESSAGES with:', newMessage);
      dispatch({ type: 'APPEND_MESSAGES', payload: [newMessage] });
    } else {
      console.log('⚠️ Message already exists, skipping duplicate');
    }
  };

  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      handleSelectConversation(conversations[0]);
    }
  }, [conversations, selectedConversation, handleSelectConversation]);

  if (loading && conversations.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-500">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen flex-col overflow-hidden ${darkMode.darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95 lg:px-6">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Conversations</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Messaging center</h1>
          </div>
          <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
            {conversations.length} active threads
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-[1800px] flex-1 flex-col lg:flex-row">
        <div className="flex h-full min-h-0 w-full flex-col border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950 lg:h-full lg:border-b-0 lg:border-r lg:w-[28rem] xl:w-[32rem]">
          <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading conversations…</div>}>
            <ConversationList
              conversations={conversationsToShow}
              activeId={selectedConversation?.id}
              onSelect={handleSelectConversation}
              searchTerm={searchTerm}
              onSearch={handleSearch}
              onCreateConversation={handleCreateConversation}
            />
          </Suspense>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <Suspense fallback={<ChatSkeleton />}>
            <ChatHeader
              selectedConversation={selectedConversation}
              tags={tags}
              userRole="org_admin"
              onModeChange={async (mode) => {
                if (!selectedConversation) return;
                await toggleMode(selectedConversation.id, mode);
              }}
              onTransfer={() => setDrawerOpen(true)}
              onOpenDrawer={() => setDrawerOpen(true)}
              onToggleDarkMode={darkMode.toggleDarkMode}
              darkMode={darkMode.darkMode}
            />
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              messagesLoading={messagesLoading}
              typing={typing}
              onScroll={handleLoadOlder}
              onSend={handleSend}
              onOpenDetails={() => setDrawerOpen(true)}
              onMessageSent={handleMessageSent}
            />
          </Suspense>
        </div>
      </div>

      <ConversationDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
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
        onRefreshConversation={loadConversations} 
      />

      {error && (
        <div className="fixed bottom-4 right-4 z-30 max-w-sm rounded-3xl bg-red-600 px-4 py-3 text-sm text-white shadow-lg">
          {typeof error === 'string' ? error : 'Something went wrong'}
        </div>
      )}
    </div>
  );
};

export default ChatShell;
