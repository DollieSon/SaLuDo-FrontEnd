// ===========================================
// USERS REST API INTERFACES FOR FRONTEND
// ===========================================
// Note: These are legacy routes that may be replaced by candidate routes

// ===========================================
// USER DATA INTERFACES
// ===========================================

export interface UserData {
    id: string;
    name: string;
    email: string;
    resume?: {
        fileId: string;
        filename: string;
        contentType: string;
        size: number;
        uploadedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserData {
    name: string;
    email: string;
    // Note: Resume file should be sent as FormData with key "resume"
}

export interface UpdateUserData {
    name?: string;
    email?: string;
}

// ===========================================
// RESUME FILE INTERFACES
// ===========================================

export interface ResumeFileData {
    fileId: string;
    filename: string;
    contentType: string;
    size: number;
    uploadedAt: Date;
    downloadUrl?: string;
}

export interface ResumeUploadResult {
    fileId: string;
    filename: string;
    size: number;
    success: boolean;
}

// ===========================================
// API RESPONSE INTERFACES
// ===========================================

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    count?: number;
    error?: string;
}

// ===========================================
// SPECIFIC API RESPONSE TYPES
// ===========================================

// User CRUD Operations
export type GetAllUsersResponse = ApiResponse<UserData[]>;
export type GetUserResponse = ApiResponse<UserData>;
export type CreateUserResponse = ApiResponse<UserData>;
export type UpdateUserResponse = ApiResponse<UserData>;
export type DeleteUserResponse = ApiResponse<null>;

// Resume Operations
export type GetUserResumeResponse = ApiResponse<ResumeFileData>;
export type UploadResumeResponse = ApiResponse<ResumeUploadResult>;

// ===========================================
// FILE HANDLING INTERFACES
// ===========================================

export interface FileUploadConstraints {
    maxSize: number;
    allowedTypes: string[];
    allowedExtensions: string[];
}

export const RESUME_UPLOAD_CONSTRAINTS: FileUploadConstraints = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx']
};

// ===========================================
// ERROR INTERFACES
// ===========================================

export interface UserApiError {
    code: string;
    message: string;
    details?: any;
}

export interface ValidationError extends UserApiError {
    field: string;
    value: any;
}

// ===========================================
// DEPRECATION NOTICE
// ===========================================

/**
 * @deprecated These user routes are legacy and may be replaced by candidate routes.
 * For new development, prefer using the Candidate API endpoints.
 * 
 * Legacy endpoints:
 * - GET /api/users
 * - POST /api/users
 * - GET /api/users/:id/resume
 * 
 * Recommended alternatives:
 * - Use CandidateApiClient for candidate management
 * - Use candidate-specific resume handling
 */
