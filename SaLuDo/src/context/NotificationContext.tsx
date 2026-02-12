import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { notificationsApi } from '../utils/api';
import type { Notification } from '../types/notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  loadNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  playNotificationSound: boolean;
  setPlayNotificationSound: (play: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, accessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playNotificationSound, setPlayNotificationSound] = useState(
    localStorage.getItem('playNotificationSound') !== 'false'
  );

  // Handle new notification from WebSocket
  const handleNewNotification = useCallback((notification: Notification) => {
    console.log('[NotificationContext] New notification received:', notification);
    
    // Add to notifications list
    setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50
    
    // Update unread count
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }

    // Play sound if enabled
    if (playNotificationSound && !notification.isRead) {
      playSound();
    }

    // Show browser notification
    showBrowserNotification(notification);
  }, [playNotificationSound]);

  // Handle notification update from WebSocket
  const handleNotificationUpdated = useCallback((data: { notificationId: string; update: Partial<Notification> }) => {
    console.log('[NotificationContext] Notification updated:', data);
    
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === data.notificationId
          ? { ...n, ...data.update }
          : n
      )
    );

    // Update unread count if read status changed
    if (data.update.isRead !== undefined) {
      setUnreadCount((prev) => data.update.isRead ? Math.max(0, prev - 1) : prev + 1);
    }
  }, []);

  // WebSocket connection
  const { isConnected: socketConnected } = useWebSocket({
    userId: user?.userId || null,
    onNotification: handleNewNotification,
    onNotificationUpdated: handleNotificationUpdated,
    onConnect: () => {
      console.log('[NotificationContext] WebSocket connected');
    },
    onDisconnect: () => {
      console.log('[NotificationContext] WebSocket disconnected');
    },
    onError: (error) => {
      console.error('[NotificationContext] WebSocket error:', error);
    },
  });

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const [notifData, countData] = await Promise.all([
        notificationsApi.getNotifications(accessToken, { limit: 50 }),
        notificationsApi.getUnreadCount(accessToken),
      ]);

      setNotifications(notifData.notifications || []);
      setUnreadCount(countData.unreadCount || 0);
    } catch (err: any) {
      console.error('[NotificationContext] Failed to load notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!accessToken) return;

    try {
      await notificationsApi.markAsRead(accessToken, notificationId);
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('[NotificationContext] Failed to mark as read:', err);
      throw err;
    }
  }, [accessToken]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!accessToken) return;

    try {
      await notificationsApi.markAllAsRead(accessToken);
      
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('[NotificationContext] Failed to mark all as read:', err);
      throw err;
    }
  }, [accessToken]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!accessToken) return;

    try {
      await notificationsApi.deleteNotification(accessToken, notificationId);
      
      const notification = notifications.find((n) => n.notificationId === notificationId);
      
      setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));
      
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('[NotificationContext] Failed to delete notification:', err);
      throw err;
    }
  }, [accessToken, notifications]);

  // Play notification sound
  const playSound = useCallback(() => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch((err) => {
        console.warn('[NotificationContext] Failed to play sound:', err);
      });
    } catch (err) {
      console.warn('[NotificationContext] Sound not available:', err);
    }
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          tag: notification.notificationId,
          requireInteraction: notification.priority === 'HIGH' || notification.priority === 'CRITICAL',
        });
      } catch (err) {
        console.warn('[NotificationContext] Failed to show browser notification:', err);
      }
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('[NotificationContext] Notification permission:', permission);
      });
    }
  }, []);

  // Load notifications on mount
  useEffect(() => {
    if (accessToken) {
      loadNotifications();
    }
  }, [accessToken, loadNotifications]);

  // Save sound preference
  useEffect(() => {
    localStorage.setItem('playNotificationSound', String(playNotificationSound));
  }, [playNotificationSound]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected: socketConnected,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    playNotificationSound,
    setPlayNotificationSound,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
