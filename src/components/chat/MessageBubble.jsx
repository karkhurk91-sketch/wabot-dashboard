import React, { memo } from 'react';
import { formatFileSize, getMediaLabel, getStatusIcon, isMediaMessage } from '../../utils/chatUtils';

const MessageBubble = ({ msg, isOutbound }) => {
  const bubbleClass = isOutbound
    ? 'bg-emerald-50 text-slate-900 dark:bg-emerald-900/20 dark:text-white'
    : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xl rounded-3xl px-4 py-3 shadow-sm ${bubbleClass}`}>
        <div className="mb-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
          <span>{isOutbound ? 'You' : 'Customer'}</span>
          {isOutbound && <span>{getStatusIcon(msg.status)}</span>}
        </div>
        {isMediaMessage(msg.message_type) ? (
          <div className="space-y-2">
            {msg.message_type === 'image' && <img src={msg.media_url} alt="attachment" className="rounded-xl object-contain max-h-72 w-full" />}
            {msg.message_type === 'video' && <video controls src={msg.media_url} className="rounded-xl max-h-72 w-full" />}
            {msg.message_type === 'audio' && <audio controls src={msg.media_url} className="w-full" />}
            {msg.message_type === 'document' && (
              <a href={msg.media_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <span>📄 {msg.media_file_name || getMediaLabel(msg.message_type)}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{msg.media_file_size ? formatFileSize(msg.media_file_size) : ''}</span>
              </a>
            )}
            {msg.content && <p className="break-words text-sm leading-6 text-slate-800 dark:text-slate-100">{msg.content}</p>}
          </div>
        ) : (
          <p className="break-words text-sm leading-6 text-slate-900 dark:text-slate-100">{msg.content}</p>
        )}
        <div className="mt-2 text-right text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  );
};

export default memo(MessageBubble);
