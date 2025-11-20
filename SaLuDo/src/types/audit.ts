export type AuditEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "LOGOUT"
  | "TOKEN_REFRESH"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "USER_ACTIVATED"
  | "USER_DEACTIVATED"
  | "PASSWORD_CHANGED"
  | "PASSWORD_RESET"
  | "PASSWORD_RESET_REQUESTED"
  | "FAILED_LOGIN_ATTEMPT"
  | "ACCOUNT_LOCKED"
  | "SUSPICIOUS_ACTIVITY"
  | "RATE_LIMIT_EXCEEDED"
  | "UNAUTHORIZED_ACCESS_ATTEMPT"
  | "PROFILE_VIEWED"
  | "SENSITIVE_DATA_ACCESSED"
  | "FILE_UPLOADED"
  | "FILE_DOWNLOADED"
  | "SYSTEM_ERROR"
  | "CONFIG_CHANGED"
  | "BACKUP_CREATED";

export type AuditSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AuditLogDetails {
  action: string;
  resource?: string;
  resourceId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogEntry {
  _id: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  targetUserId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  details: AuditLogDetails;
  success: boolean;
  duration?: number;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
}

export interface AuditLogResponse {
  success: boolean;
  data: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface SecurityAlert {
  id: string;
  type: AuditEventType;
  severity: AuditSeverity;
  message: string;
  timestamp: string;
  userId?: string;
  ipAddress?: string;
  details: AuditLogDetails;
}

export interface AuditStatistics {
  totalEvents: number;
  securityEvents: number;
  failedAttempts: number;
  uniqueUsers: number;
  uniqueIPs: number;
  eventsByDay: Array<{ date: string; count: number }>;
}
