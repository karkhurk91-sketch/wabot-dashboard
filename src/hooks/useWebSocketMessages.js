/**
 * WebSocket Message Handler Integration Guide
 * 
 * This file provides example code for integrating real-time message updates
 * via WebSocket into the frontend chat application.
 */

import { useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { createTempMessage, isTempMessage } from '../utils/messageUtils';

/**
 * Hook to setup WebSocket connection and handle message events
 * Usage: useWebSocketMessages(conversation?.id);
 */
export function useWebSocketMessages(conversationId) {
  const { dispatch, socketRef } = useChat();

  useEffect(() => {
    if (!conversationId) return;

    // Setup WebSocket connection
    const setupWebSocket = async () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          // Optionally subscribe to specific conversation
          ws.send(JSON.stringify({
            type: 'subscribe',
            conversation_id: conversationId
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle message creation/update events
            if (data.type === 'message_event') {
              handleMessageEvent(data, dispatch, conversationId);
            } else if (data.type === 'message_updated') {
              // Status update for existing message
              dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                  messageId: data.message_id,
                  status: data.status,
                  whatsapp_message_id: data.whatsapp_message_id
                }
              });
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          // Optionally attempt reconnect after delay
          setTimeout(setupWebSocket, 3000);
        };
      } catch (error) {
        console.error('Failed to setup WebSocket:', error);
      }
    };

    setupWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [conversationId, dispatch, socketRef]);
}

/**
 * Handle incoming message events from WebSocket
 */
function handleMessageEvent(data, dispatch, currentConversationId) {
  // Only process messages for the current conversation
  if (data.conversation_id !== currentConversationId) {
    return;
  }

  if (data.message_created || data.event_type === 'message_created') {
    // New message received
    const message = data.message || data.payload;
    dispatch({
      type: 'NEW_MESSAGE',
      payload: message
    });
  }
}

/**
 * Helper to send message with optimistic UI
 * Usage in MessageInput component:
 * 
 * const handleSend = async (text) => {
 *   const tempMsg = createTempMessage(text, 'outbound');
 *   dispatch({ type: 'NEW_MESSAGE', payload: tempMsg });
 *   
 *   try {
 *     await sendMessage(text);
 *   } catch (error) {
 *     // Remove temp message on error
 *     dispatch({
 *       type: 'UPDATE_MESSAGE',
 *       payload: { messageId: tempMsg.id, status: 'failed' }
 *     });
 *   }
 * };
 */
export function sendMessageWithOptimisticUI(conversationId, text, dispatch, apiSendMessage) {
  return async () => {
    // Create and show temporary message immediately
    const tempMsg = createTempMessage(text, 'outbound');
    dispatch({
      type: 'NEW_MESSAGE',
      payload: tempMsg
    });

    try {
      // Send to server
      const response = await apiSendMessage(conversationId, text);
      
      // When confirmed message arrives via WebSocket or HTTP response,
      // the ChatContext will replace the temp message automatically
      // (using whatsapp_message_id matching in NEW_MESSAGE reducer)
    } catch (error) {
      // Mark message as failed
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          messageId: tempMsg.id,
          status: 'failed'
        }
      });
      console.error('Failed to send message:', error);
    }
  };
}

/**
 * Example MessageInput component usage with optimistic UI
 * 
 * const MessageInput = ({ onSend, conversationId }) => {
 *   const { dispatch } = useChat();
 *   const [text, setText] = useState('');
 *   
 *   const handleSend = sendMessageWithOptimisticUI(
 *     conversationId,
 *     text,
 *     dispatch,
 *     async (convId, message) => {
 *       const response = await fetch(`/api/conversations/${convId}/messages`, {
 *         method: 'POST',
 *         headers: { 'Content-Type': 'application/json' },
 *         body: JSON.stringify({ text: message })
 *       });
 *       return response.json();
 *     }
 *   );
 *   
 *   return (
 *     <div>
 *       <input
 *         value={text}
 *         onChange={(e) => setText(e.target.value)}
 *         onKeyPress={(e) => {
 *           if (e.key === 'Enter') {
 *             handleSend();
 *             setText('');
 *           }
 *         }}
 *       />
 *       <button onClick={() => { handleSend(); setText(''); }}>Send</button>
 *     </div>
 *   );
 * };
 */
