import React, { memo } from 'react';

const ChatHeader = ({
  selectedConversation,
  tags,
  userRole,
  onTransfer,
  onModeChange,
  onOpenDrawer,
  onToggleDarkMode,
  darkMode,
}) => {
  const tagList = Array.isArray(tags) ? tags : [];
  return (
    <div className="shrink-0 flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-950 sm:px-5 sm:py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
              {selectedConversation?.customer_name || 'Select a conversation'}
            </h3>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {selectedConversation?.customer_phone_number || 'Waiting for selection...'}
            </p>
            {selectedConversation?.assigned_agent_name && (
              <p className="mt-1 truncate text-xs text-emerald-700 dark:text-emerald-400">
                Agent: {selectedConversation.assigned_agent_name}
              </p>
            )}
            {selectedConversation?.assigned_agent_id && !selectedConversation?.assigned_agent_name && (
              <p className="mt-1 text-xs text-slate-500">Assigned (see details)</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>
          <button
            type="button"
            onClick={onOpenDrawer}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            Details
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {tagList.length === 0 && <span className="text-xs text-slate-400">No tags</span>}
        {tagList.map((tag) => (
          <span
            key={tag.id}
            className="rounded-full px-2 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: tag.color || '#4F46E5' }}
          >
            {tag.name}
          </span>
        ))}
      </div>
      {userRole === 'org_admin' && (
        <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
          <button type="button" onClick={() => onModeChange('ai')} className="rounded-full bg-amber-100 px-3 py-1">
            AI
          </button>
          <button type="button" onClick={() => onModeChange('human')} className="rounded-full bg-emerald-100 px-3 py-1">
            Human
          </button>
          <button type="button" onClick={() => onModeChange('rule')} className="rounded-full bg-violet-100 px-3 py-1">
            Rule
          </button>
          <button type="button" onClick={() => onTransfer()} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
            Transfer
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(ChatHeader);
