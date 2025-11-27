export type AuditEventType =
  // Authentication Events
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "LOGOUT"
  | "TOKEN_REFRESH"
  // User Management Events
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "USER_ACTIVATED"
  | "USER_DEACTIVATED"
  | "ROLE_CHANGED"
  // Password Events
  | "PASSWORD_CHANGED"
  | "PASSWORD_RESET"
  | "PASSWORD_RESET_REQUESTED"
  // Security Events
  | "FAILED_LOGIN_ATTEMPT"
  | "ACCOUNT_LOCKED"
  | "SUSPICIOUS_ACTIVITY"
  | "RATE_LIMIT_EXCEEDED"
  | "UNAUTHORIZED_ACCESS_ATTEMPT"
  | "PERMISSION_GRANTED"
  | "PERMISSION_REVOKED"
  // Candidate Management Events
  | "CANDIDATE_CREATED"
  | "CANDIDATE_UPDATED"
  | "CANDIDATE_DELETED"
  | "CANDIDATE_STATUS_CHANGED"
  | "CANDIDATE_ASSIGNED"
  | "CANDIDATE_UNASSIGNED"
  | "CANDIDATE_MERGED"
  | "CANDIDATE_EXPORTED"
  | "CANDIDATE_VIEWED"
  // Candidate Document Events
  | "CANDIDATE_DOCUMENT_UPLOADED"
  | "CANDIDATE_DOCUMENT_DELETED"
  | "CANDIDATE_RESUME_PARSED"
  | "CANDIDATE_VIDEO_UPLOADED"
  | "CANDIDATE_VIDEO_DELETED"
  // Interview Events
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_RESCHEDULED"
  | "INTERVIEW_CANCELLED"
  | "INTERVIEW_COMPLETED"
  | "INTERVIEW_NOTES_ADDED"
  | "INTERVIEW_FEEDBACK_SUBMITTED"
  // Job Posting Events
  | "JOB_CREATED"
  | "JOB_UPDATED"
  | "JOB_PUBLISHED"
  | "JOB_UNPUBLISHED"
  | "JOB_CLOSED"
  | "JOB_DELETED"
  | "JOB_APPLICATION_RECEIVED"
  | "JOB_VIEWED"
  // AI/Analysis Events
  | "AI_ANALYSIS_REQUESTED"
  | "AI_ANALYSIS_COMPLETED"
  | "AI_ANALYSIS_FAILED"
  | "PERSONALITY_ASSESSMENT_GENERATED"
  | "SKILL_ANALYSIS_COMPLETED"
  | "TRANSCRIPT_GENERATED"
  // Comment/Collaboration Events
  | "COMMENT_CREATED"
  | "COMMENT_UPDATED"
  | "COMMENT_DELETED"
  | "COMMENT_MENTION"
  // Notification Events
  | "NOTIFICATION_SENT"
  | "NOTIFICATION_PREFERENCES_UPDATED"
  | "EMAIL_SENT"
  | "EMAIL_FAILED"
  // Search/Filter Events
  | "ADVANCED_SEARCH_PERFORMED"
  | "BULK_EXPORT_PERFORMED"
  | "REPORT_GENERATED"
  // Data Access Events
  | "PROFILE_VIEWED"
  | "SENSITIVE_DATA_ACCESSED"
  | "FILE_UPLOADED"
  | "FILE_DOWNLOADED"
  | "FILE_DELETED"
  // Admin Events
  | "ADMIN_OVERRIDE"
  | "BULK_OPERATION_PERFORMED"
  // Data Privacy/Compliance Events
  | "DATA_EXPORT_REQUESTED"
  | "DATA_DELETION_REQUESTED"
  | "GDPR_REQUEST_FULFILLED"
  | "PII_VIEWED"
  // Integration/Webhook Events
  | "WEBHOOK_CONFIGURED"
  | "WEBHOOK_TRIGGERED"
  | "WEBHOOK_FAILED"
  | "API_KEY_CREATED"
  | "API_KEY_REVOKED"
  | "EXTERNAL_INTEGRATION_CONNECTED"
  // System Events
  | "SYSTEM_ERROR"
  | "CONFIG_CHANGED"
  | "BACKUP_CREATED"
  | "SYSTEM_MAINTENANCE_STARTED"
  | "SYSTEM_MAINTENANCE_COMPLETED";

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
