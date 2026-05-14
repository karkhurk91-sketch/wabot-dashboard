/**
 * Enhanced Chat Window Component
 * Modern messaging interface with proper scroll behavior
 */

import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatSkeleton from './ChatSkeleton';

const ChatWindow = ({ conversation, messages, loading, messagesLoading, typing, onScroll, hasMore }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!messagesLoading && isAtBottom) {
      scrollToBottom();
    }
  }, [messages, messagesLoading, isAtBottom]);

  const handleScroll = (event) => {
    const target = event.target;
    const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    const atBottom = distanceFromBottom < 24;
    setIsAtBottom(atBottom);

    if (typeof onScroll === 'function') {
      onScroll(event);
    }
  };

  const renderedMessages = useMemo(
    () =>
      messages.map((msg, index) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          isOutbound={
            msg.sender_type === 'outbound' || msg.sender_type === 'agent' || msg.sender_type === 'outgoing'
          }
          showAvatar={index === 0 || messages[index - 1]?.sender_type !== msg.sender_type}
        />
      )),
    [messages]
  );

  if (!conversation) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center bg-slate-50 p-6 dark:bg-slate-950 lg:min-h-0">
        <div className="max-w-lg text-center text-slate-500 dark:text-slate-400">
          <p className="text-lg font-semibold">Choose a conversation to continue.</p>
          <p className="mt-2 text-sm">Your chat history will appear here once a conversation is selected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900">
      {conversation && (
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/95 lg:hidden">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
              {conversation.customer_name || 'Conversation'}
            </h2>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {conversation.customer_phone_number || ''}
            </p>
          </div>
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" title="Active thread" />
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
        >
          {loading || messagesLoading ? (
            <ChatSkeleton />
          ) : messages.length === 0 ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-lg font-semibold">No messages yet</p>
              <p className="mt-2 text-sm">Send the first message to start this conversation.</p>
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
            <div className="sticky top-0 z-10 rounded-full bg-slate-50/90 px-3 py-2 text-center text-xs text-slate-500 backdrop-blur-sm dark:bg-slate-950/90 dark:text-slate-400">
              Scroll up to load older messages
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {!isAtBottom && !messagesLoading && messages.length > 0 && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-6 right-6 z-10 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Latest chat
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(ChatWindow);
