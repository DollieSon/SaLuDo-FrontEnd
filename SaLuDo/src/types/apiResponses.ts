/**
 * TypeScript interfaces for API responses
 * These types provide autocomplete and type safety for all API calls
 */

import { UserProfile } from './user';
import { Data } from './data';
import { AuditLogResponse, AuditStatistics, SecurityAlert } from './audit';

// ============================================
// Base API Response Structure
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Authentication & Users Responses
// ============================================

export interface LoginResponseData {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

export type RefreshTokenResponse = ApiResponse<RefreshTokenResponseData>;

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface UserListResponse extends PaginatedResponse<UserProfile> {}

export type UserResponse = ApiResponse<UserProfile>;

export interface UserStatsData {
  totalCandidates: number;
  candidatesReviewed: number;
  commentsPosted: number;
  averageReviewTime: number;
  recentActivity: Array<{
    action: string;
    timestamp: string;
    candidateName?: string;
  }>;
}

export type UserStatsResponse = ApiResponse<UserStatsData>;

export interface UserActivityData {
  activities: Array<{
    type: string;
    description: string;
    timestamp: string;
    metadata?: any;
  }>;
  total: number;
}

export type UserActivityResponse = ApiResponse<UserActivityData>;

export interface ProfilePhotoUploadResponse {
  success: boolean;
  message: string;
  data: {
    photoId: string;
    photoUrl: string;
    thumbnailUrl: string;
  };
}

// ============================================
// Skills Responses
// ============================================

export interface Skill {
  _id: string;
  name: string;
  category?: string;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type SkillsListResponse = ApiResponse<Skill[]>;

export type SkillResponse = ApiResponse<Skill>;

export interface SkillSearchResult {
  skills: Skill[];
  total: number;
}

export type SkillSearchResponse = ApiResponse<SkillSearchResult>;

export interface SkillCandidatesData {
  candidates: Data[];
  total: number;
  skillName: string;
}

export type SkillCandidatesResponse = ApiResponse<SkillCandidatesData>;

export interface MergeSkillsResponse {
  success: boolean;
  message: string;
  data: {
    mergedSkill: Skill;
    deletedSkills: string[];
    updatedCandidates: number;
  };
}

// ============================================
// Jobs Responses
// ============================================

export interface Job {
  _id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  requiredSkills: string[];
  preferredSkills?: string[];
  responsibilities: string[];
  qualifications: string[];
  benefits?: string[];
  isActive: boolean;
  postedBy: string;
  createdAt: string;
  updatedAt: string;
  candidateCount?: number;
}

export type JobsListResponse = ApiResponse<Job[]>;

export type JobResponse = ApiResponse<Job>;

export interface JobSkillResponse {
  success: boolean;
  message: string;
  data: {
    job: Job;
    skillAdded?: string;
    skillRemoved?: string;
  };
}

// ============================================
// Candidates Responses
// ============================================

export interface CandidatesListResponse extends PaginatedResponse<Data> {}

export type CandidateResponse = ApiResponse<Data>;

export interface CandidatePersonalityData {
  personality: {
    type: string;
    traits: Record<string, number>;
    summary: string;
  };
  strengths: string[];
  weaknesses: string[];
}

export type CandidatePersonalityResponse = ApiResponse<CandidatePersonalityData>;

export interface FileUploadResponse {
  success: boolean;
  message: string;
  data: {
    fileId: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  };
}

export interface VideoUploadResponse {
  success: boolean;
  message: string;
  data: {
    videoId: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: number;
    uploadedAt: string;
  };
}

export interface CandidateComparisonData {
  candidates: Array<{
    candidateId: string;
    name: string;
    scores: {
      overall: number;
      technical: number;
      cultural: number;
      experience: number;
    };
    strengths: string[];
    weaknesses: string[];
    skills: string[];
  }>;
  comparison: {
    winner?: string;
    analysis: string;
    recommendations: string[];
  };
}

export type CandidateComparisonResponse = ApiResponse<CandidateComparisonData>;

export interface UserAssignmentData {
  candidate: Data;
  assignedUser: UserProfile;
  assignedAt: string;
}

export type UserAssignmentResponse = ApiResponse<UserAssignmentData>;

export interface CandidateAssignmentsData {
  assignments: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    assignedAt: string;
  }>;
  total: number;
}

export type CandidateAssignmentsResponse = ApiResponse<CandidateAssignmentsData>;

// ============================================
// Comments Responses
// ============================================

export interface Comment {
  _id: string;
  candidateId: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  parentId?: string;
  isPrivate: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
  replyCount?: number;
}

export type CommentsListResponse = ApiResponse<Comment[]>;

export type CommentResponse = ApiResponse<Comment>;

export interface CommentStatsData {
  totalComments: number;
  topLevelComments: number;
  replies: number;
  privateComments: number;
  publicComments: number;
  commentsByUser: Record<string, number>;
}

export type CommentStatsResponse = ApiResponse<CommentStatsData>;

// ============================================
// Notifications Responses
// ============================================

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

export type NotificationsListResponse = ApiResponse<Notification[]>;

export interface UnreadCountData {
  unreadCount: number;
}

export type UnreadCountResponse = ApiResponse<UnreadCountData>;

export interface NotificationSummaryData {
  total: number;
  unread: number;
  byType: Record<string, number>;
  recent: Notification[];
}

export type NotificationSummaryResponse = ApiResponse<NotificationSummaryData>;

export interface NotificationPreferences {
  _id: string;
  userId: string;
  emailNotifications: {
    enabled: boolean;
    candidateUpdates: boolean;
    comments: boolean;
    assignments: boolean;
    systemAlerts: boolean;
  };
  inAppNotifications: {
    enabled: boolean;
    candidateUpdates: boolean;
    comments: boolean;
    assignments: boolean;
    systemAlerts: boolean;
  };
  digestFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export type NotificationPreferencesResponse = ApiResponse<NotificationPreferences>;

// ============================================
// Audit Logs Responses
// ============================================

export type AuditLogsResponse = ApiResponse<AuditLogResponse>;

export type SecurityAlertsResponse = ApiResponse<SecurityAlert[]>;

export type AuditStatisticsResponse = ApiResponse<AuditStatistics>;

// ============================================
// Dashboard & Analytics Responses
// ============================================

export interface DashboardStatsData {
  totalCandidates: number;
  activeCandidates: number;
  totalJobs: number;
  activeJobs: number;
  totalUsers: number;
  activeUsers: number;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    userId?: string;
    userName?: string;
  }>;
  candidatesByStatus: Record<string, number>;
  candidatesBySource: Record<string, number>;
}

export type DashboardStatsResponse = ApiResponse<DashboardStatsData>;

// ============================================
// Settings Responses
// ============================================

export interface SystemSettings {
  emailConfig: {
    enabled: boolean;
    provider: string;
    fromAddress: string;
  };
  authConfig: {
    tokenExpiry: number;
    refreshTokenExpiry: number;
    maxLoginAttempts: number;
  };
  fileConfig: {
    maxFileSize: number;
    allowedFileTypes: string[];
  };
}

export type SystemSettingsResponse = ApiResponse<SystemSettings>;

// ============================================
// Error Response Types
// ============================================

export interface ApiError extends Error {
  statusCode?: number;
  responseData?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
  stack?: string;
}
