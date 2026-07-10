/**
 * Convert an ISO timestamp to a human‑readable relative time string.
 * Used in conversation list previews.
 * @param {string} timestamp - ISO datetime string (e.g., "2026-07-10T14:30:00Z")
 * @returns {string} Relative time (e.g., "2 min ago", "yesterday", "1 week ago")
 */
export function formatRelativeTime(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (isNaN(then.getTime())) return 'Invalid date';

  if (diffSec < 30) return 'just now';
  if (diffMin < 1) return `${diffSec} sec ago`;
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  const years = Math.floor(diffDay / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

/**
 * Format a timestamp as HH:MM AM/PM (12‑hour clock).
 * Used inside each message bubble.
 * @param {string} timestamp - ISO datetime string
 * @returns {string} e.g., "2:30 PM"
 */
export function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Get a human‑readable label for a date (Today, Yesterday, day name, or DD/MM/YYYY).
 * Used for date separators between messages.
 * @param {string|Date} date - A date string or Date object
 * @returns {string} e.g., "Today", "Yesterday", "Monday", "20/07/2026"
 */
export function getDateLabel(date) {
  const now = new Date();
  const target = new Date(date);
  if (isNaN(target.getTime())) return '';

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  if (targetDate.getTime() === today.getTime()) return 'Today';
  if (targetDate.getTime() === yesterday.getTime()) return 'Yesterday';

  const dayDiff = Math.floor((today - targetDate) / (1000 * 60 * 60 * 24));
  if (dayDiff < 7 && dayDiff > 0) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[target.getDay()];
  }

  // Fallback to DD/MM/YYYY (adjust to your locale if needed)
  const day = target.getDate().toString().padStart(2, '0');
  const month = (target.getMonth() + 1).toString().padStart(2, '0');
  const year = target.getFullYear();
  return `${day}/${month}/${year}`;
}