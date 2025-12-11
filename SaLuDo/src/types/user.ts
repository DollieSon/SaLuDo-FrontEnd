// User Types
export enum UserRole {
  ADMIN = "admin",
  HR_MANAGER = "hr_manager",
  HR_USER = "hr_user",
  RECRUITER = "recruiter",
  INTERVIEWER = "interviewer",
}

// =======================
// EXTENDED PROFILE TYPES
// =======================

export type AvailabilityStatus = 'available' | 'busy' | 'away';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export interface Availability {
  status: AvailabilityStatus;
  daysAvailable: DayOfWeek[];
  preferredTimeSlots?: TimeSlot[];
  notes?: string;
}

export interface ProfilePhotoMetadata {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
  thumbnailFileId?: string;
}

export interface RoleSpecificData {
  // For INTERVIEWER
  expertiseAreas?: Array<'technical' | 'behavioral' | 'leadership' | 'cultural-fit' | 'skills-assessment'>;
  interviewTypes?: Array<'phone' | 'video' | 'in-person' | 'panel'>;
  
  // For RECRUITER
  specializations?: Array<'software-engineering' | 'marketing' | 'sales' | 'design' | 'operations' | 'executive' | 'general'>;
  candidatePipelineLimit?: number;
  
  // For HR_MANAGER
  teamSize?: number;
  canApproveOffers?: boolean;
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
  // Extended profile fields
  photoMetadata?: ProfilePhotoMetadata;
  phoneNumber?: string;
  location?: string;
  timezone?: string;
  linkedInUrl?: string;
  bio?: string;
  availability?: Availability;
  roleSpecificData?: RoleSpecificData;
}

export interface ProfileStats {
  userId: string;
  totalCandidatesAssigned: number;
  activeCandidatesCount: number;
  candidatesHired: number;
  candidatesRejected: number;
  interviewsConducted?: number;
  lastActivityDate?: Date;
  accountAge: number;
}

export type ProfileActivityType = 
  | 'profile_updated'
  | 'photo_uploaded'
  | 'photo_deleted'
  | 'availability_updated'
  | 'bio_updated'
  | 'contact_updated';

export interface ProfileActivity {
  activityId: string;
  userId: string;
  activityType: ProfileActivityType;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Date;
  ipAddress?: string;
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
  // Extended profile fields
  phoneNumber?: string;
  location?: string;
  timezone?: string;
  linkedInUrl?: string;
  bio?: string;
  availability?: Availability;
  roleSpecificData?: RoleSpecificData;
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
