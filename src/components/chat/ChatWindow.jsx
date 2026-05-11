/**
 * Enhanced Chat Window Component
 * Modern WhatsApp-style messaging interface
 */

import React, { useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { useChat } from '../../hooks/useChat';
import { useWebSocket } from '../../hooks/useWebSocket';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import ChatSkeleton from './ChatSkeleton';

const ChatWindow = memo(({ conversationId, organizationId, conversation, currentUser }) => {
  const {
    messages,
    loading,
    error,
    sendMessage,
    updateMessage,
    setMessages,
    setError
  } = useChat(conversationId, organizationId);

  const {
    isTyping,
    onlineStatus,
    connectionStatus,
    sendMessage: sendWSMessage,
    sendTypingIndicator
  } = useWebSocket(conversationId, localStorage.getItem('token'));

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for WebSocket messages
  useEffect(() => {
    const handleWSMessage = (event) => {
      const { type, data } = event.detail;

      if (type === 'message') {
        // Add received message
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.whatsapp_message_id === data.whatsapp_message_id)) {
            return prev;
          }
          return [...prev, data];
        });
      } else if (type === 'status') {
        // Update message delivery status
        setMessages(prev =>
          prev.map(m =>
            m.id === data.message_id
              ? { ...m, status: data.status, delivery_timestamp: data.delivered_at }
              : m
          )
        );
      }
    };

    window.addEventListener('ws:message', handleWSMessage);
    return () => window.removeEventListener('ws:message', handleWSMessage);
  }, [setMessages]);

  const handleSendMessage = useCallback(
    async (content, media = null) => {
      try {
        const messageType = media ? media.type : 'text';
        const result = await sendMessage(content, messageType, media);

        // Send via WebSocket for real-time
        sendWSMessage({
          conversation_id: conversationId,
          content,
          message_type: messageType,
          media_id: media?.id
        });
      } catch (err) {
        setError(err.message);
      }
    },
    [conversationId, sendMessage, sendWSMessage, setError]
  );

  const handleTyping = useCallback(() => {
    sendTypingIndicator();
  }, [sendTypingIndicator]);

  const renderedMessages = useMemo(() => {
    return messages.map((msg, index) => (
      <MessageBubble
        key={msg.id}
        msg={msg}
        isOutbound={msg.direction === 'outgoing'}
        showAvatar={index === 0 || messages[index - 1].direction !== msg.direction}
      />
    ));
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="max-w-lg text-center text-slate-500 dark:text-slate-400">
          <p className="text-lg font-semibold">Choose a conversation to continue.</p>
          <p className="mt-2 text-sm">Your WhatsApp chat history will appear here with media preview and delivery context.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {conversation?.customer_name || 'Conversation'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {conversation?.customer_phone_number}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                onlineStatus === 'online' ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <span className="text-xs font-medium text-gray-600 dark:text-slate-400 capitalize">
              {onlineStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
      >
        {loading ? (
          <ChatSkeleton />
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-slate-400">
            <div className="text-5xl mb-4">💬</div>
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation</p>
          </div>
        ) : (
          renderedMessages
        )}

        {isTyping && (
          <div className="flex items-end gap-2">
            <TypingIndicator active={true} />
            <span className="text-xs text-gray-500 dark:text-slate-400 ml-2">typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Input */}
      <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-4">
        <MessageInput
          onSend={handleSendMessage}
          onTyping={handleTyping}
          disabled={connectionStatus !== 'connected'}
          organizationId={organizationId}
        />
      </div>
    </div>
  );
};

export default memo(ChatWindow);
