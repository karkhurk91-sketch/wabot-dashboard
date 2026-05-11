/**
 * Enhanced Message Input Component
 * Supports text, emoji, and media input
 */

import React, { useState, useRef, useCallback, memo } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { useMedia } from '../../hooks/useMedia';
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
  organizationId,
  conversationId,
  onTyping,
}) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showModernEmoji, setShowModernEmoji] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const { uploadMedia, progress } = useMedia(organizationId);

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

  const handleMediaSelect = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSelectedMedia(null);
      const uploadedMedia = await uploadMedia(file, conversationId);
      setSelectedMedia(uploadedMedia);
    } catch (error) {
      console.error('Media upload error:', error);
    }
  }, [conversationId, uploadMedia]);

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
        {/* Media Preview */}
        {selectedMedia && (
          <div className="relative flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedMedia.media_file_name || 'Media attached'}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {Math.round(selectedMedia.media_file_size / 1024)} KB
              </p>
            </div>
            <button
              onClick={() => setSelectedMedia(null)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            title="Attach media"
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*,.pdf"
            onChange={handleMediaSelect}
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
            disabled={sending || (message.trim().length === 0 && !selectedMedia) || uploading}
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

export default memo(MessageInput);
