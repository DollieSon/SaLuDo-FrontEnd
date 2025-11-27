import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Notification } from '../types/notification';
import './css/NotificationToast.css';

interface ToastNotification extends Notification {
  id: string;
  show: boolean;
}

export const NotificationToast: React.FC = () => {
  const { notifications } = useNotifications();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    // Get the latest notification
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Check if we already have this notification as a toast
      const exists = toasts.some(t => t.notificationId === latestNotification.notificationId);
      
      if (!exists && !latestNotification.isRead) {
        // Add new toast
        const newToast: ToastNotification = {
          ...latestNotification,
          id: latestNotification.notificationId,
          show: true,
        };
        
        setToasts(prev => [...prev, newToast]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setToasts(prev => 
            prev.map(t => 
              t.id === newToast.id ? { ...t, show: false } : t
            )
          );
          
          // Remove from DOM after animation
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== newToast.id));
          }, 300);
        }, 5000);
      }
    }
  }, [notifications]);

  const dismissToast = (id: string) => {
    setToasts(prev => 
      prev.map(t => 
        t.id === id ? { ...t, show: false } : t
      )
    );
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  };

  const getPriorityClass = (priority: string): string => {
    return `toast-${priority.toLowerCase()}`;
  };

  if (toasts.length === 0) return null;

  return (
    <div className="notification-toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`notification-toast ${toast.show ? 'show' : ''} ${getPriorityClass(toast.priority)}`}
        >
          <div className="toast-icon">
            {(toast.priority === 'CRITICAL' || toast.priority === 'HIGH') ? (
              <svg
                className="icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ) : (
              <svg
                className="icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
          
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          
          <button
            className="toast-close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss"
          >
            <svg
              className="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};
