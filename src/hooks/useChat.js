/**
 * Chat hook for message management and conversation logic
 */

import { useState, useCallback, useEffect } from 'react';
import axiosInstance from '../services/api';

export const useChat = (conversationId, organizationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Initial load
  useEffect(() => {
    loadMessages(1);
  }, [conversationId, organizationId]);

  const loadMessages = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/conversations/${conversationId}/messages`,
        {
          params: {
            page: pageNum,
            limit: 50,
            sort: 'asc'
          },
          headers: {
            'X-Organization-ID': organizationId
          }
        }
      );

      if (pageNum === 1) {
        setMessages(response.data.data);
      } else {
        setMessages(prev => [...response.data.data, ...prev]);
      }

      setHasMore(response.data.has_more);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, organizationId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadMessages(page + 1);
  }, [page, hasMore, loading, loadMessages]);

  const sendMessage = useCallback(async (content, messageType = 'text', media = null) => {
    try {
      const payload = {
        content,
        message_type: messageType
      };

      if (media) {
        payload.media_id = media.id;
      }

      const response = await axiosInstance.post(
        `/conversations/${conversationId}/messages`,
        payload,
        {
          headers: {
            'X-Organization-ID': organizationId
          }
        }
      );

      // Optimistic update
      setMessages(prev => [...prev, response.data.data]);
      
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to send message';
      setError(errorMessage);
      throw err;
    }
  }, [conversationId, organizationId]);

  const updateMessage = useCallback(async (messageId, updates) => {
    try {
      const response = await axiosInstance.put(
        `/messages/${messageId}`,
        updates,
        {
          headers: {
            'X-Organization-ID': organizationId
          }
        }
      );

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, ...response.data.data } : msg
        )
      );

      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update message');
      throw err;
    }
  }, [organizationId]);

  const deleteMessage = useCallback(async (messageId) => {
    try {
      await axiosInstance.delete(
        `/messages/${messageId}`,
        {
          headers: {
            'X-Organization-ID': organizationId
          }
        }
      );

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete message');
      throw err;
    }
  }, [organizationId]);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMore,
    sendMessage,
    updateMessage,
    deleteMessage,
    setMessages,
    setError
  };
};

export default useChat;
