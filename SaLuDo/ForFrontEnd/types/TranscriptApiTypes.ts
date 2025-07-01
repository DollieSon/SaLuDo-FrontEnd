// ===========================================
// TRANSCRIPTS REST API INTERFACES FOR FRONTEND
// ===========================================

// ===========================================
// TRANSCRIPT DATA INTERFACES
// ===========================================

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

export interface TranscriptData extends TranscriptMetadata {
    candidateId: string;
    transcriptId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTranscriptData {
    candidateId: string;
    interviewRound?: string;
    // Note: File should be sent as FormData with key "transcript"
}

export interface UpdateTranscriptData {
    filename?: string;
    interviewRound?: string;
    textContent?: string;
    transcriptionStatus?: 'pending' | 'completed' | 'failed' | 'not_started';
}

// ===========================================
// TRANSCRIPT PROCESSING INTERFACES
// ===========================================

export interface TranscriptionRequest {
    transcriptId: string;
    candidateId: string;
    options?: {
        language?: string;
        speakerDetection?: boolean;
        confidence?: number;
    };
}

export interface TranscriptionResult {
    transcriptId: string;
    textContent: string;
    confidence: number;
    processingTime: number;
    speakers?: Array<{
        speaker: string;
        segments: Array<{
            text: string;
            startTime: number;
            endTime: number;
        }>;
    }>;
    metadata: {
        duration: number;
        audioQuality: string;
        language: string;
    };
}

export interface TranscriptAnalysis {
    transcriptId: string;
    candidateId: string;
    analysis: {
        sentimentScore: number;        // -1 to 1
        confidenceLevel: number;       // 0 to 1
        communicationSkills: number;   // 0 to 100
        technicalKeywords: string[];
        softSkills: string[];
        concerns: string[];
        strengths: string[];
    };
    summary: string;
    recommendations: string[];
    processedAt: Date;
}

// ===========================================
// TRANSCRIPT SEARCH AND FILTER INTERFACES
// ===========================================

export interface TranscriptSearchCriteria {
    candidateId?: string;
    interviewRound?: string;
    transcriptionStatus?: 'pending' | 'completed' | 'failed' | 'not_started';
    dateFrom?: Date;
    dateTo?: Date;
    contentType?: string;
    page?: number;
    limit?: number;
}

export interface TranscriptContentSearch {
    query: string;
    candidateId?: string;
    caseSensitive?: boolean;
    wholeWords?: boolean;
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

// Transcript CRUD Operations
export type UploadTranscriptResponse = ApiResponse<TranscriptData>;
export type GetTranscriptsResponse = ApiResponse<TranscriptData[]>;
export type GetTranscriptResponse = ApiResponse<TranscriptData>;
export type UpdateTranscriptResponse = ApiResponse<null>;
export type DeleteTranscriptResponse = ApiResponse<null>;

// Transcript Metadata Operations
export type GetTranscriptMetadataResponse = ApiResponse<TranscriptMetadata>;

// Transcript Processing Operations
export type TranscribeResponse = ApiResponse<TranscriptionResult>;
export type GetTranscriptionStatusResponse = ApiResponse<{
    status: 'pending' | 'completed' | 'failed' | 'not_started';
    progress?: number;
    error?: string;
}>;

// Transcript Analysis Operations
export type AnalyzeTranscriptResponse = ApiResponse<TranscriptAnalysis>;
export type GetTranscriptAnalysisResponse = ApiResponse<TranscriptAnalysis>;

// Transcript Search Operations
export type SearchTranscriptsResponse = PaginatedResponse<TranscriptData>;
export type SearchTranscriptContentResponse = ApiResponse<Array<{
    transcriptId: string;
    candidateId: string;
    filename: string;
    matches: Array<{
        text: string;
        context: string;
        position: number;
    }>;
}>>;

// ===========================================
// BULK OPERATIONS INTERFACES
// ===========================================

export interface BulkTranscriptUploadResult {
    successful: number;
    failed: number;
    transcripts: TranscriptData[];
    errors: Array<{
        filename: string;
        error: string;
    }>;
}

export type BulkUploadTranscriptsResponse = ApiResponse<BulkTranscriptUploadResult>;

// ===========================================
// TRANSCRIPT ANALYTICS INTERFACES
// ===========================================

export interface TranscriptAnalytics {
    totalTranscripts: number;
    transcribedTranscripts: number;
    pendingTranscription: number;
    averageProcessingTime: number;
    fileTypes: Array<{
        type: string;
        count: number;
    }>;
    averageDuration: number;
    interviewRounds: Array<{
        round: string;
        count: number;
    }>;
}

export type GetTranscriptAnalyticsResponse = ApiResponse<TranscriptAnalytics>;

// ===========================================
// FILE HANDLING INTERFACES
// ===========================================

export interface SupportedFileType {
    mimeType: string;
    extension: string;
    maxSize: number;
    description: string;
}

export interface FileUploadConstraints {
    supportedTypes: SupportedFileType[];
    maxFileSize: number;
    maxFilesPerUpload: number;
}

export type GetFileUploadConstraintsResponse = ApiResponse<FileUploadConstraints>;

// ===========================================
// TRANSCRIPT EXPORT INTERFACES
// ===========================================

export interface TranscriptExportOptions {
    format: 'txt' | 'docx' | 'pdf' | 'json';
    includeMetadata: boolean;
    includeAnalysis: boolean;
    includeTimestamps: boolean;
}

export interface TranscriptExportResult {
    downloadUrl: string;
    expiresAt: Date;
    format: string;
    size: number;
}

export type ExportTranscriptResponse = ApiResponse<TranscriptExportResult>;
