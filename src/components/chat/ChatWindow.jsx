/**
 * Enhanced Chat Window Component
 * Modern WhatsApp-style messaging interface
 */

import React, { useEffect, useMemo, useRef, memo } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatSkeleton from './ChatSkeleton';

const ChatWindow = ({ conversation, messages, loading, messagesLoading, typing, onScroll, hasMore }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!messagesLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messagesLoading]);

  const renderedMessages = useMemo(() => {
    return messages.map((msg, index) => (
      <MessageBubble
        key={msg.id}
        msg={msg}
        isOutbound={msg.sender_type === 'agent' || msg.sender_type === 'outgoing'}
        showAvatar={index === 0 || messages[index - 1]?.sender_type !== msg.sender_type}
      />
    ));
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="max-w-lg text-center text-slate-500 dark:text-slate-400">
          <p className="text-lg font-semibold">Choose a conversation to continue.</p>
          <p className="mt-2 text-sm">Your chat history will appear here once you select a conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {conversation.customer_name || 'Conversation'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {conversation.customer_phone_number || 'No phone available'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Online</span>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
      >
        {loading || messagesLoading ? (
          <ChatSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <div className="text-5xl mb-4">💬</div>
            <p>No messages yet</p>
            <p className="text-sm">Send the first message to start the conversation.</p>
          </div>
        ) : (
          renderedMessages
        )}

        {typing && (
          <div className="flex items-end gap-2">
            <TypingIndicator active />
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">typing...</span>
          </div>
        )}

        {hasMore && (
          <div className="text-center text-xs text-slate-400">Scroll up to load older messages</div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default memo(ChatWindow);
