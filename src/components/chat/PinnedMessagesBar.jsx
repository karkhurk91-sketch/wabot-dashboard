import React from 'react';

const PinnedMessagesBar = ({ pins, onUnpin, canManage }) => {
  if (!pins || pins.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center overflow-x-auto gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 min-h-[44px]">
      <span className="text-xs font-semibold text-gray-500 mr-1 flex-shrink-0">
        📌 Pinned ({pins.length})
      </span>
      <div className="flex items-center gap-2 overflow-x-auto flex-1">
        {pins.map((pin) => {
          const msg = pin.message || {};
          const preview = msg.text || msg.content || (msg.message_type ? `[${msg.message_type}]` : 'Message');
          const sender = msg.sender_type === 'outbound' ? 'You' : (pin.sender_name || 'Customer');
          return (
            <div
              key={pin.id}
              className="flex items-center bg-white rounded-full shadow-sm px-3 py-1 border border-gray-200 whitespace-nowrap"
            >
              <span className="text-xs font-medium text-gray-700 max-w-[100px] truncate">
                {sender}
              </span>
              <span className="mx-1 text-gray-300">·</span>
              <span className="text-xs text-gray-600 max-w-[150px] truncate">
                {preview}
              </span>
              {canManage && (
                <button
                  onClick={() => onUnpin(pin.message_id)}
                  className="ml-1 text-gray-400 hover:text-red-500 transition"
                  title="Unpin"
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PinnedMessagesBar;