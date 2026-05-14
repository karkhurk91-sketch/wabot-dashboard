import React, { memo, useMemo, useState } from 'react';
import { formatPhone } from '../../utils/chatUtils';

const ConversationList = ({ conversations, selectedConversation, onSelect, searchTerm, onSearch, onCreateConversation }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter((conv) => {
      const text = `${conv.customer_name || ''} ${conv.customer_phone_number || ''}`.toLowerCase();
      return text.includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm]);

  const handleCreate = async () => {
    if (newPhoneNumber.trim()) {
      await onCreateConversation(newPhoneNumber.trim());
      setNewPhoneNumber('');
      setShowCreateForm(false);
    }
  };

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:w-96 xl:w-[26rem] lg:shrink-0 lg:border-r">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Conversations</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {filtered.length} thread{filtered.length === 1 ? '' : 's'}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {conversations.length}
          </span>
        </div>
        <div className="mt-4 relative">
          <input
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by name or phone"
            className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mt-4 w-full rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {showCreateForm ? 'Cancel' : 'Start New Conversation'}
        </button>
        {showCreateForm && (
          <div className="mt-3 space-y-2">
            <input
              type="tel"
              value={newPhoneNumber}
              onChange={(e) => setNewPhoneNumber(e.target.value)}
              placeholder="Enter phone number (e.g., +1234567890)"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              onClick={handleCreate}
              disabled={!newPhoneNumber.trim()}
              className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Create Conversation
            </button>
          </div>
        )}
      </div>
      <div className="overflow-y-auto flex-1 p-2 space-y-2">
        {filtered.length === 0 && <div className="p-4 text-sm text-slate-500 dark:text-slate-400">No conversations found.</div>}
        {filtered.map((conv) => {
          const isActive = selectedConversation?.id === conv.id;
          const last = conv.last_message;
          const lastPreview =
            typeof last === 'string'
              ? last
              : last && typeof last === 'object'
                ? last.text ?? last.content ?? 'Message'
                : 'No messages yet';
          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => onSelect(conv)}
              className={`w-full rounded-3xl px-4 py-3 text-left transition ${isActive ? 'bg-indigo-50 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white">
                    {(String(conv.customer_name || conv.customer_phone_number || 'U').trim().charAt(0) || 'U').toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{conv.customer_name || formatPhone(conv.customer_phone_number) || 'Unknown'}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">{lastPreview}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">{conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className={`rounded-full px-2 py-1 ${conv.reply_mode === 'ai' ? 'bg-amber-100 text-amber-700' : conv.reply_mode === 'human' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}`}>{conv.reply_mode === 'ai' ? '🤖 AI' : conv.reply_mode === 'human' ? '👤 Human' : '⚙️ Rule'}</span>
                {conv.assigned_agent_name && <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">👤 {conv.assigned_agent_name}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default memo(ConversationList);
