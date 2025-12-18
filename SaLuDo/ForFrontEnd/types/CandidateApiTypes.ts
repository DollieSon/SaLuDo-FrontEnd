// ===========================================
// CANDIDATE REST API INTERFACES FOR FRONTEND
// ===========================================

// ===========================================
// ENUMS
// ===========================================

export enum CandidateStatus {
    FOR_REVIEW = 'For Review',
    PAPER_SCREENING = 'Paper Screening',
    EXAM = 'Exam',
    HR_INTERVIEW = 'HR Interview',
    TECHNICAL_INTERVIEW = 'Technical Interview',
    FINAL_INTERVIEW = 'Final Interview',
    FOR_JOB_OFFER = 'For Job Offer',
    OFFER_EXTENDED = 'Offer Extended',
    // Terminal statuses
    HIRED = 'Hired',
    REJECTED = 'Rejected',
    WITHDRAWN = 'Withdrawn',
    ON_HOLD = 'On Hold'
}

export enum AddedBy {
    AI = 'AI',
    HUMAN = 'HUMAN'
}

// ===========================================
// STATUS HISTORY INTERFACES
// ===========================================

export interface StatusHistoryEntry {
    historyId: string;
    status: CandidateStatus;
    previousStatus: CandidateStatus | null;
    changedAt: Date;
    changedBy: string;
    changedByName?: string;
    changedByEmail?: string;
    reason?: string;
    notes?: string;
    isAutomated?: boolean;
    source?: 'manual' | 'automation' | 'bulk_action' | 'api' | 'migration';
}

export interface TimeInStage {
    status: CandidateStatus;
    durationMs: number;
    durationDays: number;
    startDate: Date;
    endDate: Date | null;
}

export interface CandidateTimeAnalytics {
    candidateId: string;
    candidateName: string;
    currentStatus: CandidateStatus;
    timeInCurrentStage: {
        durationMs: number;
        durationDays: number;
        durationHours: number;
        startDate: Date;
    };
    stageBreakdown: TimeInStage[];
    totalTimeInProcess: {
        durationMs: number;
        durationDays: number;
        startDate: Date;
    };
    totalStatusChanges: number;
    isStuck: boolean;
    stuckThresholdDays: number;
}

export interface SystemWideTimeAnalytics {
    averageTimePerStage: Record<CandidateStatus, number>;
    medianTimePerStage: Record<CandidateStatus, number>;
    bottleneckStages: Array<{
        status: CandidateStatus;
        averageDays: number;
        medianDays: number;
        candidatesAffected: number;
    }>;
    stuckCandidates: Array<{
        candidateId: string;
        candidateName: string;
        status: CandidateStatus;
        daysInStage: number;
    }>;
    conversionFunnel: Array<{
        status: CandidateStatus;
        candidateCount: number;
        conversionRate: number;
        dropOffRate: number;
        averageDaysInStage: number;
    }>;
    totalCandidates: number;
    averageTimeToHire: number;
    totalStatusChanges: number;
}

export interface StatusHistoryResponse {
    candidateId: string;
    candidateName: string;
    currentStatus: CandidateStatus;
    statusHistory: StatusHistoryEntry[];
    totalChanges: number;
}

// ===========================================
// BASE DATA TYPES
// ===========================================

export interface ResumeMetadata {
    fileId: string;           // GridFS file ID
    filename: string;         // Original filename
    contentType: string;      // MIME type (application/pdf, etc.)
    size: number;            // File size in bytes
    uploadedAt: Date;        // Upload timestamp
    parsedAt?: Date;         // When AI parsing completed
    parseStatus?: 'pending' | 'completed' | 'failed' | 'not_started';
    textContent?: string;    // Extracted text content for AI processing
}

export interface TranscriptMetadata {
    fileId: string;           // GridFS file ID
    filename: string;         // Original filename (e.g., "interview_round1.mp3")
    contentType: string;      // MIME type (audio/mpeg, audio/wav, text/plain, etc.)
    size: number;            // File size in bytes
    uploadedAt: Date;        // Upload timestamp
    transcribedAt?: Date;    // When AI transcription completed
    transcriptionStatus?: 'pending' | 'completed' | 'failed' | 'not_started';
    textContent?: string;    // Transcribed text content
    interviewRound?: string; // Which interview round (e.g., "initial", "technical", "hr")
    duration?: number;       // Audio duration in seconds (for audio files)
}

// ===========================================
// SKILL INTERFACES
// ===========================================

export interface SkillData {
    candidateSkillId: string;
    skillId: string;              // Foreign key to skills_master collection
    evidence: string;
    score: number;               // 1-10 proficiency level
    addedAt: Date;
    addedBy: AddedBy;            // Who added this skill
    isDeleted: boolean;          // Soft deletion flag
}

export interface CreateSkillData {
    skillName: string;          // Will be resolved to skillId
    evidence: string;
    score: number;             // 1-10
    addedBy: AddedBy;
}

export interface SkillWithMasterData extends SkillData {
    skillName: string;          // From skills_master join
    isAccepted: boolean;        // From skills_master join
}

// ===========================================
// EDUCATION INTERFACES
// ===========================================

export interface EducationData {
    educationId: string;
    institution: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateEducationData {
    institution: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
}

// ===========================================
// EXPERIENCE INTERFACES
// ===========================================

export interface ExperienceData {
    experienceId: string;
    title: string;
    role: string;
    description?: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateExperienceData {
    title: string;
    role: string;
    description?: string;
}

export interface UpdateExperienceData {
    title?: string;
    role?: string;
    description?: string;
}

// ===========================================
// CERTIFICATION INTERFACES
// ===========================================

export interface CertificationData {
    certificationId: string;
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCertificationData {
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    description?: string;
}

// ===========================================
// STRENGTH/WEAKNESS INTERFACES
// ===========================================

export interface StrengthWeaknessData {
    strengthWeaknessId: string;
    name: string;
    description: string;
    type: 'Strength' | 'Weakness';
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateStrengthWeaknessData {
    name: string;
    description: string;
    type: 'Strength' | 'Weakness';
}

// ===========================================
// PERSONALITY INTERFACES
// ===========================================

export interface PersonalityData {
    candidateId: string;
    openness: number;           // 0-100
    conscientiousness: number;  // 0-100
    extraversion: number;       // 0-100
    agreeableness: number;      // 0-100
    neuroticism: number;        // 0-100
    emotionalIntelligence: number; // 0-100
    leadership: number;         // 0-100
    teamwork: number;          // 0-100
    adaptability: number;       // 0-100
    problemSolving: number;     // 0-100
    communication: number;      // 0-100
    creativity: number;         // 0-100
    stressManagement: number;   // 0-100
    motivation: number;         // 0-100
    culturalFit: number;        // 0-100
    overallScore: number;       // Calculated average
    assessment?: string;        // Text assessment from AI
    dateAssessed: Date;
    updatedAt: Date;
}

// ===========================================
// MAIN CANDIDATE INTERFACES
// ===========================================

export interface CandidateData {
    candidateId: string;
    name: string;
    email: string[];
    birthdate: Date;
    dateCreated: Date;
    dateUpdated: Date;
    roleApplied: string | null;
    status: CandidateStatus;
    isDeleted: boolean;
    resumeMetadata?: ResumeMetadata;
    skills: SkillData[];
    experience: ExperienceData[];
    education: EducationData[];
    certification: CertificationData[];
    strengths: StrengthWeaknessData[];
    weaknesses: StrengthWeaknessData[];
    resumeAssessment?: string;
    transcripts: TranscriptMetadata[];
    personality: PersonalityData;
    interviewAssessment?: string;
    statusHistory?: StatusHistoryEntry[];
}

export interface PersonalInfoData {
    candidateId: string;
    name: string;
    email: string[];
    birthdate: Date;
    dateCreated: Date;
    dateUpdated: Date;
    roleApplied: string | null;
    status: CandidateStatus;
    isDeleted: boolean;
}

export interface ResumeData {
    candidateId: string;
    resume?: ResumeMetadata;
    skills: SkillData[];
    experience: ExperienceData[];
    education: EducationData[];
    certification: CertificationData[];
    strengths: StrengthWeaknessData[];
    weaknesses: StrengthWeaknessData[];
    resumeAssessment?: string;
    dateUpdated: Date;
}

export interface InterviewData {
    candidateId: string;
    transcripts: TranscriptMetadata[];
    personality: PersonalityData;
    interviewAssessment?: string;
    dateUpdated: Date;
}

// ===========================================
// INPUT DATA INTERFACES (FOR CREATING/UPDATING)
// ===========================================

export interface CreateCandidateData {
    name: string;
    email: string[];
    birthdate: Date;
    roleApplied?: string | null;
    status?: CandidateStatus;
    // Note: Resume file should be sent as FormData with key "resume"
}

export interface UpdateCandidateData {
    name?: string;
    email?: string[];
    birthdate?: Date;
    roleApplied?: string | null;
    status?: CandidateStatus;
}

export interface CandidateJobApplication {
    candidateId: string;
    jobId: string | null;
    appliedAt?: Date;
}

export interface CandidateJobSummary {
    candidateId: string;
    candidateName: string;
    jobId: string | null;
    jobName?: string;
    status: CandidateStatus;
    appliedAt: Date;
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

export type GetAllCandidatesResponse = ApiResponse<CandidateData[]>;
export type GetCandidateResponse = ApiResponse<CandidateData>;
export type CreateCandidateResponse = ApiResponse<CandidateData>;
export type UpdateCandidateResponse = ApiResponse<CandidateData>;
export type DeleteCandidateResponse = ApiResponse<null>;

export type GetCandidateSkillsResponse = ApiResponse<SkillWithMasterData[]>;
export type AddSkillResponse = ApiResponse<null>;
export type UpdateSkillResponse = ApiResponse<null>;
export type DeleteSkillResponse = ApiResponse<null>;

export type GetEducationResponse = ApiResponse<EducationData[]>;
export type AddEducationResponse = ApiResponse<null>;
export type UpdateEducationResponse = ApiResponse<null>;
export type DeleteEducationResponse = ApiResponse<null>;

export type GetExperienceResponse = ApiResponse<ExperienceData[]>;
export type AddExperienceResponse = ApiResponse<null>;
export type UpdateExperienceResponse = ApiResponse<null>;
export type DeleteExperienceResponse = ApiResponse<null>;

export type GetCertificationsResponse = ApiResponse<CertificationData[]>;
export type AddCertificationResponse = ApiResponse<null>;
export type UpdateCertificationResponse = ApiResponse<null>;
export type DeleteCertificationResponse = ApiResponse<null>;

export type GetStrengthsResponse = ApiResponse<StrengthWeaknessData[]>;
export type GetWeaknessesResponse = ApiResponse<StrengthWeaknessData[]>;
export type AddStrengthWeaknessResponse = ApiResponse<null>;
export type UpdateStrengthWeaknessResponse = ApiResponse<null>;
export type DeleteStrengthWeaknessResponse = ApiResponse<null>;

export type GetPersonalityResponse = ApiResponse<PersonalityData>;
export type UpdatePersonalityResponse = ApiResponse<null>;

export type UploadTranscriptResponse = ApiResponse<null>;
export type GetTranscriptsResponse = ApiResponse<TranscriptMetadata[]>;
export type DeleteTranscriptResponse = ApiResponse<null>;

export type GetStatusHistoryResponse = ApiResponse<StatusHistoryResponse>;
export type GetCandidateTimeAnalyticsResponse = ApiResponse<CandidateTimeAnalytics>;
export type GetSystemWideTimeAnalyticsResponse = ApiResponse<SystemWideTimeAnalytics>;
