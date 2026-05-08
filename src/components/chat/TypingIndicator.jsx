import React, { memo } from 'react';

const TypingIndicator = ({ active }) => {
  if (!active) return null;
  return (
    <div className="flex items-center gap-2 rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
      <span>Typing...</span>
    </div>
  );
};

export default memo(TypingIndicator);
