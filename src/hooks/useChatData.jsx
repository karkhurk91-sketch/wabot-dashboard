import { useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import * as chatApi from '../services/chatApi';

export const useChatData = () => {
  const { state, dispatch } = useChat();

  const loadConversations = useCallback(async (filterType = 'all', searchQuery = '', searchMode = 'name_phone') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      let response;
      if (searchQuery?.trim()) {
        response = await chatApi.searchConversations(searchQuery.trim(), searchMode);
      } else {
        response = await chatApi.fetchConversations(filterType);
      }
      const conversations = Array.isArray(response.data) ? response.data : [];
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
      return conversations;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error?.response?.data?.detail || 'Unable to load conversations' });
      return [];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const syncSelectedConversation = useCallback(
    (conversations, conversationId) => {
      const updated = conversations.find((c) => c.id === conversationId);
      if (updated) dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: updated });
    },
    [dispatch]
  );

  const loadNotes = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      const response = await chatApi.fetchConversationNotes(conversationId);
      dispatch({ type: 'SET_NOTES', payload: Array.isArray(response.data) ? response.data : [] });
    } catch (error) {
      console.error('Unable to load notes', error);
      dispatch({ type: 'SET_NOTES', payload: [] });
    }
  }, [dispatch]);

  const loadTags = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      const response = await chatApi.fetchConversationTags(conversationId);
      dispatch({ type: 'SET_TAGS', payload: Array.isArray(response.data) ? response.data : [] });
    } catch (error) {
      console.error('Unable to load tags', error);
      dispatch({ type: 'SET_TAGS', payload: [] });
    }
  }, [dispatch]);

  const loadMessages = useCallback(
    async (conversationId, reset = false, offset = 0) => {
      if (!conversationId) return 0;
      dispatch({ type: 'SET_MESSAGES_LOADING', payload: true });
      try {
        const limit = 50;
        const actualOffset = reset ? 0 : offset;
        const response = await chatApi.fetchConversationMessages(conversationId, limit, actualOffset);
        const messages = Array.isArray(response.data) ? response.data.filter(m => m && typeof m === 'object') : [];
        if (reset) {
          dispatch({ type: 'SET_MESSAGES', payload: messages });
        } else {
          // Prepend older messages (so they appear before existing messages)
          dispatch({ type: 'PREPEND_MESSAGES', payload: messages });
        }
        return messages.length;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error?.response?.data?.detail || 'Unable to load messages',
        });
        return 0;
      } finally {
        dispatch({ type: 'SET_MESSAGES_LOADING', payload: false });
      }
    },
    [dispatch]
  );

  const selectConversation = useCallback(
    async (conversation) => {
      dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: conversation });
      dispatch({ type: 'SET_MESSAGES', payload: [] });
      const count = await loadMessages(conversation.id, true);
      await loadNotes(conversation.id);
      await loadTags(conversation.id);
      return count;
    },
    [dispatch, loadMessages, loadNotes, loadTags]
  );

  const sendText = useCallback(
    async (conversationId, text, senderType, replyToId = null) => {
      if (!conversationId || !text) return null;
      try {
        const response = await chatApi.sendTextMessage(conversationId, text, senderType, replyToId);
        // Reload messages to show the new message (WebSocket will also update, but this ensures freshness)
        await loadMessages(conversationId, true);
        const list = await loadConversations();
        syncSelectedConversation(list, conversationId);
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error?.response?.data?.detail || 'Unable to send message' });
        return null;
      }
    },
    [dispatch, loadConversations, loadMessages, syncSelectedConversation]
  );

  const sendMedia = useCallback(
    async (conversationId, formData, onUploadProgress, replyToId = null) => {
      console.log('useChatData - sendMedia called', { conversationId, formData: !!formData, replyToId });
      if (!conversationId || !formData) {
        console.error('useChatData - sendMedia missing required params', { conversationId, formData });
        return null;
      }
      try {
        if (replyToId) {
          formData.append('reply_to_id', replyToId);
        }
        console.log('useChatData - calling chatApi.sendMediaMessage...');
        const response = await chatApi.sendMediaMessage(conversationId, formData, onUploadProgress, replyToId);
        console.log('useChatData - sendMediaMessage response:', response);
        await loadMessages(conversationId, true);
        const list = await loadConversations();
        syncSelectedConversation(list, conversationId);
        return response.data;
      } catch (error) {
        console.error('useChatData - sendMedia failed:', error);
        dispatch({ type: 'SET_ERROR', payload: error?.response?.data?.detail || 'Unable to send media' });
        return null;
      }
    },
    [dispatch, loadConversations, loadMessages, syncSelectedConversation]
  );

  const addNote = useCallback(
    async (conversationId, noteText) => {
      if (!conversationId || !noteText?.trim()) return false;
      try {
        await chatApi.addConversationNote(conversationId, noteText.trim());
        await loadNotes(conversationId);
        return true;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error?.response?.data?.detail || 'Unable to add note',
        });
        return false;
      }
    },
    [dispatch, loadNotes]
  );

  const attachTag = useCallback(
    async (conversationId, tagId) => {
      if (!conversationId || !tagId) return false;
      try {
        await chatApi.attachConversationTag(conversationId, tagId);
        await loadTags(conversationId);
        const list = await loadConversations();
        syncSelectedConversation(list, conversationId);
        return true;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error?.response?.data?.detail || 'Unable to add tag',
        });
        return false;
      }
    },
    [dispatch, loadConversations, loadTags, syncSelectedConversation]
  );

  const detachTag = useCallback(
    async (conversationId, tagId) => {
      if (!conversationId || !tagId) return false;
      try {
        await chatApi.detachConversationTag(conversationId, tagId);
        await loadTags(conversationId);
        const list = await loadConversations();
        syncSelectedConversation(list, conversationId);
        return true;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error?.response?.data?.detail || 'Unable to remove tag',
        });
        return false;
      }
    },
    [dispatch, loadConversations, loadTags, syncSelectedConversation]
  );

  const createOrgTag = useCallback(
    async (name, color) => {
      const trimmed = name?.trim();
      if (!trimmed) return null;
      try {
        const res = await chatApi.createOrgTag(trimmed, color || '#4F46E5');
        return res.data;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error?.response?.data?.detail || 'Unable to create tag',
        });
        return null;
      }
    },
    [dispatch]
  );

  const assignAgent = useCallback(
    async (conversationId, agentId) => {
      if (!conversationId || !agentId) return false;
      try {
        await chatApi.assignAgent(conversationId, agentId);
        const list = await loadConversations();
        syncSelectedConversation(list, conversationId);
        return true;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error?.response?.data?.detail || 'Unable to assign agent',
        });
        return false;
      }
    },
    [dispatch, loadConversations, syncSelectedConversation]
  );

  const unassignAgent = useCallback(
    async (conversationId) => {
      if (!conversationId) return false;
      try {
        await chatApi.unassignAgent(conversationId);
        const list = await loadConversations();
        syncSelectedConversation(list, conversationId);
        return true;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error?.response?.data?.detail || 'Unable to unassign agent',
        });
        return false;
      }
    },
    [dispatch, loadConversations, syncSelectedConversation]
  );

  const toggleMode = useCallback(
    async (conversationId, mode) => {
      if (!conversationId || !mode) return false;
      try {
        await chatApi.toggleConversationMode(conversationId, mode);
        dispatch({
          type: 'UPDATE_CONVERSATION_MODE',
          payload: { id: conversationId, reply_mode: mode }
        });
        const list = await loadConversations();
        syncSelectedConversation(list, conversationId);
        return true;
      } catch (error) {
        console.error('Toggle mode error:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error?.response?.data?.detail || 'Unable to change conversation mode',
        });
        return false;
      }
    },
    [dispatch, loadConversations, syncSelectedConversation]
  );

  const createConversation = useCallback(
    async (phoneNumber) => {
      if (!phoneNumber?.trim()) return null;
      try {
        const response = await chatApi.createConversation(phoneNumber.trim());
        const newConv = response.data;
        await loadConversations();
        return newConv;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error?.response?.data?.detail || 'Unable to create conversation',
        });
        return null;
      }
    },
    [dispatch, loadConversations]
  );

  const searchConversations = useCallback(
    async (searchTerm, searchMode = 'name_phone') => {
      if (!searchTerm?.trim()) return [];
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await chatApi.searchConversations(searchTerm.trim(), searchMode);
        const conversations = Array.isArray(response.data) ? response.data : [];
        return conversations;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error?.response?.data?.detail || 'Unable to search conversations',
        });
        return [];
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [dispatch]
  );

  return {
    ...state,
    loadConversations,
    loadMessages,
    selectConversation,
    sendText,
    sendMedia,
    loadNotes,
    loadTags,
    addNote,
    attachTag,
    detachTag,
    createOrgTag,
    assignAgent,
    unassignAgent,
    toggleMode,
    createConversation,
    searchConversations,
  };
};