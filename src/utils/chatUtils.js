export const formatPhone = (phone) => {
  if (!phone) return '';
  if (phone.startsWith('91') && phone.length === 12) return `+${phone}`;
  if (phone.startsWith('0')) return `+91${phone.slice(1)}`;
  return phone;
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getStatusIcon = (status) => {
  if (status === 'sent') return '✓';
  if (status === 'delivered') return '✓✓';
  if (status === 'read') return '✓✓';
  return '';
};

export const isMediaMessage = (messageType) => messageType !== 'text';

export const getMediaLabel = (messageType) => {
  if (messageType === 'image') return 'Image';
  if (messageType === 'video') return 'Video';
  if (messageType === 'audio') return 'Audio';
  if (messageType === 'document') return 'Document';
  return 'Attachment';
};

export const getAllowedMimeTypes = () => ({
  'image/*': [],
  'video/*': [],
  'audio/*': [],
  'application/pdf': [],
  'application/msword': [],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
  'application/vnd.ms-excel': [],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
  'text/plain': [],
});

export const getMediaKind = (file) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'document';
};
