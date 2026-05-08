import React, { memo } from 'react';

const ChatHeader = ({ selectedConversation, tags, userRole, onTransfer, onModeChange, onOpenDrawer, onToggleDarkMode, darkMode }) => {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{selectedConversation?.customer_name || 'Select a conversation'}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{selectedConversation?.customer_phone_number || 'Waiting for selection...'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {darkMode ? 'Light' : 'Dark'} mode
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
        {tags.map((tag) => (
          <span key={tag.id} className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700 dark:bg-indigo-200 dark:text-indigo-900">{tag.name}</span>
        ))}
      </div>
      {userRole === 'org_admin' && (
        <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
          <button type="button" onClick={() => onModeChange('ai')} className="rounded-full bg-amber-100 px-3 py-1">AI</button>
          <button type="button" onClick={() => onModeChange('human')} className="rounded-full bg-emerald-100 px-3 py-1">Human</button>
          <button type="button" onClick={() => onModeChange('rule')} className="rounded-full bg-violet-100 px-3 py-1">Rule</button>
          <button type="button" onClick={() => onTransfer()} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Transfer</button>
        </div>
      )}
    </div>
  );
};

export default memo(ChatHeader);
