import React, { memo } from 'react';

const ChatSkeleton = () => (
  <div className="space-y-4 p-6">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="animate-pulse rounded-3xl bg-slate-200 p-4 dark:bg-slate-800">
        <div className="mb-3 h-4 w-2/5 rounded-full bg-slate-300 dark:bg-slate-700" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="h-3 w-4/5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
      </div>
    ))}
  </div>
);

export default memo(ChatSkeleton);
