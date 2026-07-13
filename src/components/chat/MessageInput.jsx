import React, { useEffect, useState, useRef } from 'react';
import useMediaUpload from '../../hooks/useMediaUpload';
import EmojiPickerPanel from './EmojiPickerPanel';
import LocationPickerModal from './LocationPickerModal';
import { listQuickReplies } from '../../services/chatApi';

const MessageInput = ({ onSend, onSendLocation, onTyping, onMessageSent, replyTo, onClearReply }) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
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
    let response = null;

    if (hasAttachment) {
      const formData = buildFormData(message.trim());
      if (!formData.has('file')) {
        console.error('FormData missing file - aborting send');
        return;
      }
      if (replyTo?.id) {
        formData.append('reply_to_id', replyTo.id);
      }
      setUploading(true);
      try {
        response = await onSend(message.trim(), formData, (progressEvent) => {
          if (!progressEvent.lengthComputable) return;
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          updateProgress(percent);
        }, replyTo?.id);
        clearAttachment();
        setShowAttachmentMenu(false);
      } catch (err) {
        console.error('Upload failed', err);
        return;
      } finally {
        setUploading(false);
      }
    } else {
      response = await onSend(message.trim(), null, null, replyTo?.id);
    }

    if (response && onMessageSent) {
      onMessageSent(response);
    }

    if (response && onClearReply) {
      onClearReply();
    }

    setMessage('');
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleSendLocation = async (lat, lng, name, address) => {
    if (onSendLocation) {
      await onSendLocation(lat, lng, name, address);
    }
    setShowLocationPicker(false);
  };

  useEffect(() => {
    const loadReplies = async () => {
      try {
        setLoadingReplies(true);
        const { data } = await listQuickReplies();
        setQuickReplies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load quick replies', err);
      } finally {
        setLoadingReplies(false);
      }
    };

    loadReplies();
  }, []);

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

  const insertQuickReply = (reply) => {
    setMessage(reply.content);
    setShowQuickReplies(false);
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

        <button
          type="button"
          onClick={() => setShowLocationPicker(true)}
          className="rounded-full p-2 text-slate-500 transition hover:text-emerald-600 dark:text-slate-400"
          title="Send location"
        >
          📍
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

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowQuickReplies((prev) => !prev)}
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-300"
          >
            ✉️ Replies
          </button>
          {showQuickReplies && (
            <div className="absolute bottom-12 left-0 z-20 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {loadingReplies ? (
                <p className="px-2 py-3 text-sm text-slate-500">Loading replies…</p>
              ) : quickReplies.length === 0 ? (
                <p className="px-2 py-3 text-sm text-slate-500">No quick replies yet.</p>
              ) : (
                <div className="max-h-56 space-y-1 overflow-y-auto">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply.id}
                      type="button"
                      onClick={() => insertQuickReply(reply)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <div className="font-medium text-slate-800 dark:text-slate-100">{reply.name}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-slate-500">{reply.content}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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

      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSend={handleSendLocation}
      />
    </div>
  );
};

export default MessageInput;