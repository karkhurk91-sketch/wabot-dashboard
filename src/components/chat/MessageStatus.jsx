import React, { memo } from 'react';

const MessageStatus = ({ status }) => {
  const label = status === 'read' ? 'Read' : status === 'delivered' ? 'Delivered' : status === 'sent' ? 'Sent' : 'Pending';
  const tone = status === 'read' ? 'text-blue-500' : status === 'delivered' ? 'text-slate-600' : 'text-slate-400';
  return <span className={`text-xs ${tone}`}>{label}</span>;
};

export default memo(MessageStatus);
