// src/components/chat/ChatWindow.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import MessageInput from './MessageInput';
import { getDateLabel } from '../../utils/timeFormatter';

const ChatWindow = ({
  conversation,
  messages,
  loading,
  typing,
  onSend,
  onSendLocation,
  onMessageSent,
  onLoadOlder,
  customer, // ✅ New prop: customer data from leadData
}) => {
  const { user, userRole } = useAuth();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [highlightedMessage, setHighlightedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const phoneNumber = conversation?.customer_phone_number || conversation?.phone || '';

  // ✅ Derive display name with priority: name > phone > email > fallback
  const displayName = 
    customer?.name || 
    conversation?.customer_name || 
    phoneNumber || 
    customer?.phone_number || 
    customer?.email || 
    'Unknown';

  const canSend = userRole === 'org_admin' || conversation?.assigned_agent_id === user?.id;

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  const handleScroll = (event) => {
    const target = event.target;
    const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    setIsAtBottom(distanceFromBottom < 80);
    if (onLoadOlder && target.scrollTop === 0) {
      onLoadOlder();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendWithReply = async (text, formData, onUploadProgress, replyToId = null) => {
    return onSend(text, formData, onUploadProgress, replyToId);
  };

  const handleReply = (message) => {
    setReplyTo(message);
  };

  useEffect(() => {
    setReplyTo(null);
    setHighlightedMessage(null);
  }, [conversation?.id]);

  const clearReply = () => {
    setReplyTo(null);
  };

  const handleQuoteClick = useCallback((messageId) => {
    const target = containerRef.current?.querySelector(`[data-message-id="${messageId}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessage(messageId);
      window.setTimeout(() => setHighlightedMessage(null), 1800);
    }
  }, []);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-400">
        Select a conversation
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const ts = msg.sort_timestamp || msg.created_at;
    if (!ts) return;
    const dateLabel = getDateLabel(ts);
    if (dateLabel !== lastDate) {
      groupedMessages.push({ type: 'date', label: dateLabel });
      lastDate = dateLabel;
    }
    groupedMessages.push({ type: 'message', data: msg });
  });

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2] h-full overflow-hidden">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
            {displayName.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{displayName}</h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-phone-alt text-green-600"></i> {phoneNumber}
              <span className="mx-1">•</span>
              Mode: <span className="font-medium capitalize">{conversation.reply_mode || 'human'}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3 text-gray-500">
          <button className="p-2 hover:bg-gray-100 rounded-full"><i className="fas fa-search"></i></button>
          <button className="p-2 hover:bg-gray-100 rounded-full"><i className="fas fa-ellipsis-v"></i></button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {loading && <div className="text-center text-gray-400">Loading messages...</div>}
        {groupedMessages.map((item, index) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${index}`} className="flex justify-center my-2">
                <span className="bg-gray-300 text-gray-700 text-xs px-4 py-1 rounded-full font-medium">
                  {item.label}
                </span>
              </div>
            );
          }
          const msg = item.data;
          const userId = user?.user_id ?? user?.id;
          const isOwn = Boolean(
            (msg.sender_id && userId && String(msg.sender_id) === String(userId)) ||
            msg.sender_type === 'outbound' ||
            msg.direction === 'outbound' ||
            msg.direction === 'outgoing'
          );
          // ✅ Pass displayName as senderName for incoming messages
          const senderName = !isOwn ? displayName : null;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={isOwn}
              senderName={senderName}
              onReply={handleReply}
              onQuoteClick={handleQuoteClick}
              highlighted={highlightedMessage === msg.id}
            />
          );
        })}
        {typing && <TypingIndicator active />}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white p-3 border-t border-gray-200">
        {replyTo && (
          <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Replying to</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {replyTo.sender_type === 'outbound' ? 'You' : 'Contact'}
                </div>
                <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                  {replyTo.text || replyTo.content || 'Quoted message'}
                </div>
              </div>
              <button
                type="button"
                onClick={clearReply}
                className="rounded-full px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <MessageInput
          onSend={handleSendWithReply}
          onSendLocation={onSendLocation}
          onMessageSent={onMessageSent}
          disabled={!canSend}
          replyTo={replyTo}
          onClearReply={clearReply}
        />
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && messages.length > 0 && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 z-20 rounded-full bg-gray-800 text-white px-4 py-2 text-sm shadow-lg hover:bg-gray-700"
        >
          Latest chat
        </button>
      )}
    </div>
  );
};

export default ChatWindow;