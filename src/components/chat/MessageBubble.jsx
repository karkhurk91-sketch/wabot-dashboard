import React, { memo } from 'react';
import { formatFileSize, getMediaLabel, getStatusIcon, isMediaMessage } from '../../utils/chatUtils';

const MessageBubble = ({ message, isOwn }) => {
  const bodyText = message.text ?? message.content ?? '';
  const bubbleClass = isOwn
    ? 'bg-emerald-50 text-slate-900 dark:bg-emerald-900/20 dark:text-white'
    : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xl rounded-3xl px-4 py-3 shadow-sm ${bubbleClass}`}>
        <div className="mb-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
          <span>{isOwn ? 'You' : 'Customer'}</span>
          {isOwn && <span>{getStatusIcon(message.status)}</span>}
        </div>
        {isMediaMessage(message.message_type) ? (
          <div className="space-y-2">
            {message.message_type === 'image' && <img src={message.media_url} alt="attachment" className="rounded-xl object-contain max-h-72 w-full" />}
            {message.message_type === 'video' && <video controls src={message.media_url} className="rounded-xl max-h-72 w-full" />}
            {message.message_type === 'audio' && <audio controls src={message.media_url} className="w-full" />}
            {message.message_type === 'document' && (
              <a href={message.media_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <span>📄 {message.media_file_name || getMediaLabel(message.message_type)}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{message.media_file_size ? formatFileSize(message.media_file_size) : ''}</span>
              </a>
            )}
            {bodyText && <p className="break-words text-sm leading-6 text-slate-800 dark:text-slate-100">{bodyText}</p>}
          </div>
        ) : (
          <p className="break-words text-sm leading-6 text-slate-900 dark:text-slate-100">{bodyText}</p>
        )}
        <div className="mt-2 text-right text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  );
};

export default memo(MessageBubble);
