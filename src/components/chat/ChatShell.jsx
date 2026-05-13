import React, { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useChatData } from '../../hooks/useChatData';
import useMediaUpload from '../../hooks/useMediaUpload';
import useEmojiPicker from '../../hooks/useEmojiPicker';
import MediaUploader from './MediaUploader';
import MessageInput from './MessageInput';
import ChatSkeleton from './ChatSkeleton';

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
  } = useChatData();

  const mediaUpload = useMediaUpload();
  const emojiPicker = useEmojiPicker();
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleSelectConversation = useCallback(async (conversation) => {
    setHasMoreMessages(true);
    await selectConversation(conversation);
  }, [selectConversation]);

  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      handleSelectConversation(conversations[0]);
    }
  }, [conversations, selectedConversation, handleSelectConversation]);

  useEffect(() => {
    if (!selectedConversation) return;
    (async () => {
      const count = await loadMessages(selectedConversation.id, true);
      setHasMoreMessages(count === 50);
    })();
  }, [selectedConversation, loadMessages]);

  const handleScroll = useCallback(async (event) => {
    if (event.target.scrollTop > 120 || !selectedConversation || messagesLoading || !hasMoreMessages) return;
    const count = await loadMessages(selectedConversation.id, false);
    setHasMoreMessages(count === 50);
  }, [hasMoreMessages, loadMessages, messagesLoading, selectedConversation]);

  const handleEmojiSelect = useCallback((event, emojiObject) => {
    const { selectionStart = 0, selectionEnd = 0 } = inputRef.current || {};
    const next = emojiPicker.insertEmoji(emojiObject.emoji, messageText, selectionStart, selectionEnd);
    setMessageText(next);
    emojiPicker.closeEmojiPicker();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      const nextPos = selectionStart + emojiObject.emoji.length;
      inputRef.current?.setSelectionRange(nextPos, nextPos);
    });
  }, [emojiPicker, messageText]);

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

  const attachmentProps = useMemo(
    () => ({
      ...mediaUpload,
      onClear: mediaUpload.clearAttachment,
    }),
    [mediaUpload]
  );

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

  return (
    <div className={`min-h-screen ${darkMode.darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col lg:flex-row">
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading conversations…</div>}>
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelect={handleSelectConversation}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
          />
        </Suspense>

        <div className="flex-1 flex flex-col">
          <Suspense fallback={<ChatSkeleton />}>
            <ChatHeader
              selectedConversation={selectedConversation}
              tags={tags}
              userRole={userRole}
              onModeChange={() => {} }
              onTransfer={() => {} }
              onOpenDrawer={() => {} }
              onToggleDarkMode={darkMode.toggleDarkMode}
              darkMode={darkMode.darkMode}
            />
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              loading={loading}
              messagesLoading={messagesLoading}
              typing={typing}
              onScroll={handleScroll}
              hasMore={hasMoreMessages}
            />
          </Suspense>

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
      {error && <div className="fixed bottom-4 right-4 rounded-3xl bg-red-600 px-4 py-3 text-sm text-white shadow-lg">{error}</div>}
    </div>
  );
};

export default ChatShell;
