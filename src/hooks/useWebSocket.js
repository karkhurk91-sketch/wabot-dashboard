/**
 * WebSocket hook for real-time communication
 * Handles connection, reconnection, and event management
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

class WebSocketService {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.ws = null;
    this.listeners = {};
    this.reconnectCount = 0;
    this.messageQueue = [];
    this.isConnected = false;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectCount = 0;
        
        // Send auth
        this.send({
          type: 'auth',
          token: this.token
        });
        
        // Flush queued messages
        this.flushQueue();
        this.emit('connected');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.emit('disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectCount < MAX_RECONNECT_ATTEMPTS) {
      this.reconnectCount++;
      console.log(`Attempting to reconnect (${this.reconnectCount}/${MAX_RECONNECT_ATTEMPTS})...`);
      setTimeout(() => this.connect(), RECONNECT_INTERVAL);
    }
  }

  send(data) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // Queue message if not connected
      this.messageQueue.push(data);
    }
  }

  flushQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export const useWebSocket = (conversationId, token) => {
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState('offline');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const wsUrl = `${import.meta.env.VITE_WS_URL}/ws/conversations/${conversationId}`;
    
    wsRef.current = new WebSocketService(wsUrl, token);

    // Connection handlers
    wsRef.current.on('connected', () => {
      setConnectionStatus('connected');
      setOnlineStatus('online');
    });

    wsRef.current.on('disconnected', () => {
      setConnectionStatus('disconnected');
      setOnlineStatus('offline');
    });

    // Message handler
    wsRef.current.on('message', (data) => {
      // Emit custom event for components to listen to
      window.dispatchEvent(new CustomEvent('ws:message', { detail: data.data }));
    });

    // Typing indicator
    wsRef.current.on('typing', (data) => {
      setIsTyping(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to clear typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    });

    // Presence update
    wsRef.current.on('presence', (data) => {
      setOnlineStatus(data.data.status);
    });

    // Connect
    wsRef.current.connect();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [conversationId, token]);

  const sendMessage = useCallback((message) => {
    wsRef.current?.send({
      type: 'message',
      data: message
    });
  }, []);

  const sendTypingIndicator = useCallback(() => {
    wsRef.current?.send({
      type: 'typing',
      data: {}
    });
  }, []);

  return {
    isTyping,
    onlineStatus,
    connectionStatus,
    sendMessage,
    sendTypingIndicator,
    ws: wsRef.current
  };
};

export default WebSocketService;
