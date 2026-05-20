// src/components/chat/ChatWindow.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import MessageInput from './MessageInput';

const ChatWindow = ({
  conversation,
  messages,
  loading,
  typing,
  onSend,
  onMessageSent,
  onLoadOlder,
}) => {
  const { user, userRole } = useAuth();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const phoneNumber = conversation?.customer_phone_number || conversation?.phone || '';
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

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-400">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2] h-full overflow-hidden">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
            {conversation.customer_name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{conversation.customer_name || 'Unknown'}</h2>
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
        {messages.map((msg) => {
          const userId = user?.user_id ?? user?.id;
          const isOwn = Boolean(
            (msg.sender_id && userId && String(msg.sender_id) === String(userId)) ||
            msg.sender_type === 'outbound' ||
            msg.direction === 'outbound' ||
            msg.direction === 'outgoing'
          );
          return <MessageBubble key={msg.id} message={msg} isOwn={isOwn} />;
        })}
        {typing && <TypingIndicator active />}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white p-3 border-t border-gray-200">
        <MessageInput onSend={onSend} onMessageSent={onMessageSent} disabled={!canSend} />
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