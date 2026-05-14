import React, { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useChatData } from '../../hooks/useChatData';
import * as chatApi from '../../services/chatApi';
import useMediaUpload from '../../hooks/useMediaUpload';
import useEmojiPicker from '../../hooks/useEmojiPicker';
import MessageInput from './MessageInput';
import ChatSkeleton from './ChatSkeleton';
import ConversationDetailsDrawer from './ConversationDetailsDrawer';

const ConversationList = React.lazy(() => import('./ConversationList'));
const ChatHeader = React.lazy(() => import('./ChatHeader'));
const ChatWindow = React.lazy(() => import('./ChatWindow'));

const ChatShell = () => {
  const { user, userRole } = useAuth();
  const { state, dispatch, darkMode } = useChat();
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
    createConversation,
    searchConversations,
  } = useChatData();

  const mediaUpload = useMediaUpload();
  const emojiPicker = useEmojiPicker();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedConversations, setSearchedConversations] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const inputRef = useRef(null);

  const readOnly = userRole === 'viewer';

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleModeChange = useCallback(
    async (mode) => {
      if (!selectedConversation?.id) return;
      try {
        await chatApi.toggleConversationMode(selectedConversation.id, mode);
        dispatch({
          type: 'SET_SELECTED_CONVERSATION',
          payload: { ...selectedConversation, reply_mode: mode },
        });
        const list = await loadConversations();
        const updated = list.find((c) => c.id === selectedConversation.id);
        if (updated) dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: updated });
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          payload: err?.response?.data?.detail || 'Unable to update reply mode',
        });
      }
    },
    [selectedConversation, dispatch, loadConversations]
  );

  const handleSelectConversation = useCallback(
    async (conversation) => {
      setHasMoreMessages(true);
      const count = await selectConversation(conversation);
      setHasMoreMessages(count === 50);
    },
    [selectConversation]
  );

  const handleSearch = useCallback(
    async (term) => {
      setSearchTerm(term);
      if (term.trim()) {
        const results = await searchConversations(term);
        setSearchedConversations(results);
      } else {
        setSearchedConversations(null);
      }
    },
    [searchConversations]
  );

  const handleCreateConversation = useCallback(
    async (phoneNumber) => {
      const newConv = await createConversation(phoneNumber);
      if (newConv) {
        await loadConversations(); // Reload to include new one
        handleSelectConversation(newConv);
        setSearchTerm(''); // Clear search
        setSearchedConversations(null);
      }
    },
    [createConversation, loadConversations, handleSelectConversation]
  );

  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      handleSelectConversation(conversations[0]);
    }
  }, [conversations, selectedConversation, handleSelectConversation]);

  const handleScroll = useCallback(
    async (event) => {
      if (event.target.scrollTop > 120 || !selectedConversation || messagesLoading || !hasMoreMessages) return;
      const count = await loadMessages(selectedConversation.id, false);
      setHasMoreMessages(count === 50);
    },
    [hasMoreMessages, loadMessages, messagesLoading, selectedConversation]
  );

  const handleEmojiSelect = useCallback(
    (event, emojiObject) => {
      const { selectionStart = 0, selectionEnd = 0 } = inputRef.current || {};
      const next = emojiPicker.insertEmoji(emojiObject.emoji, messageText, selectionStart, selectionEnd);
      setMessageText(next);
      emojiPicker.closeEmojiPicker();
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        const nextPos = selectionStart + emojiObject.emoji.length;
        inputRef.current?.setSelectionRange(nextPos, nextPos);
      });
    },
    [emojiPicker, messageText]
  );

  const handleSend = useCallback(async () => {
    if (!selectedConversation) return;
    setSending(true);

    if (mediaUpload.hasAttachment) {
      mediaUpload.setUploading(true);
      const formData = mediaUpload.buildFormData(messageText);
      const result = await sendMedia(selectedConversation.id, formData, (event) => {
        const progress = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
        mediaUpload.updateProgress(progress);
      });
      mediaUpload.setUploading(false);
      if (result) {
        setMessageText('');
        mediaUpload.clearAttachment();
      }
      setSending(false);
      return;
    }

    if (!messageText.trim()) {
      setSending(false);
      return;
    }

    const result = await sendText(selectedConversation.id, messageText, userRole === 'org_admin' ? 'agent' : 'agent');
    if (result) setMessageText('');
    setSending(false);
  }, [messageText, mediaUpload, sendMedia, sendText, selectedConversation, userRole]);

  const attachmentInputProps = useMemo(
    () => ({
      ...mediaUpload,
      hasAttachment: mediaUpload.hasAttachment,
      error: mediaUpload.error,
      getRootProps: mediaUpload.getRootProps,
      getInputProps: mediaUpload.getInputProps,
      isDragActive: mediaUpload.isDragActive,
      onClear: mediaUpload.clearAttachment,
    }),
    [mediaUpload]
  );

  const safeTags = Array.isArray(tags) ? tags : [];

  const drawerAddNote = useCallback(
    async (conversationId, text) => {
      return addNote(conversationId, text);
    },
    [addNote]
  );

  return (
    <div
      className={`flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden ${darkMode.darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
    >
      {/* Always show conversation list + chat (stacked on small screens, side‑by‑side on lg+) */}
      <div className="mx-auto flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row lg:max-w-[1800px]">
        <div className="flex min-h-[12rem] max-h-[40vh] w-full shrink-0 flex-col border-b border-slate-200 dark:border-slate-700 lg:h-full lg:max-h-none lg:min-h-0 lg:w-96 lg:shrink-0 lg:border-b-0 lg:border-r xl:w-[26rem]">
          <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading conversations…</div>}>
            <ConversationList
              conversations={searchedConversations || (Array.isArray(conversations) ? conversations : [])}
              selectedConversation={selectedConversation}
              onSelect={handleSelectConversation}
              searchTerm={searchTerm}
              onSearch={handleSearch}
              onCreateConversation={handleCreateConversation}
            />
          </Suspense>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Suspense fallback={<ChatSkeleton />}>
            <ChatHeader
              selectedConversation={selectedConversation}
              tags={safeTags}
              userRole={userRole}
              onModeChange={handleModeChange}
              onTransfer={() => setDrawerOpen(true)}
              onOpenDrawer={() => setDrawerOpen(true)}
              onToggleDarkMode={darkMode.toggleDarkMode}
              darkMode={darkMode.darkMode}
            />
            <ChatWindow
              conversation={selectedConversation}
              messages={Array.isArray(messages) ? messages : []}
              loading={loading}
              messagesLoading={messagesLoading}
              typing={typing}
              onScroll={handleScroll}
              hasMore={hasMoreMessages}
            />
          </Suspense>

          <div className="shrink-0 border-t border-slate-200 dark:border-slate-700">
            <MessageInput
              message={messageText}
              setMessage={setMessageText}
              onSend={handleSend}
              onToggleEmoji={emojiPicker.toggleEmojiPicker}
              emojiOpen={emojiPicker.open}
              onEmojiSelect={handleEmojiSelect}
              onAttachmentToggle={() => setShowAttachmentMenu((prev) => !prev)}
              showAttachmentMenu={showAttachmentMenu}
              attachmentProps={attachmentInputProps}
              inputRef={inputRef}
              sending={sending}
              uploading={mediaUpload.uploading}
              organizationId={user?.org_id}
              conversationId={selectedConversation?.id}
            />
          </div>
        </div>
      </div>

      <ConversationDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        conversation={selectedConversation}
        notes={Array.isArray(notes) ? notes : []}
        tags={safeTags}
        readOnly={readOnly}
        onAddNote={drawerAddNote}
        onAttachTag={attachTag}
        onDetachTag={detachTag}
        onCreateOrgTag={createOrgTag}
        onAssignAgent={assignAgent}
        onUnassignAgent={unassignAgent}
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
