import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import MessageInput from './MessageInput';

const ChatWindow = ({
  conversation,
  messages,
  messagesLoading,
  typing,
  onScroll,
  onSend,
  onOpenDetails,
}) => {
  const { user } = useAuth();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const phoneNumber = conversation?.customer_phone_number || conversation?.phone || '';

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  const handleScroll = (event) => {
    const target = event.target;
    const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    setIsAtBottom(distanceFromBottom < 80);
    if (typeof onScroll === 'function') {
      onScroll(event);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 font-semibold">
              {conversation?.customer_name?.charAt(0) || conversation?.name?.charAt(0) || '?'}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
                {conversation?.customer_name || conversation?.name || 'Conversation'}
              </h2>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                {phoneNumber || 'No phone number available'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={scrollToBottom}
              className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              Latest chat
            </button>
            <button
              type="button"
              onClick={onOpenDetails}
              className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              View details
            </button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 anil"
      >
        {messagesLoading ? (
          <div className="flex h-full min-h-[50vh] items-center justify-center text-slate-500 dark:text-slate-400">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-4 text-4xl">💬</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No messages yet</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Send the first message to start the conversation.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const userId = user?.user_id ?? user?.id; // support tokens with user_id or id
              const isOwn = Boolean(
                (msg.sender_id && userId && String(msg.sender_id) === String(userId)) ||
                msg.sender_type === 'outbound' ||
                msg.direction === 'outbound'
              );
              return <MessageBubble key={msg.id} message={msg} isOwn={isOwn} />;
            })}
          </div>
        )}

        {typing && (
          <div className="mt-4 flex items-center gap-2 rounded-3xl bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm dark:bg-slate-900/80 dark:text-slate-300">
            <TypingIndicator active />
            Typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
        <MessageInput onSend={onSend} />
      </div>

      {!isAtBottom && messages.length > 0 && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 z-20 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xl shadow-slate-900/30 transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
        >
          Latest chat
        </button>
      )}
    </div>
  );
};

export default ChatWindow;
