import React, { useState, useEffect } from 'react';

const ConversationList = ({
  conversations = [],
  activeId,
  onSelect,
  searchTerm = '',
  onSearch,
  onCreateConversation,
}) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const filtered = conversations.filter((conv) => {
    const name = (conv?.customer_name || conv?.name || '').toLowerCase();
    const phone = (conv?.customer_phone_number || conv?.phone || '').toLowerCase();
    return name.includes(localSearch.toLowerCase()) || phone.includes(localSearch.toLowerCase());
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearch?.(value);
  };

  const handleCreate = async () => {
    if (!newPhone.trim()) return;
    await onCreateConversation?.(newPhone.trim());
    setNewPhone('');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent chats</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} threads</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Search by name or phone"
              className="w-full rounded-full border border-slate-200 bg-slate-100 py-3 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                onSearch?.('');
              }}
              className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Start chat with phone"
            className="w-full rounded-full border border-slate-200 bg-slate-100 py-3 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            disabled={!newPhone.trim()}
          >
            New
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">No conversations found</div>
        ) : (
          filtered.map((conv) => {
            const isActive = activeId === conv.id;
            const displayPhone = conv.customer_phone_number || conv.phone || 'No phone';
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv)}
                className={`w-full text-left transition ${
                  isActive ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-4">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-semibold">
                    {(conv.customer_name || conv.name || displayPhone || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {conv.customer_name || conv.name || 'Unknown'}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {displayPhone}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {conv.lastMessageTime || ''}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
