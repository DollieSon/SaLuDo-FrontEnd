export enum NotificationType {
  CANDIDATE_ASSIGNED = "CANDIDATE_ASSIGNED",
  CANDIDATE_STATUS_CHANGED = "CANDIDATE_STATUS_CHANGED",
  COMMENT_MENTION = "COMMENT_MENTION",
  COMMENT_REPLY = "COMMENT_REPLY",
  JOB_CREATED = "JOB_CREATED",
  JOB_UPDATED = "JOB_UPDATED",
  SYSTEM_ALERT = "SYSTEM_ALERT",
}

export enum NotificationCategory {
  CANDIDATE = "CANDIDATE",
  JOB = "JOB",
  COMMENT = "COMMENT",
  SYSTEM = "SYSTEM",
}

export enum NotificationPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  byCategory: {
    [key in NotificationCategory]?: number;
  };
  byPriority: {
    [key in NotificationPriority]?: number;
  };
}

export interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  defaultChannels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  categoryPreferences?: {
    [key in NotificationCategory]?: {
      inApp: boolean;
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}
