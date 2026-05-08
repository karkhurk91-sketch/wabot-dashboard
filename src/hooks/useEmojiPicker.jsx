import { useCallback, useState } from 'react';

export default function useEmojiPicker() {
  const [open, setOpen] = useState(false);

  const toggleEmojiPicker = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const closeEmojiPicker = useCallback(() => {
    setOpen(false);
  }, []);

  const insertEmoji = useCallback((emoji, currentText, selectionStart, selectionEnd) => {
    const before = currentText.slice(0, selectionStart);
    const after = currentText.slice(selectionEnd);
    return `${before}${emoji}${after}`;
  }, []);

  return {
    open,
    toggleEmojiPicker,
    closeEmojiPicker,
    insertEmoji,
  };
}
