// User Types
export enum UserRole {
  ADMIN = "admin",
  HR_MANAGER = "hr_manager",
  HR_USER = "hr_user",
  RECRUITER = "recruiter",
  INTERVIEWER = "interviewer",
}

export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  title: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title: string;
  role: UserRole;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  title?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: Date;
    refreshTokenExpiry: Date;
    mustChangePassword: boolean;
  };
}

export interface UsersListResponse {
  success: boolean;
  data: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
