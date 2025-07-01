import React, { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner, ErrorMessage } from '../common';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'candidate_update' | 'approval_request' | 'interview_reminder';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'candidate' | 'workflow' | 'approval' | 'interview' | 'reminder';
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  metadata?: {
    candidateId?: string;
    candidateName?: string;
    jobId?: string;
    jobTitle?: string;
    requestId?: string;
    interviewId?: string;
    actionUrl?: string;
    [key: string]: any;
  };
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: 'navigate' | 'api_call' | 'dismiss';
  url?: string;
  apiEndpoint?: string;
  apiMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  apiPayload?: any;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  browserNotifications: boolean;
  categories: {
    candidate: boolean;
    workflow: boolean;
    approval: boolean;
    interview: boolean;
    system: boolean;
  };
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

interface NotificationSystemProps {
  onNotificationAction?: (notificationId: string, action: NotificationAction) => Promise<void>;
  onMarkAsRead?: (notificationId: string) => Promise<void>;
  onMarkAllAsRead?: () => Promise<void>;
  onDeleteNotification?: (notificationId: string) => Promise<void>;
  onUpdateSettings?: (settings: NotificationSettings) => Promise<void>;
  currentUserId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  onNotificationAction,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onUpdateSettings,
  currentUserId = 'user123',
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [filterCategory, setFilterCategory] = useState<Notification['category'] | 'all'>('all');
  const [showToast, setShowToast] = useState<Notification | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      // Mock data - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: 'notif1',
          type: 'candidate_update',
          title: 'New Candidate Application',
          message: 'John Doe has applied for Senior Software Engineer position',
          isRead: false,
          priority: 'medium',
          category: 'candidate',
          createdAt: new Date(Date.now() - 3600000), // 1 hour ago
          metadata: {
            candidateId: 'cand1',
            candidateName: 'John Doe',
            jobId: 'job1',
            jobTitle: 'Senior Software Engineer',
            actionUrl: '/candidates/cand1'
          },
          actions: [
            {
              id: 'view',
              label: 'View Profile',
              type: 'primary',
              action: 'navigate',
              url: '/candidates/cand1'
            },
            {
              id: 'review',
              label: 'Quick Review',
              type: 'secondary',
              action: 'navigate',
              url: '/candidates/cand1/review'
            }
          ]
        },
        {
          id: 'notif2',
          type: 'approval_request',
          title: 'Approval Required',
          message: 'Hire approval needed for Alice Johnson - Product Manager role',
          isRead: false,
          priority: 'high',
          category: 'approval',
          createdAt: new Date(Date.now() - 7200000), // 2 hours ago
          metadata: {
            candidateId: 'cand2',
            candidateName: 'Alice Johnson',
            jobId: 'job2',
            jobTitle: 'Product Manager',
            requestId: 'req1',
            actionUrl: '/approvals/req1'
          },
          actions: [
            {
              id: 'approve',
              label: 'Approve',
              type: 'primary',
              action: 'api_call',
              apiEndpoint: '/api/approvals/req1/approve',
              apiMethod: 'POST'
            },
            {
              id: 'review',
              label: 'Review',
              type: 'secondary',
              action: 'navigate',
              url: '/approvals/req1'
            }
          ]
        },
        {
          id: 'notif3',
          type: 'interview_reminder',
          title: 'Interview Tomorrow',
          message: 'Technical interview with Mike Smith scheduled for 2:00 PM',
          isRead: true,
          priority: 'high',
          category: 'interview',
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          readAt: new Date(Date.now() - 3600000),
          metadata: {
            candidateId: 'cand3',
            candidateName: 'Mike Smith',
            interviewId: 'int1',
            actionUrl: '/interviews/int1'
          },
          actions: [
            {
              id: 'view',
              label: 'View Details',
              type: 'primary',
              action: 'navigate',
              url: '/interviews/int1'
            }
          ]
        },
        {
          id: 'notif4',
          type: 'success',
          title: 'Bulk Action Completed',
          message: '15 candidates successfully updated to "Qualified" status',
          isRead: false,
          priority: 'low',
          category: 'workflow',
          createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
          metadata: {
            actionType: 'bulk_status_change',
            count: 15
          }
        },
        {
          id: 'notif5',
          type: 'warning',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight from 11 PM to 1 AM EST',
          isRead: true,
          priority: 'medium',
          category: 'system',
          createdAt: new Date(Date.now() - 10800000), // 3 hours ago
          readAt: new Date(Date.now() - 7200000),
          expiresAt: new Date(Date.now() + 86400000) // expires in 1 day
        }
      ];

      const mockSettings: NotificationSettings = {
        emailNotifications: true,
        pushNotifications: true,
        browserNotifications: false,
        categories: {
          candidate: true,
          workflow: true,
          approval: true,
          interview: true,
          system: false
        },
        frequency: 'instant',
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00'
        }
      };

      setNotifications(mockNotifications);
      setSettings(mockSettings);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(loadNotifications, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadNotifications]);

  // Request browser notification permission
  useEffect(() => {
    if (settings?.browserNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [settings?.browserNotifications]);

  // Show browser notifications for new unread notifications
  useEffect(() => {
    if (settings?.browserNotifications && Notification.permission === 'granted') {
      const newNotifications = notifications.filter(n => 
        !n.isRead && 
        (Date.now() - n.createdAt.getTime()) < refreshInterval
      );
      
      newNotifications.forEach(notification => {
        if (notification.priority === 'high' || notification.priority === 'urgent') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/notification-icon.png',
            tag: notification.id
          });
        }
      });
    }
  }, [notifications, settings?.browserNotifications, refreshInterval]);

  const handleNotificationAction = async (notificationId: string, action: NotificationAction) => {
    try {
      if (action.action === 'navigate' && action.url) {
        // In a real app, use router navigation
        console.log('Navigate to:', action.url);
      } else if (action.action === 'api_call' && action.apiEndpoint) {
        await onNotificationAction?.(notificationId, action);
      } else if (action.action === 'dismiss') {
        await handleDeleteNotification(notificationId);
      }
      
      // Mark as read when action is taken
      if (!notifications.find(n => n.id === notificationId)?.isRead) {
        await handleMarkAsRead(notificationId);
      }
    } catch (err) {
      setError('Failed to perform action');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await onMarkAsRead?.(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
      ));
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await onMarkAllAsRead?.();
      setNotifications(prev => prev.map(n => 
        ({ ...n, isRead: true, readAt: new Date() })
      ));
    } catch (err) {
      setError('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await onDeleteNotification?.(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      setError('Failed to delete notification');
    }
  };

  const handleUpdateSettings = async (newSettings: NotificationSettings) => {
    try {
      await onUpdateSettings?.(newSettings);
      setSettings(newSettings);
    } catch (err) {
      setError('Failed to update settings');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread' && notification.isRead) return false;
    if (filterCategory !== 'all' && notification.category !== filterCategory) return false;
    if (notification.expiresAt && notification.expiresAt < new Date()) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']): string => {
    switch (type) {
      case 'candidate_update': return '👤';
      case 'approval_request': return '✋';
      case 'interview_reminder': return '📅';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info':
      default: return 'ℹ️';
    }
  };

  const getPriorityColor = (priority: Notification['priority']): string => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="notification-system">
      <div className="notification-header">
        <div>
          <h2>
            Notifications 
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </h2>
          <p>Stay updated on candidate activities and workflow events</p>
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button 
              className="btn btn-secondary"
              onClick={handleMarkAllAsRead}
            >
              Mark All Read
            </button>
          )}
          <button 
            className="btn btn-primary"
            onClick={() => loadNotifications()}
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <div className="notification-tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`tab ${activeTab === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveTab('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab !== 'settings' && (
        <div className="notification-filters">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Notification['category'] | 'all')}
          >
            <option value="all">All Categories</option>
            <option value="candidate">Candidates</option>
            <option value="workflow">Workflow</option>
            <option value="approval">Approvals</option>
            <option value="interview">Interviews</option>
            <option value="system">System</option>
          </select>
        </div>
      )}

      {activeTab === 'settings' ? (
        settings && (
          <NotificationSettings
            settings={settings}
            onUpdate={handleUpdateSettings}
          />
        )
      ) : (
        <div className="notification-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <p>No notifications {activeTab === 'unread' ? 'to read' : 'found'}</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''} ${getPriorityColor(notification.priority)}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h4>{notification.title}</h4>
                    <div className="notification-meta">
                      <span className="time-ago">{formatTimeAgo(notification.createdAt)}</span>
                      {notification.priority === 'urgent' && (
                        <span className="priority-badge urgent">URGENT</span>
                      )}
                      {notification.priority === 'high' && (
                        <span className="priority-badge high">HIGH</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="notification-message">{notification.message}</p>
                  
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="notification-actions">
                      {notification.actions.map(action => (
                        <button
                          key={action.id}
                          className={`btn btn-${action.type} btn-sm`}
                          onClick={() => handleNotificationAction(notification.id, action)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="notification-controls">
                  {!notification.isRead && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDeleteNotification(notification.id)}
                    title="Delete notification"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showToast && (
        <NotificationToast
          notification={showToast}
          onClose={() => setShowToast(null)}
          onAction={(action) => {
            handleNotificationAction(showToast.id, action);
            setShowToast(null);
          }}
        />
      )}
    </div>
  );
};

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onUpdate: (settings: NotificationSettings) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onUpdate
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onUpdate(localSettings);
  };

  return (
    <div className="notification-settings">
      <div className="settings-section">
        <h3>Delivery Methods</h3>
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={localSettings.emailNotifications}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                emailNotifications: e.target.checked
              }))}
            />
            Email notifications
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={localSettings.pushNotifications}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                pushNotifications: e.target.checked
              }))}
            />
            Push notifications
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={localSettings.browserNotifications}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                browserNotifications: e.target.checked
              }))}
            />
            Browser notifications
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Categories</h3>
        <div className="setting-group">
          {Object.entries(localSettings.categories).map(([category, enabled]) => (
            <label key={category} className="checkbox-label">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  categories: {
                    ...prev.categories,
                    [category]: e.target.checked
                  }
                }))}
              />
              {category.charAt(0).toUpperCase() + category.slice(1)} notifications
            </label>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>Frequency</h3>
        <div className="setting-group">
          <select
            value={localSettings.frequency}
            onChange={(e) => setLocalSettings(prev => ({
              ...prev,
              frequency: e.target.value as NotificationSettings['frequency']
            }))}
          >
            <option value="instant">Instant</option>
            <option value="hourly">Hourly digest</option>
            <option value="daily">Daily digest</option>
            <option value="weekly">Weekly digest</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>Quiet Hours</h3>
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={localSettings.quietHours.enabled}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                quietHours: {
                  ...prev.quietHours,
                  enabled: e.target.checked
                }
              }))}
            />
            Enable quiet hours
          </label>
          {localSettings.quietHours.enabled && (
            <div className="quiet-hours-settings">
              <div className="time-inputs">
                <label>
                  From:
                  <input
                    type="time"
                    value={localSettings.quietHours.startTime}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      quietHours: {
                        ...prev.quietHours,
                        startTime: e.target.value
                      }
                    }))}
                  />
                </label>
                <label>
                  To:
                  <input
                    type="time"
                    value={localSettings.quietHours.endTime}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      quietHours: {
                        ...prev.quietHours,
                        endTime: e.target.value
                      }
                    }))}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
};

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  onAction: (action: NotificationAction) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onAction
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000); // Auto-close after 8 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification-toast ${notification.type} ${getPriorityColor(notification.priority)}`}>
      <div className="toast-icon">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="toast-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        {notification.actions && (
          <div className="toast-actions">
            {notification.actions.slice(0, 2).map(action => (
              <button
                key={action.id}
                className={`btn btn-${action.type} btn-sm`}
                onClick={() => onAction(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

// Helper functions (duplicated from component for reuse)
const getNotificationIcon = (type: Notification['type']): string => {
  switch (type) {
    case 'candidate_update': return '👤';
    case 'approval_request': return '✋';
    case 'interview_reminder': return '📅';
    case 'success': return '✅';
    case 'warning': return '⚠️';
    case 'error': return '❌';
    case 'info':
    default: return 'ℹ️';
  }
};

const getPriorityColor = (priority: Notification['priority']): string => {
  switch (priority) {
    case 'urgent': return 'priority-urgent';
    case 'high': return 'priority-high';
    case 'medium': return 'priority-medium';
    case 'low': return 'priority-low';
    default: return '';
  }
};

export default NotificationSystem;
