import React, { memo, useEffect, useRef, useState } from 'react';
import { formatFileSize, getMediaLabel, isMediaMessage } from '../../utils/chatUtils';
import { formatTimestampToIST, isTempMessage } from '../../utils/messageUtils';
import { formatMessageTime } from '../../utils/timeFormatter';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MessageBubble = ({ message, isOwn, onReply, onQuoteClick, highlighted, senderName }) => {
  const bodyText = message.text ?? message.content ?? '';
  const isSending = message.status === 'sending' || isTempMessage(message);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });
  const [showHoverReply, setShowHoverReply] = useState(false);
  const touchTimeout = useRef(null);
  const bubbleRef = useRef(null);

  const quoted = message.reply_to;
  const quoteLabel = quoted?.sender_type === 'outbound' ? 'You' : 'Contact';
  const quoteText = quoted?.text || '';

  useEffect(() => {
    return () => {
      if (touchTimeout.current) {
        clearTimeout(touchTimeout.current);
      }
    };
  }, []);

  const showMenu = (x, y) => {
    setMenuStyle({ top: y, left: x });
    setMenuVisible(true);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = bubbleRef.current?.getBoundingClientRect();
    const x = rect ? event.clientX - rect.left : 0;
    const y = rect ? event.clientY - rect.top : 0;
    showMenu(x, y);
  };

  const handleTouchStart = () => {
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current);
    }
    touchTimeout.current = window.setTimeout(() => {
      showMenu(16, 16);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current);
      touchTimeout.current = null;
    }
  };

  const handleReply = () => {
    setMenuVisible(false);
    if (onReply) {
      onReply(message);
    }
  };

  const handleQuoteClick = () => {
    if (quoted?.id && onQuoteClick) {
      onQuoteClick(quoted.id);
    }
  };

  const getAbsoluteMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };
  const absoluteMediaUrl = getAbsoluteMediaUrl(message.media_url);

  // Status ticks
  const status = message.status || (isOwn ? 'sent' : null);
  let tick = '';
  let tickColor = 'text-gray-500';
  if (isOwn) {
    if (status === 'read') {
      tick = '✓✓';
      tickColor = 'text-blue-500';
    } else if (status === 'delivered') {
      tick = '✓✓';
      tickColor = 'text-gray-500';
    } else if (status === 'sent') {
      tick = '✓';
      tickColor = 'text-gray-500';
    } else if (status === 'failed') {
      tick = '✗';
      tickColor = 'text-red-500';
    } else if (status === 'sending') {
      tick = '⏱';
      tickColor = 'text-amber-500';
    }
  }

  const timestamp = message.sort_timestamp || message.created_at;
  const displayTime = timestamp ? formatMessageTime(timestamp) : '';
  const absoluteTime = timestamp ? formatTimestampToIST(timestamp) : '';
  const isLocation = message.message_type === 'location';
  const locationLat = message.latitude || (message.content ? parseCoordinates(message.content)?.lat : null);
  const locationLng = message.longitude || (message.content ? parseCoordinates(message.content)?.lng : null);

  function parseCoordinates(text) {
    const match = text?.match(/Location:\s*([\-\d.]+),\s*([\-\d.]+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    return null;
  }

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-2 mb-1 ${isSending ? 'opacity-75' : ''}`}
      data-message-id={message.id}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      ref={bubbleRef}
    >
      <div
        className={`relative max-w-[70%] ${isOwn ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md'} px-3 py-2 shadow-sm ${isOwn ? 'bg-[#dcf8c5] text-gray-800' : 'bg-white text-gray-800'} ${highlighted ? 'ring-2 ring-emerald-400' : ''}`}
        onMouseEnter={() => setShowHoverReply(true)}
        onMouseLeave={() => setShowHoverReply(false)}
      >
        {/* Hover Reply Button (visible only for incoming messages) */}
        {!isOwn && onReply && (
          <button
            onClick={() => onReply(message)}
            className={`absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-all duration-200 ${
              showHoverReply ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            title="Reply"
            type="button"
          >
            <i className="fas fa-reply text-gray-600 text-sm"></i>
          </button>
        )}

        {quoted && (
          <button
            type="button"
            onClick={handleQuoteClick}
            className="mb-2 w-full rounded-xl border-l-4 border-sky-500 bg-slate-50 p-3 text-left hover:bg-slate-100"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
              {quoteLabel}
            </div>
            <div className="mt-1 text-sm text-slate-700 line-clamp-2">{quoteText || 'Quoted message'}</div>
          </button>
        )}

        {/* ✅ Sender label for inbound messages (shows customer name) */}
        {!isOwn && senderName && (
          <div className="mb-1 flex items-center">
            <span className="text-[11px] font-semibold mr-2 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
              {senderName}
            </span>
          </div>
        )}

        {/* Mode badge – only for outbound messages (or when mode is not 'user') */}
        {isOwn && message.mode && (
          <div className="mb-1 flex items-center">
            <span className={`text-[11px] font-semibold mr-2 px-2 py-0.5 rounded-full capitalize ${
              message.mode === 'ai' ? 'bg-violet-100 text-violet-700' :
              message.mode === 'human' ? 'bg-emerald-100 text-emerald-700' :
              message.mode === 'rule' ? 'bg-orange-100 text-orange-700' :
              message.mode === 'bot' ? 'bg-teal-100 text-teal-700' :
              'bg-gray-100 text-gray-700'
            }`}>{message.mode}</span>
          </div>
        )}

        {isMediaMessage(message.message_type) && (
          <div className="mb-2">
            {!absoluteMediaUrl && (
              <div className="text-sm text-gray-500 italic flex items-center gap-2">
                <span className="inline-block animate-spin">⏳</span>
                Media is loading...
              </div>
            )}
            {message.message_type === 'image' && absoluteMediaUrl && (
              <img src={absoluteMediaUrl} alt="attachment" className="rounded-xl max-h-64 w-auto object-contain" />
            )}
            {message.message_type === 'video' && absoluteMediaUrl && (
              <video controls src={absoluteMediaUrl} className="rounded-xl max-h-64 w-full" />
            )}
            {message.message_type === 'audio' && absoluteMediaUrl && (
              <audio controls src={absoluteMediaUrl} className="w-full" />
            )}
            {message.message_type === 'document' && absoluteMediaUrl && (
              <a href={absoluteMediaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                📄 {message.media_file_name || getMediaLabel(message.message_type)}
                {message.media_file_size && <span className="text-xs text-gray-500">({formatFileSize(message.media_file_size)})</span>}
              </a>
            )}
          </div>
        )}

        {isLocation && (locationLat && locationLng) && (
          <div className="mb-2">
            <a
              href={`https://www.openstreetmap.org/?mlat=${locationLat}&mlon=${locationLng}#map=16/${locationLat}/${locationLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              📍 View on Map
            </a>
            {bodyText && <div className="text-xs text-gray-500 mt-1">{bodyText}</div>}
          </div>
        )}

        {!isLocation && bodyText && <div className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{bodyText}</div>}

        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[11px] text-gray-500" title={absoluteTime}>
            {displayTime}
          </span>
          {isOwn && tick && <span className={`text-[12px] ${tickColor}`}>{tick}</span>}
        </div>

        {/* Context Menu */}
        {menuVisible && (
          <div
            className="absolute z-20 rounded-xl border border-slate-200 bg-white shadow-xl"
            style={{ top: menuStyle.top, left: menuStyle.left, minWidth: 120 }}
          >
            <button
              type="button"
              onClick={handleReply}
              className="w-full rounded-t-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            >
              Reply
            </button>
            <button
              type="button"
              onClick={() => setMenuVisible(false)}
              className="w-full rounded-b-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(MessageBubble);