import { useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import * as chatApi from '../services/chatApi';

export const useChatData = () => {
  const { state, dispatch } = useChat();

  const loadConversations = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await chatApi.fetchConversations();
      dispatch({ type: 'SET_CONVERSATIONS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error?.response?.data?.detail || 'Unable to load conversations' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const loadMessages = useCallback(async (conversationId, reset = false) => {
    if (!conversationId) return 0;
    dispatch({ type: 'SET_MESSAGES_LOADING', payload: true });
    try {
      const offset = reset ? 0 : state.messages.length;
      const response = await chatApi.fetchConversationMessages(conversationId, 50, offset);
      if (reset) {
        dispatch({ type: 'SET_MESSAGES', payload: response.data });
      } else {
        dispatch({ type: 'APPEND_MESSAGES', payload: response.data });
      }
      return response.data.length;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error?.response?.data?.detail || 'Unable to load messages' });
      return 0;
    } finally {
      dispatch({ type: 'SET_MESSAGES_LOADING', payload: false });
    }
  }, [dispatch, state.messages.length]);

  const selectConversation = useCallback(async (conversation) => {
    dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: conversation });
    await loadMessages(conversation.id, true);
    await loadNotes(conversation.id);
    await loadTags(conversation.id);
  }, [dispatch, loadMessages]);

  const sendText = useCallback(async (conversationId, text, senderType) => {
    if (!conversationId || !text) return null;
    try {
      const response = await chatApi.sendTextMessage(conversationId, text, senderType);
      await loadMessages(conversationId, true);
      await loadConversations();
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error?.response?.data?.detail || 'Unable to send message' });
      return null;
    }
  }, [dispatch, loadConversations, loadMessages]);

  const sendMedia = useCallback(async (conversationId, formData, onUploadProgress) => {
    if (!conversationId || !formData) return null;
    try {
      const response = await chatApi.sendMediaMessage(conversationId, formData, onUploadProgress);
      await loadMessages(conversationId, true);
      await loadConversations();
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error?.response?.data?.detail || 'Unable to send media' });
      return null;
    }
  }, [dispatch, loadConversations, loadMessages]);

  const loadNotes = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      const response = await chatApi.fetchConversationNotes(conversationId);
      dispatch({ type: 'SET_NOTES', payload: response.data });
    } catch (error) {
      console.error('Unable to load notes', error);
    }
  }, [dispatch]);

  const loadTags = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      const response = await chatApi.fetchConversationTags(conversationId);
      dispatch({ type: 'SET_TAGS', payload: response.data });
    } catch (error) {
      console.error('Unable to load tags', error);
    }
  }, [dispatch]);

  return {
    ...state,
    loadConversations,
    loadMessages,
    selectConversation,
    sendText,
    sendMedia,
    loadNotes,
    loadTags,
  };
};
