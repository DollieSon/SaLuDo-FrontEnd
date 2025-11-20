import { Data } from "../types/data";
import {
  AuditEventType,
  AuditLogResponse,
  AuditSeverity,
  AuditStatistics,
  SecurityAlert,
} from "../types/audit";

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
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${apiUrl}skills`, { headers });
    if (!response.ok) throw new Error("Failed to fetch skills");
    return response.json();
  },

  // Get only skills used by candidates - AVAILABLE: GET /api/skills/master/used
  getUsedMasterSkills: async (accessToken?: string) => {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${apiUrl}skills/master/used`, { headers });
    if (!response.ok) throw new Error("Failed to fetch used skills");
    return response.json();
  },

  // Get single skill master data - AVAILABLE: GET /api/skills/master/:skillId
  getSkillMaster: async (skillId: string) => {
    const response = await fetch(`${apiUrl}skills/master/${skillId}`);
    if (!response.ok) throw new Error("Failed to fetch skill");
    return response.json();
  },

  // Update skill master data - AVAILABLE: PUT /api/skills/master/:skillId
  updateSkillMaster: async (
    skillId: string,
    updates: { skillName?: string; isAccepted?: boolean }
  ) => {
    const response = await fetch(`${apiUrl}skills/master/${skillId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update skill");
    return response.json();
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
    if (!response.ok) throw new Error("Failed to search skills");
    return response.json();
  },

  // Get candidates with specific skill - AVAILABLE: GET /api/skills/candidates/:skillName
  getCandidatesWithSkill: async (skillName: string) => {
    const response = await fetch(
      `${apiUrl}skills/candidates/${encodeURIComponent(skillName)}`
    );
    if (!response.ok) throw new Error("Failed to get candidates with skill");
    return response.json();
  },

  // Merge skills - AVAILABLE: POST /api/skills/master/merge
  mergeSkills: async (targetSkillId: string, sourceSkillIds: string[]) => {
    const response = await fetch(`${apiUrl}skills/master/merge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetSkillId, sourceSkillIds }),
    });
    if (!response.ok) throw new Error("Failed to merge skills");
    return response.json();
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
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${apiUrl}jobs?limit=1000`, { headers }); // Set high limit to get all jobs
    if (!response.ok) throw new Error("Failed to fetch jobs");
    return response.json();
  },

  // Get single job with skill names
  getJob: async (jobId: string, includeSkillNames: boolean = true) => {
    const response = await fetch(
      `${apiUrl}jobs/${jobId}?includeSkillNames=${includeSkillNames}`
    );
    if (!response.ok) throw new Error("Failed to fetch job");
    return response.json();
  },

  // Create new job
  createJob: async (jobData: any) => {
    const response = await fetch(`${apiUrl}jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
    if (!response.ok) throw new Error("Failed to create job");
    return response.json();
  },

  // Update job
  updateJob: async (jobId: string, updates: any) => {
    const response = await fetch(`${apiUrl}jobs/${jobId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update job");
    return response.json();
  },

  // Delete job
  deleteJob: async (jobId: string) => {
    const response = await fetch(`${apiUrl}jobs/${jobId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete job");
    return response.json();
  },

  // Add skill to job
  addSkillToJob: async (
    jobId: string,
    skillData: { skillId: string; requiredLevel: number; evidence?: string }
  ) => {
    const response = await fetch(`${apiUrl}jobs/${jobId}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skillData),
    });
    if (!response.ok) throw new Error("Failed to add skill to job");
    return response.json();
  },

  // Remove skill from job
  removeSkillFromJob: async (jobId: string, skillId: string) => {
    const response = await fetch(`${apiUrl}jobs/${jobId}/skills/${skillId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to remove skill from job");
    return response.json();
  },
};

// Candidate API functions
export const candidatesApi = {
  // Get all candidates
  getAllCandidates: async (accessToken?: string) => {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      // Try to get token from localStorage
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${apiUrl}candidates`, { headers });
    if (!response.ok) throw new Error("Failed to fetch candidates");
    return response.json();
  },

  // Create new candidate
  createCandidate: async (formData: FormData, accessToken?: string) => {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${apiUrl}candidates`, {
      method: "POST",
      headers,
      body: formData, // Don't set Content-Type header, let browser set it for FormData
    });
    if (!response.ok) throw new Error("Failed to create candidate");
    return response.json();
  },

  // Get single candidate by ID
  getCandidateById: async (candidateId: string, accessToken?: string) => {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${apiUrl}candidates/${candidateId}`, {
      headers,
    });
    if (!response.ok) throw new Error("Failed to fetch candidate");
    return response.json();
  },

  // Get candidate personality data
  getCandidatePersonality: async (
    candidateId: string,
    accessToken?: string
  ) => {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/personality`,
      { headers }
    );
    if (!response.ok) throw new Error("Failed to fetch candidate personality");
    return response.json();
  },

  // Update candidate information
  updateCandidate: async (
    candidateId: string,
    updates: any,
    accessToken?: string
  ) => {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${apiUrl}candidates/${candidateId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update candidate");
    return response.json();
  },

  // Upload transcript file
  uploadTranscript: async (
    candidateId: string,
    formData: FormData,
    accessToken?: string
  ) => {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/transcripts`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );
    if (!response.ok) throw new Error("Failed to upload transcript");
    return response.json();
  },

  // Upload interview video file
  uploadInterviewVideo: async (
    candidateId: string,
    formData: FormData,
    accessToken?: string
  ) => {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/videos/interview/upload`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );
    if (!response.ok) throw new Error("Failed to upload interview video");
    return response.json();
  },

  // Upload introduction video file
  uploadIntroductionVideo: async (
    candidateId: string,
    formData: FormData,
    accessToken?: string
  ) => {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/videos/introduction/upload`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );
    if (!response.ok) throw new Error("Failed to upload introduction video");
    return response.json();
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
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(
      `${apiUrl}candidates/${candidateId1}/compare/${candidateId2}`,
      { headers }
    );
    if (!response.ok) throw new Error("Failed to compare candidates");
    return response.json();
  },

  // Assign user to candidate
  assignUserToCandidate: async (
    candidateId: string,
    userId: string,
    accessToken?: string
  ) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/assign/${userId}`,
      {
        method: "POST",
        headers,
      }
    );
    if (!response.ok) throw new Error("Failed to assign user");
    return response.json();
  },

  // Unassign user from candidate
  unassignUserFromCandidate: async (
    candidateId: string,
    userId: string,
    accessToken?: string
  ) => {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/unassign/${userId}`,
      {
        method: "DELETE",
        headers,
      }
    );
    if (!response.ok) throw new Error("Failed to unassign user");
    return response.json();
  },

  // Get candidate assignments
  getCandidateAssignments: async (
    candidateId: string,
    accessToken?: string
  ) => {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(
      `${apiUrl}candidates/${candidateId}/assignments`,
      { headers }
    );
    if (!response.ok) throw new Error("Failed to get assignments");
    return response.json();
  },
};

// User/Auth API functions
export const usersApi = {
  // Login
  login: async (email: string, password: string) => {
    const response = await fetch(`${apiUrl}users/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Login failed");
    return response.json();
  },

  // Logout
  logout: async (
    accessToken: string,
    refreshToken?: string,
    revokeAllSessions: boolean = false
  ) => {
    const response = await fetch(`${apiUrl}users/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken, revokeAllSessions }),
    });
    if (!response.ok) throw new Error("Logout failed");
    return response.json();
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    const response = await fetch(`${apiUrl}users/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) throw new Error("Token refresh failed");
    return response.json();
  },

  // Change password
  changePassword: async (
    accessToken: string,
    currentPassword: string,
    newPassword: string
  ) => {
    const response = await fetch(`${apiUrl}users/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.ok) throw new Error("Password change failed");
    return response.json();
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
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },

  // Get user by ID
  getUserById: async (accessToken: string, userId: string) => {
    const response = await fetch(`${apiUrl}users/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Failed to create user");
    return response.json();
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
    }
  ) => {
    const response = await fetch(`${apiUrl}users/${userId}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update user profile");
    return response.json();
  },

  // Set user active status (Admin only)
  setUserActiveStatus: async (
    accessToken: string,
    userId: string,
    isActive: boolean
  ) => {
    const response = await fetch(`${apiUrl}users/${userId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ isActive }),
    });
    if (!response.ok) throw new Error("Failed to update user status");
    return response.json();
  },

  // Reset user password (Admin only)
  resetUserPassword: async (
    accessToken: string,
    userId: string,
    newPassword: string
  ) => {
    const response = await fetch(`${apiUrl}users/${userId}/reset-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    if (!response.ok) throw new Error("Failed to reset password");
    return response.json();
  },

  // Delete user (Admin only)
  deleteUser: async (accessToken: string, userId: string) => {
    const response = await fetch(`${apiUrl}users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to delete user");
    return response.json();
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
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new Error("Failed to fetch audit logs");
    return response.json();
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
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch security alerts");
    return response.json();
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
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch audit statistics");
    return response.json();
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create comment");
    return response.json();
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
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch comments");
    return response.json();
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
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch top-level comments");
    return response.json();
  },

  // Get replies for a comment
  getReplies: async (accessToken: string, commentId: string) => {
    const response = await fetch(`${apiUrl}comments/${commentId}/replies`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch replies");
    return response.json();
  },

  // Update comment
  updateComment: async (
    accessToken: string,
    commentId: string,
    text: string
  ) => {
    const response = await fetch(`${apiUrl}comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error("Failed to update comment");
    return response.json();
  },

  // Delete comment
  deleteComment: async (accessToken: string, commentId: string) => {
    const response = await fetch(`${apiUrl}comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to delete comment");
    return response.json();
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
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch comment stats");
    return response.json();
  },

  // Search users for mentions
  searchUsers: async (accessToken: string, query: string) => {
    const params = new URLSearchParams();
    params.append("query", query);

    const response = await fetch(
      `${apiUrl}comments/autocomplete/users?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) throw new Error("Failed to search users");
    return response.json();
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
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch notifications");
    return response.json();
  },

  // Get unread count
  getUnreadCount: async (accessToken: string) => {
    const response = await fetch(`${apiUrl}notifications/unread-count`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch unread count");
    return response.json();
  },

  // Get notification summary
  getSummary: async (accessToken: string) => {
    const response = await fetch(`${apiUrl}notifications/summary`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch notification summary");
    return response.json();
  },

  // Mark as read
  markAsRead: async (accessToken: string, notificationId: string) => {
    const response = await fetch(
      `${apiUrl}notifications/${notificationId}/read`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) throw new Error("Failed to mark notification as read");
    return response.json();
  },

  // Mark all as read
  markAllAsRead: async (accessToken: string) => {
    const response = await fetch(`${apiUrl}notifications/read-all`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok)
      throw new Error("Failed to mark all notifications as read");
    return response.json();
  },

  // Delete notification
  deleteNotification: async (accessToken: string, notificationId: string) => {
    const response = await fetch(`${apiUrl}notifications/${notificationId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to delete notification");
    return response.json();
  },

  // Get preferences
  getPreferences: async (accessToken: string) => {
    const response = await fetch(
      `${apiUrl}notifications/preferences/settings`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch preferences");
    return response.json();
  },

  // Update preferences
  updatePreferences: async (accessToken: string, preferences: any) => {
    const response = await fetch(
      `${apiUrl}notifications/preferences/settings`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preferences),
      }
    );
    if (!response.ok) throw new Error("Failed to update preferences");
    return response.json();
  },
};
