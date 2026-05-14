import React, { useState, useRef } from 'react';
import useMediaUpload from '../../hooks/useMediaUpload';
import EmojiPickerPanel from './EmojiPickerPanel';

const MessageInput = ({ onSend, onTyping }) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const inputRef = useRef(null);

  const mediaUpload = useMediaUpload();
  const {
    attachment,
    error,
    uploading,
    setUploading,
    clearAttachment,
    buildFormData,
    updateProgress,
    hasAttachment,
    getRootProps,
    getInputProps,
  } = mediaUpload;

  const handleSend = async () => {
    if (!message.trim() && !hasAttachment) return;

    if (hasAttachment) {
      const formData = buildFormData(message.trim());
      if (!formData.has('file')) return;
      setUploading(true);
      try {
        await onSend(message.trim(), formData, (progressEvent) => {
          if (!progressEvent.lengthComputable) return;
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          updateProgress(percent);
        });
      } catch (err) {
        console.error('Upload failed', err);
      } finally {
        setUploading(false);
        clearAttachment();
        setShowAttachmentMenu(false);
      }
    } else {
      await onSend(message.trim(), null);
    }

    setMessage('');
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    onTyping?.();
  };

  const onEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-3">
      {showAttachmentMenu && (
        <div className="mb-2">
          <div {...getRootProps()} className="cursor-pointer inline-block">
            <input {...getInputProps()} />
            <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm">
              Choose file to attach
            </div>
          </div>
          {attachment && (
            <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {attachment.name}
                </div>
                <button onClick={clearAttachment} className="text-sm text-red-500 hover:text-red-600">
                  Remove
                </button>
              </div>
              {attachment.preview && (
                <div className="mt-3">
                  {attachment.mediaType === 'image' ? (
                    <img src={attachment.preview} className="max-h-36 w-full rounded-2xl object-cover" alt="preview" />
                  ) : attachment.mediaType === 'video' ? (
                    <video src={attachment.preview} controls className="max-h-36 w-full rounded-2xl object-cover" />
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Ready to send {attachment.mediaType}.</p>
                  )}
                </div>
              )}
              <div className="mt-3 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${attachment.progress || 0}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {uploading ? `Uploading ${attachment.progress || 0}%` : 'Ready to send'}
              </p>
            </div>
          )}
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowAttachmentMenu((prev) => !prev)}
          className="rounded-full p-2 text-slate-500 transition hover:text-emerald-600 dark:text-slate-400"
        >
          📎
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji((prev) => !prev)}
            className="rounded-full p-2 text-slate-500 transition hover:text-emerald-600 dark:text-slate-400"
          >
            😊
          </button>
          {showEmoji && <EmojiPickerPanel onEmojiClick={onEmojiSelect} />}
        </div>
        <textarea
          ref={inputRef}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message"
          className="min-h-[44px] flex-1 resize-none rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={uploading}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
