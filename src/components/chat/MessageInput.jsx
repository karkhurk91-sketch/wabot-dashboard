/**
 * Enhanced Message Input Component
 * Supports text, emoji, and media input
 */

import React, { useState, useRef, useCallback, memo } from 'react';
import EmojiPicker from 'emoji-picker-react';
import EmojiPickerPanel from './EmojiPickerPanel';
import MediaUploader from './MediaUploader';

const MessageInputEnhanced = ({
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
  disabled,
  onTyping,
}) => {
  const [showModernEmoji, setShowModernEmoji] = useState(false);
  const emojiPickerRef = useRef(null);

  const handleEmojiClickModern = useCallback((event) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart;
      const end = inputRef.current.selectionEnd;

      const newContent =
        message.substring(0, start) +
        event.emoji +
        message.substring(end);

      setMessage(newContent);
      setShowModernEmoji(false);

      setTimeout(() => {
        const newPosition = start + event.emoji.length;
        inputRef.current.selectionStart = newPosition;
        inputRef.current.selectionEnd = newPosition;
        inputRef.current.focus();
      }, 0);
    }
  }, [message, setMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
    onTyping?.();
  }, [onSend, onTyping]);

  // Close emoji picker on outside click
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowModernEmoji(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
      <div className="flex flex-col gap-4">
        {/* Uploading preview is handled in the attachment menu below */}

        <div className="flex items-center gap-2">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => document.getElementById('chat-attachment-input')?.click()}
            disabled={disabled || uploading}
            className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            title="Attach media"
          >
            📎
          </button>
          <input
            id="chat-attachment-input"
            {...attachmentProps?.getInputProps?.()}
            className="hidden"
            disabled={disabled || uploading}
          />

          {/* Emoji Button */}
          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowModernEmoji(!showModernEmoji)}
              className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              title="Emoji"
            >
              😊
            </button>
            {showModernEmoji && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClickModern} />
              </div>
            )}
          </div>

          {/* Original emoji button */}
          <button
            type="button"
            onClick={onToggleEmoji}
            className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <i className="far fa-smile-wink" />
          </button>

          {/* Message Input */}
          <input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message or caption..."
            className="flex-1 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={onSend}
            disabled={sending || (message.trim().length === 0 && !attachmentProps?.hasAttachment) || uploading}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>

        {/* Emoji Picker Panel */}
        {emojiOpen && <EmojiPickerPanel onEmojiClick={onEmojiSelect} />}

        {/* Attachment Menu */}
        {showAttachmentMenu && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <MediaUploader {...attachmentProps} uploading={uploading} />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(MessageInputEnhanced);
