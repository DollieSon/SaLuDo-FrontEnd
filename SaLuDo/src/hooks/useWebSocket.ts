import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification } from '../types/notification';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/', '') || 'http://localhost:3000';

interface WebSocketHookOptions {
  userId: string | null;
  onNotification?: (notification: Notification) => void;
  onNotificationUpdated?: (update: { notificationId: string; update: Partial<Notification> }) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export const useWebSocket = ({
  userId,
  onNotification,
  onNotificationUpdated,
  onConnect,
  onDisconnect,
  onError,
}: WebSocketHookOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (!userId || socketRef.current?.connected) return;

    console.log('[WebSocket] Connecting to:', SOCKET_URL);

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Connection established
    socket.on('connect', () => {
      console.log('[WebSocket] Connected with ID:', socket.id);
      
      // Authenticate with userId
      socket.emit('authenticate', userId);
      
      if (onConnect) onConnect();
    });

    // Authentication confirmed
    socket.on('authenticated', (data: { userId: string; socketId: string }) => {
      console.log('[WebSocket] Authenticated:', data);
    });

    // New notification received
    socket.on('notification:new', (notification: Notification) => {
      console.log('[WebSocket] New notification:', notification);
      
      if (onNotification) {
        onNotification(notification);
      }

      // Send read acknowledgment for in-app delivery
      socket.emit('notification:read', notification.notificationId);
    });

    // Notification updated
    socket.on('notification:updated', (data: { notificationId: string; update: Partial<Notification> }) => {
      console.log('[WebSocket] Notification updated:', data);
      
      if (onNotificationUpdated) {
        onNotificationUpdated(data);
      }
    });

    // Connection errors
    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      if (onError) onError(error);
    });

    // Disconnection
    socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      if (onDisconnect) onDisconnect();

      // Attempt to reconnect if not a manual disconnect
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect manually
        reconnectTimeoutRef.current = setTimeout(() => {
          socket.connect();
        }, 1000);
      }
    });

    // Reconnection attempt
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[WebSocket] Reconnect attempt:', attemptNumber);
    });

    // Reconnection success
    socket.on('reconnect', (attemptNumber) => {
      console.log('[WebSocket] Reconnected after', attemptNumber, 'attempts');
      socket.emit('authenticate', userId);
    });

    socketRef.current = socket;
  }, [userId, onNotification, onNotificationUpdated, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      console.log('[WebSocket] Disconnecting...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const sendTypingStart = useCallback((targetId: string) => {
    if (socketRef.current?.connected && userId) {
      socketRef.current.emit('typing:start', { userId, targetId });
    }
  }, [userId]);

  const sendTypingStop = useCallback((targetId: string) => {
    if (socketRef.current?.connected && userId) {
      socketRef.current.emit('typing:stop', { userId, targetId });
    }
  }, [userId]);

  // Connect when userId is available
  useEffect(() => {
    if (userId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return {
    isConnected: socketRef.current?.connected || false,
    socket: socketRef.current,
    sendTypingStart,
    sendTypingStop,
    reconnect: connect,
  };
};
