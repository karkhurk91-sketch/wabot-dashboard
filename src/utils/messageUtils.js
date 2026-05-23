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

/**
 * Format UTC timestamp to IST time string (e.g., "3:50 pm")
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Formatted time in IST
 */
export function formatTimestampToIST(timestamp) {
  if (!timestamp) return '';
  
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
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
    is_temp: true  // Flag to identify temporary messages
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
  // If incoming has whatsapp_message_id and existing is temp, replace it
  if (incomingMsg.whatsapp_message_id && isTempMessage(existingMsg)) {
    return {
      ...incomingMsg,
      is_temp: false
    };
  }
  
  // Otherwise merge, with incoming taking precedence
  return {
    ...existingMsg,
    ...incomingMsg,
    is_temp: false
  };
}
