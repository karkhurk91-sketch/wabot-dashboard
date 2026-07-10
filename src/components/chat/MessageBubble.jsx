import React, { memo } from 'react';
import { formatFileSize, getMediaLabel, isMediaMessage } from '../../utils/chatUtils';
import { formatTimestampToIST, isTempMessage } from '../../utils/messageUtils';
import { formatMessageTime } from '../../utils/timeFormatter'; // Use message time formatter

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MessageBubble = ({ message, isOwn }) => {
  const bodyText = message.text ?? message.content ?? '';
  const isSending = message.status === 'sending' || isTempMessage(message);

  const bubbleClass = isOwn
    ? 'bg-[#dcf8c5] text-gray-800'
    : 'bg-white text-gray-800';

  const alignmentClass = isOwn ? 'justify-end' : 'justify-start';
  const cornerClass = isOwn
    ? 'rounded-2xl rounded-br-md'
    : 'rounded-2xl rounded-bl-md';

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
    const match = text?.match(/Location:\s*([-\d.]+),\s*([-\d.]+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    return null;
  }

  return (
    <div className={`flex ${alignmentClass} px-2 mb-1 ${isSending ? 'opacity-75' : ''}`}>
      <div className={`max-w-[70%] ${cornerClass} px-3 py-2 shadow-sm ${bubbleClass} ${isSending ? 'italic' : ''}`}>
        {message.mode && (
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

        {/* Media messages */}
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

        {/* Location message */}
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

        {/* Text content (if not a location message with no extra text) */}
        {!isLocation && bodyText && <div className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{bodyText}</div>}

        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[11px] text-gray-500" title={absoluteTime}>
            {displayTime}
          </span>
          {isOwn && tick && <span className={`text-[12px] ${tickColor}`}>{tick}</span>}
        </div>
      </div>
    </div>
  );
};

export default memo(MessageBubble);