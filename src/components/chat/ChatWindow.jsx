import React, { memo } from 'react';
import MessageBubble from './MessageBubble';
import ChatSkeleton from './ChatSkeleton';
import TypingIndicator from './TypingIndicator';

const ChatWindow = ({ messages, selectedConversation, loading, messagesLoading, typing, onScroll, hasMore }) => {
  if (!selectedConversation) {
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
    <div className="flex h-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {loading ? (
        <ChatSkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-5" onScroll={onScroll}>
          {messagesLoading && hasMore && <div className="text-center text-xs text-slate-500 dark:text-slate-400 mb-3">Loading earlier messages…</div>}
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} isOutbound={msg.direction === 'outbound'} />
            ))}
          </div>
          <TypingIndicator active={typing} />
        </div>
      )}
    </div>
  );
};

export default memo(ChatWindow);
