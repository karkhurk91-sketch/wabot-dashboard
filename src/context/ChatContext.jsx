import React, { createContext, useContext, useMemo, useReducer, useRef } from 'react';
import useDarkMode from '../hooks/useDarkMode';
import { sortMessages, isTempMessage, mergeMessageUpdate } from '../utils/messageUtils';

const ChatContext = createContext();

const initialState = {
  conversations: [],
  selectedConversation: null,
  messages: [],
  notes: [],
  tags: [],
  loading: false,
  messagesLoading: false,
  error: null,
  typing: false,
  darkMode: false,
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_MESSAGES_LOADING':
      return { ...state, messagesLoading: action.payload };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'UPDATE_CONVERSATION_META':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.id ? { ...conv, ...action.payload.updates } : conv
        ),
        selectedConversation: state.selectedConversation?.id === action.payload.id
          ? { ...state.selectedConversation, ...action.payload.updates }
          : state.selectedConversation,
      };
    case 'SET_SELECTED_CONVERSATION':
      return { ...state, selectedConversation: action.payload };
    case 'SET_MESSAGES':
      // Sort messages by sort_timestamp (or created_at as fallback) - oldest first
      return { ...state, messages: sortMessages(action.payload) };
    case 'APPEND_MESSAGES':
      // Remove duplicates and sort the entire list
      const existingIds = new Set(state.messages.map(msg => msg.id));
      const uniqueNewMessages = action.payload.filter(msg => !existingIds.has(msg.id));
      const combined = [...state.messages, ...uniqueNewMessages];
      return { ...state, messages: sortMessages(combined) };
    case 'NEW_MESSAGE': {
      // Handle new incoming message
      const newMsg = action.payload;
      let updatedMessages = [...state.messages];
      
      // Replace temp messages when confirmed message arrives
      const tempMsgIndex = updatedMessages.findIndex(msg => {
        if (!isTempMessage(msg)) return false;
        if (msg.whatsapp_message_id && msg.whatsapp_message_id === newMsg.whatsapp_message_id) {
          return true;
        }
        if (newMsg.direction === 'outbound' && msg.direction === 'outbound' && msg.status === 'sending') {
          if (msg.content && newMsg.content && msg.content === newMsg.content) {
            return true;
          }
          if (msg.message_type && msg.message_type === newMsg.message_type && msg.media_file_name && msg.media_file_name === newMsg.media_file_name) {
            return true;
          }
        }
        return false;
      });

      if (tempMsgIndex !== -1) {
        updatedMessages[tempMsgIndex] = mergeMessageUpdate(updatedMessages[tempMsgIndex], newMsg);
        return { ...state, messages: sortMessages(updatedMessages) };
      }

      // Check if message already exists by id
      const existingIndex = updatedMessages.findIndex(msg => msg.id === newMsg.id);
      if (existingIndex !== -1) {
        updatedMessages[existingIndex] = newMsg;
      } else {
        updatedMessages.push(newMsg);
      }
      
      return { ...state, messages: sortMessages(updatedMessages) };
    }
    case 'UPDATE_MESSAGE': {
      // Handle message status update (sent, delivered, read, etc.)
      const { messageId, ...updates } = action.payload;
      const updatedMessages = state.messages.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      return { ...state, messages: updatedMessages };
    }
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TYPING':
      return { ...state, typing: action.payload };
    
    // ✅ NEW: Update conversation mode in both conversations list and selected conversation
    case 'UPDATE_CONVERSATION_MODE':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id
            ? { ...conv, reply_mode: action.payload.reply_mode }
            : conv
        ),
        selectedConversation: state.selectedConversation?.id === action.payload.id
          ? { ...state.selectedConversation, reply_mode: action.payload.reply_mode }
          : state.selectedConversation,
      };
    
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const socketRef = useRef(null);
  const darkMode = useDarkMode();

  const value = useMemo(
    () => ({ state, dispatch, socketRef, darkMode }),
    [state, darkMode]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};