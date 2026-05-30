/**
 * Message utility functions for sorting, formatting, and managing message state
 */

/**
 * Sort messages by sort_timestamp (or created_at as fallback) in ascending order
 * @param {Array} messages - Array of message objects
 * @returns {Array} Sorted messages (oldest first)
 */
export function sortMessages(messages) {
  if (!Array.isArray(messages)) return [];
  
  return [...messages].sort((a, b) => {
    // Use sort_timestamp if available, otherwise fall back to created_at
    const timestampA = a.sort_timestamp ? new Date(a.sort_timestamp) : new Date(a.created_at);
    const timestampB = b.sort_timestamp ? new Date(b.sort_timestamp) : new Date(b.created_at);
    
    const diff = timestampA - timestampB;
    if (diff !== 0) return diff;
    
    // If timestamps are equal, use id as tiebreaker (alphabetical)
    if (a.id && b.id) {
      return a.id.localeCompare(b.id);
    }
    return 0;
  });
}

export function formatTimestampToIST(timestamp) {
  if (!timestamp) return '';
  
  let date;
  const tsStr = String(timestamp);
  
  // If the string already has a timezone offset (+05:30, -04:00, Z, etc.), use it as is
  if (tsStr.includes('+') || tsStr.includes('-') || tsStr.includes('Z')) {
    date = new Date(timestamp);
  } else {
    // No timezone info → assume UTC
    date = new Date(timestamp + 'Z');
  }
  
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}

/**
 * Check if a message is a media message
 * @param {string} messageType - Message type (text, image, video, audio, document)
 * @returns {boolean} True if message contains media
 */
export function isMediaMessage(messageType) {
  return ['image', 'video', 'audio', 'document'].includes(messageType);
}

/**
 * Generate temporary message ID for optimistic UI
 * @returns {string} Client-generated UUID-like ID
 */
export function generateTempMessageId() {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a temporary message object for optimistic UI
 * @param {string} content - Message content
 * @param {string} direction - 'inbound' or 'outbound'
 * @returns {Object} Temporary message object
 */
export function createTempMessage(content, direction = 'outbound') {
  const now = new Date().toISOString();
  return {
    id: generateTempMessageId(),
    text: content,
    content: content,
    sender_type: direction,
    direction: direction,
    created_at: now,
    sort_timestamp: now,
    status: 'sending',
    message_type: 'text',
    media_url: null,
    is_temp: true
  };
}

/**
 * Check if a message is a temporary (optimistic UI) message
 * @param {Object} message - Message object
 * @returns {boolean} True if message is temporary
 */
export function isTempMessage(message) {
  return message && (message.is_temp === true || (typeof message.id === 'string' && message.id.startsWith('temp_')));
}

/**
 * Merge incoming message with existing message in state
 * Used for replacing temporary messages with confirmed messages
 * @param {Object} existingMsg - Existing message from state
 * @param {Object} incomingMsg - New message from server
 * @returns {Object} Merged message
 */
export function mergeMessageUpdate(existingMsg, incomingMsg) {
  if (incomingMsg.whatsapp_message_id && isTempMessage(existingMsg)) {
    return {
      ...incomingMsg,
      is_temp: false
    };
  }
  return {
    ...existingMsg,
    ...incomingMsg,
    is_temp: false
  };
}