// src/components/chat/ConversationList.jsx
import React from 'react';
import { formatTimestampToIST } from '../../utils/messageUtils';

const ConversationList = ({ conversations, activeId, onSelect, searchTerm, onSearch, onCreateConversation }) => {
  // Helper to get the last message text or media label
  const getLastMessageText = (conv) => {
    const type = conv.last_message?.message_type;
    if (['image', 'video', 'audio', 'document'].includes(type)) {
      return 'Media';
    }
    const text = conv.last_message?.text || conv.last_message?.content || '';
    if (!text) return 'No messages yet';
    return text.length > 10 ? `${text.slice(0, 10)}...` : text;
  };

  // Helper to get the last message timestamp (use sort_timestamp if available)
  const getLastMessageTime = (conv) => {
    const timestamp = conv.last_message?.sort_timestamp || conv.last_message?.created_at || conv.last_message_at;
    return timestamp ? formatTimestampToIST(timestamp) : '';
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-3 border-b">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search by name or phone"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none"
          />
        </div>
        <button
          onClick={onCreateConversation}
          className="mt-2 text-sm text-emerald-600 w-full text-left hover:text-emerald-800"
        >
          + Start chat with phone
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition ${
              activeId === conv.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
              {conv.customer_name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <span className="font-medium text-gray-800 truncate">{conv.customer_name || 'Unknown'}</span>
                <span className="text-xs text-gray-400">
                  {getLastMessageTime(conv)}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {getLastMessageText(conv)}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs">
                {conv.unread_count > 0 && (
                  <span className="bg-emerald-500 text-white rounded-full px-2 py-0.5 text-[10px]">{conv.unread_count}</span>
                )}
                {conv.sla_status === 'breached' && (
                  <span className="text-red-500">⚠️ SLA breached</span>
                )}
                {conv.assigned_agent_name && (
                  <span className="text-gray-400">Agent: {conv.assigned_agent_name}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {conversations.length === 0 && (
          <div className="p-4 text-center text-gray-400">No conversations</div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;