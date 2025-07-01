// ===========================================
// JOBS REST API INTERFACES FOR FRONTEND
// ===========================================

// ===========================================
// JOB DATA INTERFACES
// ===========================================

export interface JobSkillRequirement {
    skillId: string;           
    requiredLevel: number;     // 0.0 - 10.0
    evidence?: string;         // Optional evidence/justification for the skill requirement
    isDeleted?: boolean;       // Soft deletion flag for job skills
}

export interface JobData {
    _id?: string;              // MongoDB ObjectId as string
    jobName: string;
    jobDescription: string;
    skills: JobSkillRequirement[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateJobData {
    jobName: string;
    jobDescription: string;
    skills?: JobSkillRequirement[];  // Made optional - skills can be added later
}

export interface UpdateJobData {
    jobName?: string;
    jobDescription?: string;
    skills?: JobSkillRequirement[];
}

export interface JobSearchCriteria {
    skillIds?: string[];
    skillNames?: string[];
    jobName?: string;
    page?: number;
    limit?: number;
}

export interface JobSummary {
    _id: string;
    jobName: string;
    skillsCount: number;
    createdAt: Date;
}

export interface JobSkillWithMaster extends JobSkillRequirement {
    skillName: string;         // From SkillMaster join
    isAccepted: boolean;      // From SkillMaster join
}

export interface JobWithSkillNames extends Omit<JobData, 'skills'> {
    skills: JobSkillWithMaster[];
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
// API RESPONSE INTERFACES
// ===========================================

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    count?: number;
    error?: string;
}

export interface PaginatedJobResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
}

export interface JobSearchResponse {
    success: boolean;
    data: JobData[];
    total: number;
    totalPages: number;
    message?: string;
}

// ===========================================
// SPECIFIC API RESPONSE TYPES
// ===========================================

// Job CRUD Operations
export type GetAllJobsResponse = PaginatedJobResponse<JobData>;
export type GetJobSummariesResponse = PaginatedJobResponse<JobSummary>;
export type GetJobResponse = ApiResponse<JobData>;
export type GetJobWithSkillNamesResponse = ApiResponse<JobWithSkillNames>;
export type CreateJobResponse = ApiResponse<JobData>;
export type UpdateJobResponse = ApiResponse<null>;
export type DeleteJobResponse = ApiResponse<null>;

// Job Search Operations
export type SearchJobsResponse = JobSearchResponse;
export type GetJobsBySkillResponse = ApiResponse<JobData[]>;
export type GetJobsBySkillNameResponse = ApiResponse<JobData[]>;

// Job Skills Operations
export type GetJobSkillsResponse = ApiResponse<JobSkillRequirement[]>;
export type GetJobActiveSkillsResponse = ApiResponse<JobSkillRequirement[]>;
export type AddSkillToJobResponse = ApiResponse<null>;
export type AddSkillsToJobResponse = ApiResponse<null>;
export type RemoveSkillFromJobResponse = ApiResponse<null>;
export type RestoreSkillToJobResponse = ApiResponse<null>;
export type HardRemoveSkillFromJobResponse = ApiResponse<null>;

// Skill Master Operations
export type GetAllSkillsResponse = ApiResponse<SkillMasterData[]>;
export type GetSkillMasterResponse = ApiResponse<SkillMasterData>;
export type UpdateSkillMasterResponse = ApiResponse<null>;
export type SearchSkillsByNameResponse = ApiResponse<SkillMasterData[]>;
export type GetCandidatesBySkillNameResponse = ApiResponse<any[]>;

// ===========================================
// BULK OPERATIONS INTERFACES
// ===========================================

export interface BulkSkillRequirement {
    skillId: string;
    requiredLevel: number;
    evidence?: string;
}

export interface BulkSkillByNameRequirement {
    skillName: string;
    requiredLevel: number;
    evidence?: string;
}

export interface AddBulkSkillsRequest {
    skills: BulkSkillRequirement[];
}

export interface AddBulkSkillsByNameRequest {
    skills: BulkSkillByNameRequirement[];
}

export type AddBulkSkillsResponse = ApiResponse<null>;
export type AddBulkSkillsByNameResponse = ApiResponse<null>;

// ===========================================
// JOB AI INTEGRATION INTERFACES
// ===========================================

export interface JobDescriptionForAI {
    jobName: string;
    jobDescription: string;
}

export interface AIGeneratedJobSkills {
    skills: Array<{
        skillName: string;
        requiredLevel: number;
        evidence: string;
        confidence: number;
    }>;
    suggestions: string[];
}

export type GenerateJobSkillsResponse = ApiResponse<AIGeneratedJobSkills>;
