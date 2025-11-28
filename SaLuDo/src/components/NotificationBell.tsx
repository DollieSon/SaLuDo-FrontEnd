import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { Notification } from "../types/notification";
import "./css/NotificationBell.css";

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications: allNotifications,
    unreadCount,
    isConnected,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update display notifications when dropdown opens or notifications change
  useEffect(() => {
    if (isOpen) {
      setDisplayNotifications(allNotifications.slice(0, 10));
    }
  }, [isOpen, allNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (err: any) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err: any) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.notificationId);
    }

    // Extract entityId and entityType from notification.data or metadata
    const data = (notification as any).data || notification.metadata;
    const entityId = data?.entityId;
    const entityType = data?.entityType;

    // Navigate based on notification data
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (entityId && entityType) {
      if (entityType === "CANDIDATE") {
        navigate(`/profile/${entityId}`);
      } else if (entityType === "JOB") {
        navigate(`/job/${entityId}`);
      }
    } else if ((notification as any).action?.url) {
      // Fallback to action.url if available
      navigate((notification as any).action.url);
    }

    setIsOpen(false);
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const getPriorityClass = (priority: string): string => {
    return `priority-${priority.toLowerCase()}`;
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        title={isConnected ? "Notifications (Live)" : "Notifications (Offline)"}
      >
        <svg
          className="bell-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        {isConnected && (
          <span className="connection-indicator connected" title="Live updates active"></span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <div>
              <h3>Notifications</h3>
              {!isConnected && (
                <span className="connection-status offline">Reconnecting...</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="btn-mark-all-read"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          {loading && <div className="notification-loading">Loading...</div>}

          {error && <div className="notification-error">{error}</div>}

          {!loading && !error && displayNotifications.length === 0 && (
            <div className="no-notifications">
              <svg
                className="no-notifications-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p>No notifications</p>
            </div>
          )}

          {!loading && !error && displayNotifications.length > 0 && (
            <div className="notification-list">
              {displayNotifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`notification-item ${
                    !notification.isRead ? "unread" : ""
                  } ${getPriorityClass(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
