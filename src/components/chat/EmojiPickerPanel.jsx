import React, { memo } from 'react';
import EmojiPicker from 'emoji-picker-react';

const EmojiPickerPanel = ({ onEmojiClick }) => (
  <div className="absolute bottom-14 left-0 z-30 rounded-3xl overflow-hidden shadow-xl ring-1 ring-slate-900/10">
    <EmojiPicker onEmojiClick={onEmojiClick} />
  </div>
);

export default memo(EmojiPickerPanel);
