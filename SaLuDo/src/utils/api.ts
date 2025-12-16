import { Data } from "../types/data";
import {
  AuditEventType,
  AuditLogResponse,
  AuditSeverity,
  AuditStatistics,
  SecurityAlert,
} from "../types/audit";
import { TokenManager } from "./tokenManager";
import { createAuthHeaders, createBasicHeaders } from "./apiHeaders";
import { validateApiResponse } from "./apiErrorHandler";

// Get API URL from environment variables with fallback
const getApiUrl = (): string => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  return envApiUrl || "http://localhost:3000/api/";
};

export async function fetchApiData(): Promise<Data | null> {
  const response = await fetch(`${getApiUrl()}data`);
  if (!response.ok) return null;
  return response.json();
}

export const apiUrl: string = getApiUrl();

// Skills API functions
export const skillsApi = {
  // Get all master skills - AVAILABLE: GET /api/skills
  getAllMasterSkills: async (accessToken?: string) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(`${apiUrl}skills`, {
      headers: createAuthHeaders(token),
    });
    return await validateApiResponse(response);
  },

  // Get only skills used by candidates - AVAILABLE: GET /api/skills/master/used
  getUsedMasterSkills: async (accessToken?: string) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(`${apiUrl}skills/master/used`, {
      headers: createAuthHeaders(token),
    });
    return await validateApiResponse(response);
  },

  // Get single skill master data - AVAILABLE: GET /api/skills/master/:skillId
  getSkillMaster: async (skillId: string) => {
    const response = await fetch(`${apiUrl}skills/master/${skillId}`);
    return await validateApiResponse(response);
  },

  // Update skill master data - AVAILABLE: PUT /api/skills/master/:skillId
  updateSkillMaster: async (
    skillId: string,
    updates: { skillName?: string; isAccepted?: boolean }
  ) => {
    const response = await fetch(`${apiUrl}skills/master/${skillId}`, {
      method: "PUT",
      headers: createBasicHeaders(),
      body: JSON.stringify(updates),
    });
    return await validateApiResponse(response);
  },

  // Accept/Approve skill - Available via update endpoint
  acceptSkill: async (skillId: string) => {
    return skillsApi.updateSkillMaster(skillId, { isAccepted: true });
  },

  // Reject skill (soft delete) - Available via update endpoint
  rejectSkill: async (skillId: string) => {
    return skillsApi.updateSkillMaster(skillId, { isAccepted: false });
  },

  // Search skills by name - AVAILABLE: GET /api/skills/search/:skillName
  searchSkills: async (skillName: string) => {
    const response = await fetch(
      `${apiUrl}skills/search/${encodeURIComponent(skillName)}`
    );
    return await validateApiResponse(response);
  },

  // Get candidates with specific skill - AVAILABLE: GET /api/skills/candidates/:skillName
  getCandidatesWithSkill: async (skillName: string) => {
    const response = await fetch(
      `${apiUrl}skills/candidates/${encodeURIComponent(skillName)}`
    );
    return await validateApiResponse(response);
  },

  // Merge skills - AVAILABLE: POST /api/skills/master/merge
  mergeSkills: async (targetSkillId: string, sourceSkillIds: string[]) => {
    const response = await fetch(`${apiUrl}skills/master/merge`, {
      method: "POST",
      headers: createBasicHeaders(),
      body: JSON.stringify({ targetSkillId, sourceSkillIds }),
    });
    return await validateApiResponse(response);
  },
};

// Note: The backend doesn't have direct endpoints for:
// - Creating new skill masters (they're created automatically via getOrCreate when added to candidates)
// - Deleting skill masters (only soft delete by setting isAccepted: false)
// - Merging skills (would need to be implemented)

// Job API functions
export const jobsApi = {
  // Get all jobs
  getAllJobs: async (accessToken?: string) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(`${apiUrl}jobs?limit=1000`, {
      headers: createAuthHeaders(token),
    }); // Set high limit to get all jobs
    return await validateApiResponse(response);
  },

  // Get single job with skill names
  getJob: async (jobId: string, includeSkillNames: boolean = true) => {
    const response = await fetch(
      `${apiUrl}jobs/${jobId}?includeSkillNames=${includeSkillNames}`
    );
    return await validateApiResponse(response);
  },

  // Create new job
  createJob: async (jobData: any) => {
    const response = await fetch(`${apiUrl}jobs`, {
      method: "POST",
      headers: createBasicHeaders(),
      body: JSON.stringify(jobData),
    });
    return await validateApiResponse(response);
  },

  // Update job
  updateJob: async (jobId: string, updates: any) => {
    const response = await fetch(`${apiUrl}jobs/${jobId}`, {
      method: "PUT",
      headers: createBasicHeaders(),
      body: JSON.stringify(updates),
    });
    return await validateApiResponse(response);
  },

  // Delete job
  deleteJob: async (jobId: string) => {
    const response = await fetch(`${apiUrl}jobs/${jobId}`, {
      method: "DELETE",
    });
    return await validateApiResponse(response);
  },

  // Add skill to job
  addSkillToJob: async (
    jobId: string,
    skillData: { skillId: string; requiredLevel: number; evidence?: string }
  ) => {
    const response = await fetch(`${apiUrl}jobs/${jobId}/skills`, {
      method: "POST",
      headers: createBasicHeaders(),
      body: JSON.stringify(skillData),
    });
    return await validateApiResponse(response);
  },

  // Remove skill from job
  removeSkillFromJob: async (jobId: string, skillId: string) => {
    const response = await fetch(`${apiUrl}jobs/${jobId}/skills/${skillId}`, {
      method: "DELETE",
    });
    return await validateApiResponse(response);
  },
};

// Candidate API functions
export const candidatesApi = {
  // Get all candidates
  getAllCandidates: async (accessToken?: string) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(`${apiUrl}candidates`, {
      headers: createAuthHeaders(token),
    });
    return await validateApiResponse(response);
  },

  // Create new candidate
  createCandidate: async (formData: FormData, accessToken?: string) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(`${apiUrl}candidates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // Don't set Content-Type header, let browser set it for FormData
    });
    return await validateApiResponse(response);
  },

  // Get single candidate by ID
  getCandidateById: async (candidateId: string, accessToken?: string) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(`${apiUrl}candidates/${candidateId}`, {
      headers: createAuthHeaders(token),
    });
    return await validateApiResponse(response);
  },

  // Get candidate personality data
  getCandidatePersonality: async (
    candidateId: string,
    accessToken?: string
  ) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/personality`,
      { headers: createAuthHeaders(token) }
    );
    return await validateApiResponse(response);
  },

  // Update candidate information
  updateCandidate: async (
    candidateId: string,
    updates: any,
    accessToken?: string
  ) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(`${apiUrl}candidates/${candidateId}`, {
      method: "PUT",
      headers: createAuthHeaders(token),
      body: JSON.stringify(updates),
    });
    return await validateApiResponse(response);
  },

  // Delete candidate
  deleteCandidate: async (candidateId: string, accessToken?: string) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(`${apiUrl}candidates/${candidateId}`, {
      method: "DELETE",
      headers: createAuthHeaders(token),
    });
    return await validateApiResponse(response);
  },

  // Upload transcript file
  uploadTranscript: async (
    candidateId: string,
    formData: FormData,
    accessToken?: string
  ) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/transcripts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
    return await validateApiResponse(response);
  },

  // Upload interview video file
  uploadInterviewVideo: async (
    candidateId: string,
    formData: FormData,
    accessToken?: string
  ) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/videos/interview/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
    return await validateApiResponse(response);
  },

  // Upload introduction video file
  uploadIntroductionVideo: async (
    candidateId: string,
    formData: FormData,
    accessToken?: string
  ) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/videos/introduction/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
    return await validateApiResponse(response);
  },

  // Get file download URL
  getFileDownloadUrl: (fileId: string) => {
    return `${apiUrl}files/${fileId}`;
  },

  // Get transcript file download URL
  getTranscriptDownloadUrl: (fileId: string) => {
    return `${apiUrl}files/transcripts/${fileId}`;
  },

  // Compare two candidates
  compareCandidates: async (
    candidateId1: string,
    candidateId2: string,
    accessToken?: string
  ) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(
      `${apiUrl}candidates/${candidateId1}/compare/${candidateId2}`,
      { headers: createAuthHeaders(token) }
    );
    return await validateApiResponse(response);
  },

  // Assign user to candidate
  assignUserToCandidate: async (
    candidateId: string,
    userId: string,
    accessToken?: string
  ) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/assign/${userId}`,
      {
        method: "POST",
        headers: createAuthHeaders(token),
      }
    );
    return await validateApiResponse(response);
  },

  // Unassign user from candidate
  unassignUserFromCandidate: async (
    candidateId: string,
    userId: string,
    accessToken?: string
  ) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/unassign/${userId}`,
      {
        method: "DELETE",
        headers: createAuthHeaders(token),
      }
    );
    return await validateApiResponse(response);
  },

  // Get candidate assignments
  getCandidateAssignments: async (
    candidateId: string,
    accessToken?: string
  ) => {
    const token = accessToken || localStorage.getItem("accessToken") || "";
    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/assignments`,
      { headers: createAuthHeaders(token) }
    );
    return await validateApiResponse(response);
  },
};

// User/Auth API functions
export const usersApi = {
  // Login
  login: async (email: string, password: string) => {
    const response = await fetch(`${apiUrl}users/auth/login`, {
      method: "POST",
      headers: createBasicHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const result = await validateApiResponse(response);
    
    // Store tokens with expiry
    if (result.data) {
      TokenManager.saveTokens({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        accessTokenExpiry: result.data.accessTokenExpiry,
        refreshTokenExpiry: result.data.refreshTokenExpiry,
      });
    }
    
    return result;
  },

  // Logout
  logout: async (
    accessToken: string,
    refreshToken?: string,
    revokeAllSessions: boolean = false
  ) => {
    const response = await fetch(`${apiUrl}users/auth/logout`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify({ refreshToken, revokeAllSessions }),
    });
    const result = await validateApiResponse(response);
    
    // Clear stored tokens on successful logout
    TokenManager.clearTokens();
    
    return result;
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    const response = await fetch(`${apiUrl}users/auth/refresh`, {
      method: "POST",
      headers: createBasicHeaders(),
      body: JSON.stringify({ refreshToken }),
    });
    const result = await validateApiResponse(response);
    
    // Update stored tokens with new values
    if (result.data) {
      TokenManager.saveTokens({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        accessTokenExpiry: result.data.accessTokenExpiry,
        refreshTokenExpiry: result.data.refreshTokenExpiry,
      });
    }
    
    return result;
  },

  // Change password
  changePassword: async (
    accessToken: string,
    currentPassword: string,
    newPassword: string
  ) => {
    const response = await fetch(`${apiUrl}users/auth/change-password`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return await validateApiResponse(response);
  },

  // Get all users (Admin only)
  getAllUsers: async (
    accessToken: string,
    options?: {
      page?: number;
      limit?: number;
      role?: string;
      isActive?: boolean;
      search?: string;
    }
  ) => {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.role) params.append("role", options.role);
    if (options?.isActive !== undefined)
      params.append("isActive", options.isActive.toString());
    if (options?.search) params.append("search", options.search);

    const response = await fetch(`${apiUrl}users?${params.toString()}`, {
      headers: createAuthHeaders(accessToken),
    });
    return await validateApiResponse(response);
  },

  // Get user by ID
  getUserById: async (accessToken: string, userId: string) => {
    const response = await fetch(`${apiUrl}users/${userId}`, {
      headers: createAuthHeaders(accessToken),
    });
    return await validateApiResponse(response);
  },

  // Create new user (Admin only)
  createUser: async (
    accessToken: string,
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      middleName?: string;
      title: string;
      role: string;
    }
  ) => {
    const response = await fetch(`${apiUrl}users`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(userData),
    });
    return await validateApiResponse(response);
  },

  // Update user profile
  updateUserProfile: async (
    accessToken: string,
    userId: string,
    updates: {
      email?: string;
      firstName?: string;
      lastName?: string;
      middleName?: string;
      title?: string;
      phoneNumber?: string;
      location?: string;
      timezone?: string;
      linkedInUrl?: string;
      bio?: string;
      availability?: any;
      roleSpecificData?: any;
    }
  ) => {
    const response = await fetch(`${apiUrl}users/${userId}/profile`, {
      method: "PUT",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(updates),
    });
    return await validateApiResponse(response);
  },

  // Upload profile photo
  uploadProfilePhoto: async (
    accessToken: string,
    userId: string,
    photoFile: File
  ) => {
    const formData = new FormData();
    formData.append('photo', photoFile);

    const response = await fetch(`${apiUrl}users/${userId}/profile/photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });
    return await validateApiResponse(response);
  },

  // Get profile photo URL
  getProfilePhotoUrl: (userId: string, thumbnail: boolean = false) => {
    const params = thumbnail ? '?thumbnail=true' : '';
    return `${apiUrl}users/${userId}/profile/photo${params}`;
  },

  // Delete profile photo
  deleteProfilePhoto: async (accessToken: string, userId: string) => {
    const response = await fetch(`${apiUrl}users/${userId}/profile/photo`, {
      method: "DELETE",
      headers: createAuthHeaders(accessToken),
    });
    return await validateApiResponse(response);
  },

  // Get user profile stats
  getUserStats: async (accessToken: string, userId: string) => {
    const response = await fetch(`${apiUrl}users/${userId}/profile/stats`, {
      headers: createAuthHeaders(accessToken),
    });
    return await validateApiResponse(response);
  },

  // Get user profile activity
  getProfileActivity: async (
    accessToken: string,
    userId: string,
    limit: number = 10
  ) => {
    const response = await fetch(
      `${apiUrl}users/${userId}/profile/activity?limit=${limit}`,
      {
        headers: createAuthHeaders(accessToken),
      }
    );
    return await validateApiResponse(response);
  },

  // Set user active status (Admin only)
  setUserActiveStatus: async (
    accessToken: string,
    userId: string,
    isActive: boolean
  ) => {
    const response = await fetch(`${apiUrl}users/${userId}/status`, {
      method: "PUT",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify({ isActive }),
    });
    return await validateApiResponse(response);
  },

  // Reset user password (Admin only) - LEGACY
  resetUserPassword: async (
    accessToken: string,
    userId: string,
    newPassword: string
  ) => {
    const response = await fetch(`${apiUrl}users/${userId}/reset-password`, {
      method: "PUT",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify({ newPassword }),
    });
    return await validateApiResponse(response);
  },

  // Admin reset user password with email (Admin only)
  adminResetPassword: async (
    accessToken: string,
    userId: string,
    reason?: string,
    customPassword?: string
  ) => {
    const response = await fetch(`${apiUrl}users/${userId}/reset-password`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify({ reason, customPassword }),
    });
    return await validateApiResponse(response);
  },

  // Delete user (Admin only)
  deleteUser: async (accessToken: string, userId: string) => {
    const response = await fetch(`${apiUrl}users/${userId}`, {
      method: "DELETE",
      headers: createAuthHeaders(accessToken),
    });
    return await validateApiResponse(response);
  },
};

export const auditLogsApi = {
  getLogs: async (
    accessToken: string,
    options?: {
      page?: number;
      limit?: number;
      eventTypes?: AuditEventType[];
      severityLevels?: AuditSeverity[];
      userId?: string;
      ipAddress?: string;
      success?: boolean;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<AuditLogResponse> => {
    const params = new URLSearchParams();
    params.append("page", String(options?.page ?? 1));
    params.append("limit", String(options?.limit ?? 25));

    if (options?.eventTypes?.length) {
      params.append("eventType", options.eventTypes.join(","));
    }

    if (options?.severityLevels?.length) {
      params.append("severity", options.severityLevels.join(","));
    }

    if (options?.userId) {
      params.append("userId", options.userId);
    }

    if (options?.ipAddress) {
      params.append("ipAddress", options.ipAddress);
    }

    if (options?.success !== undefined) {
      params.append("success", String(options.success));
    }

    if (options?.startDate) {
      params.append("startDate", options.startDate);
    }

    if (options?.endDate) {
      params.append("endDate", options.endDate);
    }

    const response = await fetch(`${apiUrl}audit-logs?${params.toString()}`, {
      headers: createAuthHeaders(accessToken),
    });

    return await validateApiResponse(response);
  },

  getAlerts: async (
    accessToken: string,
    hours?: number
  ): Promise<{
    success: boolean;
    data: SecurityAlert[];
    windowHours: number;
    count: number;
  }> => {
    const params = new URLSearchParams();
    if (hours) {
      params.append("hours", String(hours));
    }

    const response = await fetch(
      `${apiUrl}audit-logs/alerts${
        params.toString() ? `?${params.toString()}` : ""
      }`,
      {
        headers: createAuthHeaders(accessToken),
      }
    );

    return await validateApiResponse(response);
  },

  getStats: async (
    accessToken: string,
    days?: number
  ): Promise<{
    success: boolean;
    data: AuditStatistics;
    windowDays: number;
  }> => {
    const params = new URLSearchParams();
    if (days) {
      params.append("days", String(days));
    }

    const response = await fetch(
      `${apiUrl}audit-logs/stats${
        params.toString() ? `?${params.toString()}` : ""
      }`,
      {
        headers: createAuthHeaders(accessToken),
      }
    );

    return await validateApiResponse(response);
  },
};

// Comments API
export const commentsApi = {
  // Create comment
  createComment: async (
    accessToken: string,
    data: {
      text: string;
      entityType: string;
      entityId: string;
      parentCommentId?: string | null;
    }
  ) => {
    const response = await fetch(`${apiUrl}comments`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(data),
    });
    return await validateApiResponse(response);
  },

  // Get comments for entity
  getComments: async (
    accessToken: string,
    entityType: string,
    entityId: string,
    options?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    }
  ) => {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", String(options.page));
    if (options?.limit) params.append("limit", String(options.limit));
    if (options?.sortBy) params.append("sortBy", options.sortBy);
    if (options?.sortOrder) params.append("sortOrder", options.sortOrder);

    const response = await fetch(
      `${apiUrl}comments/${entityType}/${entityId}${
        params.toString() ? `?${params.toString()}` : ""
      }`,
      {
        headers: createAuthHeaders(accessToken),
      }
    );
    return await validateApiResponse(response);
  },

  // Get top-level comments
  getTopLevelComments: async (
    accessToken: string,
    entityType: string,
    entityId: string,
    options?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    }
  ) => {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", String(options.page));
    if (options?.limit) params.append("limit", String(options.limit));
    if (options?.sortBy) params.append("sortBy", options.sortBy);
    if (options?.sortOrder) params.append("sortOrder", options.sortOrder);

    const response = await fetch(
      `${apiUrl}comments/${entityType}/${entityId}/top-level${
        params.toString() ? `?${params.toString()}` : ""
      }`,
      {
        headers: createAuthHeaders(accessToken),
      }
    );
    return await validateApiResponse(response);
  },

  // Get replies for a comment
  getReplies: async (accessToken: string, commentId: string) => {
    const response = await fetch(`${apiUrl}comments/${commentId}/replies`, {
      headers: createAuthHeaders(accessToken),
    });
    return await validateApiResponse(response);
  },

  // Update comment
  updateComment: async (
    accessToken: string,
    commentId: string,
    text: string
  ) => {
    const response = await fetch(`${apiUrl}comments/${commentId}`, {
      method: "PUT",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify({ text }),
    });
    return await validateApiResponse(response);
  },

  // Delete comment
  deleteComment: async (accessToken: string, commentId: string) => {
    const response = await fetch(`${apiUrl}comments/${commentId}`, {
      method: "DELETE",
      headers: createAuthHeaders(accessToken),
    });
    return await validateApiResponse(response);
  },

  // Get comment stats
  getStats: async (
    accessToken: string,
    entityType: string,
    entityId: string
  ) => {
    const response = await fetch(
      `${apiUrl}comments/stats/${entityType}/${entityId}`,
      {
        headers: createAuthHeaders(accessToken),
      }
    );
    return await validateApiResponse(response);
  },

  // Search users for mentions
  searchUsers: async (accessToken: string, query: string) => {
    const params = new URLSearchParams();
    params.append("query", query);

    const response = await fetch(
      `${apiUrl}comments/autocomplete/users?${params.toString()}`,
      {
        headers: createAuthHeaders(accessToken),
      }
    );
    
    return await validateApiResponse(response);
  },
};

// Notifications API
export const notificationsApi = {
  // Get notifications
  getNotifications: async (
    accessToken: string,
    options?: {
      isRead?: boolean;
      priority?: string;
      category?: string;
      type?: string;
      limit?: number;
      page?: number;
    }
  ) => {
    const params = new URLSearchParams();
    if (options?.isRead !== undefined)
      params.append("isRead", String(options.isRead));
    if (options?.priority) params.append("priority", options.priority);
    if (options?.category) params.append("category", options.category);
    if (options?.type) params.append("type", options.type);
    if (options?.limit) params.append("limit", String(options.limit));
    if (options?.page)
      params.append("skip", String((options.page - 1) * (options.limit || 50)));

    const response = await fetch(
      `${apiUrl}notifications${
        params.toString() ? `?${params.toString()}` : ""
      }`,
      {
        headers: createAuthHeaders(accessToken),
      }
    );
    return await validateApiResponse(response);
  },

  // Get unread count
  getUnreadCount: async (accessToken: string) => {
    const response = await fetch(`${apiUrl}notifications/unread-count`, {
      headers: createAuthHeaders(accessToken),
    });
    return await validateApiResponse(response);
  },

  // Get notification summary
  getSummary: async (accessToken: string) => {
    const response = await fetch(`${apiUrl}notifications/summary`, {
      headers: createAuthHeaders(accessToken),
    });
    return await validateApiResponse(response);
  },

  // Mark as read
  markAsRead: async (accessToken: string, notificationId: string) => {
    const response = await fetch(
      `${apiUrl}notifications/${notificationId}/read`,
      {
        method: "PUT",
        headers: createAuthHeaders(accessToken),
      }
    );
    return await validateApiResponse(response);
  },

  // Mark all as read
  markAllAsRead: async (accessToken: string) => {
    const response = await fetch(`${apiUrl}notifications/read-all`, {
      method: "PUT",
      headers: createAuthHeaders(accessToken),
    });
    return await validateApiResponse(response);
  },

  // Delete notification
  deleteNotification: async (accessToken: string, notificationId: string) => {
    const response = await fetch(`${apiUrl}notifications/${notificationId}`, {
      method: "DELETE",
      headers: createAuthHeaders(accessToken),
    });
    return await validateApiResponse(response);
  },

  // Get preferences
  getPreferences: async (accessToken: string) => {
    const response = await fetch(
      `${apiUrl}notifications/preferences/settings`,
      {
        headers: createAuthHeaders(accessToken),
      }
    );
    return await validateApiResponse(response);
  },

  // Update preferences
  updatePreferences: async (accessToken: string, preferences: any) => {
    const response = await fetch(
      `${apiUrl}notifications/preferences/settings`,
      {
        method: "PUT",
        headers: createAuthHeaders(accessToken),
        body: JSON.stringify(preferences),
      }
    );
    
    return await validateApiResponse(response);
  },
};
