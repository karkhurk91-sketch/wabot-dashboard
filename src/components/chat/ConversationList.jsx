import React from 'react';
import { formatRelativeTime } from '../../utils/timeFormatter'; // new import
import { formatTimestampToIST } from '../../utils/messageUtils';

const ConversationList = ({ conversations, activeId, onSelect, searchTerm, onSearch, searchType, onSearchTypeChange }) => {
  const getLastMessageText = (conv) => {
    const preview = conv.last_message_preview || conv.last_message?.text || conv.last_message?.content || '';
    if (preview) return preview;
    return 'No messages yet';
  };

  const getLastMessageTime = (conv) => {
    const timestamp = conv.last_message?.sort_timestamp || conv.last_message?.created_at || conv.last_message_at;
    if (!timestamp) return '';
    // Return relative time
    return formatRelativeTime(timestamp);
  };

  const getAbsoluteTimestamp = (conv) => {
    const timestamp = conv.last_message?.sort_timestamp || conv.last_message?.created_at || conv.last_message_at;
    if (!timestamp) return '';
    return formatTimestampToIST(timestamp);
  };

  const getAvatarInitials = (conv) => {
    const customerName = conv.customer_name || conv.customer_phone_number || 'U';
    return customerName.charAt(0).toUpperCase();
  };

  const getSenderBadge = (conv) => {
    const sender = conv.last_message_sender || conv.last_message?.sender_label;
    if (sender === 'bot') return { label: 'Bot', icon: '🤖', tone: 'bg-violet-100 text-violet-700' };
    if (sender === 'agent') return { label: 'Agent', icon: '👤', tone: 'bg-sky-100 text-sky-700' };
    return { label: 'Customer', icon: '💬', tone: 'bg-emerald-100 text-emerald-700' };
  };

  const getAvatarColor = (conv) => {
    const palette = ['bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
    const seed = (conv.customer_name || conv.customer_phone_number || 'u').length % palette.length;
    return palette[seed];
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-3 border-b space-y-2">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search by name, content, tags, or custom fields"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none"
          />
        </div>
        <select
          value={searchType}
          onChange={(e) => onSearchTypeChange?.(e.target.value)}
          className="w-full rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600"
        >
          <option value="name_phone">Name / phone</option>
          <option value="content">Message content</option>
          <option value="tags">Tags</option>
          <option value="custom_fields">Custom fields</option>
        </select>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const senderBadge = getSenderBadge(conv);
          const relativeTime = getLastMessageTime(conv);
          const absoluteTime = getAbsoluteTimestamp(conv);
          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition ${
                activeId === conv.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
              }`}
            >
              <div className="relative shrink-0">
                {conv.profile_picture ? (
                  <img src={conv.profile_picture} alt="avatar" className="w-11 h-11 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className={`w-11 h-11 rounded-full ${getAvatarColor(conv)} flex items-center justify-center text-white font-semibold`}>
                    {getAvatarInitials(conv)}
                  </div>
                )}
                {conv.unread_count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] leading-5 text-center font-semibold">
                    {conv.unread_count > 9 ? '9+' : conv.unread_count}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-800 truncate">{conv.customer_name || 'Unknown'}</span>
                  <span
                    className="text-[11px] text-gray-400 shrink-0"
                    title={absoluteTime} // absolute timestamp on hover
                  >
                    {relativeTime}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${senderBadge.tone}`}>
                    <span>{senderBadge.icon}</span>
                    {senderBadge.label}
                  </span>
                  {conv.last_message_preview && (
                    <span className="text-sm text-gray-500 truncate">{getLastMessageText(conv)}</span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-gray-500">
                  {(conv.tags || []).slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5">{tag}</span>
                  ))}
                  {(conv.tags || []).length > 2 && <span className="text-gray-400">+{(conv.tags || []).length - 2}</span>}
                  {conv.sla_status === 'breached' && <span className="text-red-500">⚠ SLA</span>}
                  {conv.is_starred && <span className="text-amber-500">★</span>}
                </div>
              </div>
            </div>
          );
        })}
        {conversations.length === 0 && (
          <div className="p-4 text-center text-gray-400">No conversations</div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;