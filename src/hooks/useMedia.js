/**
 * Media upload hook for handling file uploads
 */

import { useState, useCallback } from 'react';
import axiosInstance from '../services/api';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  document: ['application/pdf', 'application/msword']
};

export const useMedia = (organizationId) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const validateFile = useCallback((file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    // Check file type
    const mimeType = file.type;
    let fileCategory = null;

    for (const [category, types] of Object.entries(ALLOWED_TYPES)) {
      if (types.includes(mimeType)) {
        fileCategory = category;
        break;
      }
    }

    if (!fileCategory) {
      throw new Error(`File type ${mimeType} is not allowed`);
    }

    return fileCategory;
  }, []);

  const uploadMedia = useCallback(async (file, conversationId, onProgress = null) => {
    if (!conversationId) {
      throw new Error('Conversation ID is required to upload media');
    }

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Validate file
      validateFile(file);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload with progress
      const response = await axiosInstance.post(
        `/api/conversations/${conversationId}/media`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
            onProgress?.(percent);
          }
        }
      );

      return response.data;
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || err.message || 'Upload failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setUploading(false);
    }
  }, [organizationId, validateFile]);

  const downloadMedia = useCallback(async (mediaId) => {
    try {
      const response = await axiosInstance.get(
        `/media/${mediaId}/download`,
        {
          headers: {
            'X-Organization-ID': organizationId
          },
          responseType: 'blob'
        }
      );

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `media_${mediaId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || 'Download failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [organizationId]);

  return {
    uploadMedia,
    downloadMedia,
    uploading,
    progress,
    error,
    setError
  };
};

export default useMedia;
