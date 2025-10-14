import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import {
  setWsConnected,
  setWsError,
  addMessage,
  updateMessage,
  removeMessage,
  setUserTyping,
  setUserOnlineStatus,
} from '../redux/slices/chatSlice';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export const useChatWebSocket = (roomId: string | null, isAuthenticated: boolean) => {
  const dispatch = useDispatch<AppDispatch>();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const isConnectingRef = useRef(false);

  // DEBUG: Log parâmetros de entrada
  console.log('🔍 WEBSOCKET DEBUG:', {
    roomId,
    isAuthenticated,
    wsRefCurrent: !!wsRef.current,
    isConnecting: isConnectingRef.current
  });

  const connect = useCallback(() => {
    console.log('🔍 CONNECT ATTEMPT:', { roomId, isAuthenticated, isConnecting: isConnectingRef.current });
    
    if (!roomId || !isAuthenticated || isConnectingRef.current) {
      console.log('❌ CONNECT BLOCKED:', { 
        noRoomId: !roomId, 
        notAuthenticated: !isAuthenticated, 
        isConnecting: isConnectingRef.current 
      });
      return;
    }

    // Evitar múltiplas conexões
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    isConnectingRef.current = true;

    try {
      // URL do WebSocket - ajustar conforme configuração
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = process.env.REACT_APP_WS_HOST || 'localhost:8000';
      const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/${roomId}/`;
      
      console.log(`🔌 Conectando WebSocket: ${wsUrl}`);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket conectado');
        dispatch(setWsConnected(true));
        reconnectAttempts.current = 0;
        isConnectingRef.current = false;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('❌ Erro ao processar mensagem WebSocket:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket desconectado', event.code, event.reason);
        dispatch(setWsConnected(false));
        isConnectingRef.current = false;

        // Tentar reconectar automaticamente (exceto se foi fechamento intencional)
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Backoff exponencial
          console.log(`🔄 Tentando reconectar em ${delay}ms (tentativa ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          dispatch(setWsError('Falha ao reconectar. Recarregue a página.'));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ Erro WebSocket:', error);
        dispatch(setWsError('Erro de conexão WebSocket'));
        isConnectingRef.current = false;
      };

    } catch (error) {
      console.error('❌ Erro ao criar WebSocket:', error);
      dispatch(setWsError('Erro ao conectar WebSocket'));
      isConnectingRef.current = false;
    }
  }, [roomId, isAuthenticated, dispatch]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Disconnecting intentionally');
      wsRef.current = null;
    }
    
    dispatch(setWsConnected(false));
    isConnectingRef.current = false;
    reconnectAttempts.current = 0;
  }, [dispatch]);

  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    if (!roomId) return;

    switch (data.type) {
      case 'new_message':
        dispatch(addMessage({ roomId, message: data.message }));
        break;

      case 'message_edited':
        dispatch(updateMessage({ roomId, message: data.message }));
        break;

      case 'message_deleted':
        dispatch(removeMessage({ roomId, messageId: data.message_id }));
        break;

      case 'user_typing':
        dispatch(setUserTyping({
          roomId,
          user_id: data.user_id,
          username: data.username,
          is_typing: data.is_typing,
        }));
        break;

      case 'user_status':
        dispatch(setUserOnlineStatus({
          roomId,
          user_id: data.user_id,
          username: data.username,
          status: data.status,
          timestamp: data.timestamp,
        }));
        break;

      case 'message_read':
        // Pode implementar indicadores de leitura se necessário
        console.log('📖 Mensagem lida:', data);
        break;

      case 'error':
        console.error('❌ Erro do servidor:', data.error);
        dispatch(setWsError(data.error));
        break;

      default:
        console.log('📢 Mensagem WebSocket não tratada:', data);
    }
  }, [roomId, dispatch]);

  // Funções para enviar mensagens via WebSocket
  const sendMessage = useCallback((content: string, messageType: string = 'text', replyTo?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'send_message',
        content,
        message_type: messageType,
        reply_to: replyTo,
      }));
    }
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping,
      }));
    }
  }, []);

  const markAsRead = useCallback((messageId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_as_read',
        message_id: messageId,
      }));
    }
  }, []);

  const editMessage = useCallback((messageId: string, content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'edit_message',
        message_id: messageId,
        content,
      }));
    }
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'delete_message',
        message_id: messageId,
      }));
    }
  }, []);

  // Conectar quando roomId ou autenticação mudar
  useEffect(() => {
    if (roomId && isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [roomId, isAuthenticated, connect, disconnect]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    sendTyping,
    markAsRead,
    editMessage,
    deleteMessage,
    reconnect: connect,
    disconnect,
  };
};
