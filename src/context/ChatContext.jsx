import React, { createContext, useContext, useMemo, useReducer, useRef } from 'react';
import useDarkMode from '../hooks/useDarkMode';

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
    case 'SET_SELECTED_CONVERSATION':
      return { ...state, selectedConversation: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'APPEND_MESSAGES':
      return { ...state, messages: [...action.payload, ...state.messages] };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TYPING':
      return { ...state, typing: action.payload };
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
