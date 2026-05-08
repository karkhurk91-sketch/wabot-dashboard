import React, { memo } from 'react';
import EmojiPickerPanel from './EmojiPickerPanel';
import MediaUploader from './MediaUploader';

const MessageInput = ({
  message,
  setMessage,
  onSend,
  onToggleEmoji,
  emojiOpen,
  onEmojiSelect,
  onAttachmentToggle,
  showAttachmentMenu,
  attachmentProps,
  inputRef,
  sending,
  uploading,
}) => (
  <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAttachmentToggle}
          className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <i className="fas fa-paperclip" />
        </button>
        <button
          type="button"
          onClick={onToggleEmoji}
          className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <i className="far fa-smile-wink" />
        </button>
        <input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
          placeholder="Type a message or caption..."
          className="flex-1 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={sending || (message.trim().length === 0 && !attachmentProps?.hasAttachment) || uploading}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
      {emojiOpen && <EmojiPickerPanel onEmojiClick={onEmojiSelect} />}
      {showAttachmentMenu && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <MediaUploader {...attachmentProps} uploading={uploading} />
        </div>
      )}
    </div>
  </div>
);

export default memo(MessageInput);
