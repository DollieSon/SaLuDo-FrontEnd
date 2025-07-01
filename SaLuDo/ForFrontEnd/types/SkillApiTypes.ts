// ===========================================
// SKILLS REST API INTERFACES FOR FRONTEND
// ===========================================

import { AddedBy } from './CandidateApiTypes';

// ===========================================
// SKILL MANAGEMENT INTERFACES
// ===========================================

export interface CandidateSkillData {
    candidateSkillId: string;
    skillId: string;              // Foreign key to skills_master collection
    evidence: string;
    score: number;               // 1-10 proficiency level
    addedAt: Date;
    addedBy: AddedBy;            // Who added this skill
    isDeleted: boolean;          // Soft deletion flag
}

export interface CandidateSkillWithMasterData extends CandidateSkillData {
    skillName: string;          // From skills_master join
    isAccepted: boolean;        // From skills_master join
}

export interface CreateCandidateSkillData {
    skillName: string;          // Will be resolved to skillId
    evidence: string;
    score: number;             // 1-10
    addedBy: AddedBy;
}

export interface UpdateCandidateSkillData {
    evidence?: string;
    score?: number;
    addedBy?: AddedBy;
}

export interface BulkCandidateSkillData {
    skillName: string;
    evidence: string;
    score: number;
    addedBy: AddedBy;
    confidence?: number;        // AI parser confidence (0-1)
}

// ===========================================
// SKILL MASTER INTERFACES
// ===========================================

export interface SkillMasterData {
    skillId: string;
    skillName: string;
    isAccepted: boolean;
    dateAdded: Date;
    lastModified: Date;
}

export interface CreateSkillMasterData {
    skillName: string;
    isAccepted?: boolean;
}

export interface UpdateSkillMasterData {
    skillName?: string;
    isAccepted?: boolean;
}

// ===========================================
// SKILL SEARCH AND FILTER INTERFACES
// ===========================================

export interface SkillSearchCriteria {
    skillName?: string;
    includeUnaccepted?: boolean;
    threshold?: number;
    page?: number;
    limit?: number;
}

export interface SkillThresholdFilter {
    threshold: number;
    includeUnaccepted?: boolean;
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

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    totalPages: number;
    message?: string;
}

// ===========================================
// SPECIFIC API RESPONSE TYPES
// ===========================================

// Candidate Skills Operations
export type GetCandidateSkillsResponse = ApiResponse<CandidateSkillWithMasterData[]>;
export type AddCandidateSkillResponse = ApiResponse<null>;
export type BulkAddCandidateSkillsResponse = ApiResponse<null>;
export type UpdateCandidateSkillResponse = ApiResponse<null>;
export type DeleteCandidateSkillResponse = ApiResponse<null>;
export type RestoreCandidateSkillResponse = ApiResponse<null>;
export type HardDeleteCandidateSkillResponse = ApiResponse<null>;

// Skill Filtering and Search
export type GetSkillsByThresholdResponse = ApiResponse<CandidateSkillWithMasterData[]>;
export type SearchSkillsByNameResponse = ApiResponse<SkillMasterData[]>;
export type GetCandidatesBySkillResponse = ApiResponse<any[]>;

// Skill Master Operations
export type GetAllSkillMastersResponse = ApiResponse<SkillMasterData[]>;
export type GetSkillMasterResponse = ApiResponse<SkillMasterData>;
export type UpdateSkillMasterResponse = ApiResponse<null>;

// Global Skills Data
export type GetAllSkillsResponse = ApiResponse<SkillMasterData[]>;

// ===========================================
// BULK OPERATIONS INTERFACES
// ===========================================

export interface BulkSkillUploadResult {
    successful: number;
    failed: number;
    errors: Array<{
        skillName: string;
        error: string;
    }>;
    skillIds: Array<{
        skillName: string;
        skillId: string;
        masterSkillId: string;
    }>;
}

export type BulkSkillUploadResponse = ApiResponse<BulkSkillUploadResult>;

// ===========================================
// SKILL ANALYTICS INTERFACES
// ===========================================

export interface SkillAnalytics {
    totalSkills: number;
    acceptedSkills: number;
    pendingSkills: number;
    mostUsedSkills: Array<{
        skillName: string;
        usageCount: number;
    }>;
    skillDistribution: Array<{
        scoreRange: string;
        count: number;
    }>;
}

export type GetSkillAnalyticsResponse = ApiResponse<SkillAnalytics>;

// ===========================================
// SKILL VALIDATION INTERFACES
// ===========================================

export interface SkillValidationResult {
    isValid: boolean;
    exists: boolean;
    suggestions: string[];
    similarSkills: SkillMasterData[];
}

export type ValidateSkillResponse = ApiResponse<SkillValidationResult>;
