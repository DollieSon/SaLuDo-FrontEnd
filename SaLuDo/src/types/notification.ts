export enum NotificationType {
  CANDIDATE_APPLIED = "CANDIDATE_APPLIED",
  CANDIDATE_ASSIGNED = "CANDIDATE_ASSIGNED",
  CANDIDATE_STATUS_CHANGED = "CANDIDATE_STATUS_CHANGED",
  CANDIDATE_DOCUMENT_UPLOADED = "CANDIDATE_DOCUMENT_UPLOADED",
  CANDIDATE_AI_ANALYSIS_COMPLETE = "CANDIDATE_AI_ANALYSIS_COMPLETE",
  COMMENT_MENTION = "COMMENT_MENTION",
  COMMENT_REPLY = "COMMENT_REPLY",
  COMMENT_ON_CANDIDATE = "COMMENT_ON_CANDIDATE",
  JOB_POSTED = "JOB_POSTED",
  JOB_CREATED = "JOB_CREATED",
  JOB_UPDATED = "JOB_UPDATED",
  JOB_CLOSED = "JOB_CLOSED",
  INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED",
  INTERVIEW_REMINDER = "INTERVIEW_REMINDER",
  INTERVIEW_COMPLETED = "INTERVIEW_COMPLETED",
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  SECURITY_ALERT = "SECURITY_ALERT",
  SYSTEM_ALERT = "SYSTEM_ALERT",
  SYSTEM_UPDATE = "SYSTEM_UPDATE",
  ADMIN_ANNOUNCEMENT = "ADMIN_ANNOUNCEMENT",
}

export enum NotificationCategory {
  HR_ACTIVITIES = "HR_ACTIVITIES",
  SECURITY_ALERTS = "SECURITY_ALERTS",
  SYSTEM_UPDATES = "SYSTEM_UPDATES",
  COMMENTS = "COMMENTS",
  INTERVIEWS = "INTERVIEWS",
  ADMIN = "ADMIN",
}

export enum NotificationPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum NotificationChannel {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  PUSH = "PUSH",
  SMS = "SMS",
}

export enum DigestFrequency {
  IMMEDIATE = "IMMEDIATE",
  HOURLY = "HOURLY",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  NEVER = "NEVER",
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

export interface ChannelPreferences {
  inApp: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface CategoryPreferences {
  enabled: boolean;
  channels: NotificationChannel[];
  minPriority?: NotificationPriority;
}

export interface EmailDigestPreferences {
  enabled: boolean;
  frequency: DigestFrequency;
  time?: string;
  timezone?: string;
  includeCategories?: NotificationCategory[];
  minPriority?: NotificationPriority;
}

export interface QuietHoursPreferences {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
  allowCritical: boolean;
  daysOfWeek?: number[];
}

export interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  defaultChannels: ChannelPreferences;
  categories: {
    [NotificationCategory.HR_ACTIVITIES]: CategoryPreferences;
    [NotificationCategory.SECURITY_ALERTS]: CategoryPreferences;
    [NotificationCategory.SYSTEM_UPDATES]: CategoryPreferences;
    [NotificationCategory.COMMENTS]: CategoryPreferences;
    [NotificationCategory.INTERVIEWS]: CategoryPreferences;
    [NotificationCategory.ADMIN]: CategoryPreferences;
  };
  emailDigest: EmailDigestPreferences;
  quietHours: QuietHoursPreferences;
  batchNotifications: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  createdAt?: string;
  updatedAt?: string;
}
