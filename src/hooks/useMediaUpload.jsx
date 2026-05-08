import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatFileSize, getAllowedMimeTypes, getMediaKind } from '../utils/chatUtils';

const MAX_SIZES = {
  image: 5 * 1024 * 1024,
  video: 16 * 1024 * 1024,
  audio: 10 * 1024 * 1024,
  document: 100 * 1024 * 1024,
};

export default function useMediaUpload() {
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const validateFile = useCallback((file) => {
    if (!file) return { valid: false, error: 'No file selected' };
    const allowed = Object.keys(getAllowedMimeTypes());
    const supported = allowed.some((type) => file.type.startsWith(type.replace('/*', '')));
    if (!supported) {
      return { valid: false, error: 'Unsupported file type. Use image, video, audio, or document.' };
    }

    const mediaType = getMediaKind(file);
    if (file.size > MAX_SIZES[mediaType]) {
      return {
        valid: false,
        error: `File too large. Maximum ${formatFileSize(MAX_SIZES[mediaType])}.`,
      };
    }

    return { valid: true, error: null, mediaType };
  }, []);

  const handleFile = useCallback((file) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setAttachment(null);
      setError(validation.error);
      return;
    }

    setAttachment({
      file,
      mediaType: validation.mediaType,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'ready',
      error: null,
    });
    setError('');
  }, [validateFile]);

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length) {
      setError('Invalid file selected. Only allowed media types are supported.');
      return;
    }
    if (acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0]);
    }
  }, [handleFile]);

  const dropzone = useDropzone({
    onDrop,
    accept: getAllowedMimeTypes(),
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  });

  const clearAttachment = useCallback(() => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment(null);
    setError('');
  }, [attachment]);

  const updateProgress = useCallback((progress) => {
    setAttachment((current) => current ? { ...current, progress, status: 'uploading' } : current);
  }, []);

  const buildFormData = useCallback((caption) => {
    const formData = new FormData();
    if (attachment?.file) {
      formData.append('file', attachment.file);
      formData.append('caption', caption);
    }
    return formData;
  }, [attachment]);

  const hasAttachment = useMemo(() => Boolean(attachment?.file), [attachment]);

  return {
    attachment,
    error,
    uploading,
    setUploading,
    clearAttachment,
    buildFormData,
    updateProgress,
    hasAttachment,
    ...dropzone,
  };
}
