// ===========================================
// COMPLETE API CLIENT FOR ALL ENDPOINTS
// ===========================================

import { 
    JobData,
    CreateJobData,
    UpdateJobData,
    JobSearchCriteria,
    JobSummary,
    JobWithSkillNames,
    JobSkillRequirement,
    BulkSkillRequirement,
    BulkSkillByNameRequirement,
    SkillMasterData,
    CreateSkillMasterData,
    UpdateSkillMasterData,
    GetAllJobsResponse,
    GetJobResponse,
    CreateJobResponse,
    SearchJobsResponse,
    GetJobSummariesResponse,
    GetJobWithSkillNamesResponse,
    GetAllSkillsResponse,
    GetSkillMasterResponse,
    AddSkillToJobResponse,
    AddBulkSkillsResponse,
    AddBulkSkillsByNameResponse
} from '../types/JobApiTypes';

import {
    CandidateSkillWithMasterData,
    CreateCandidateSkillData,
    UpdateCandidateSkillData,
    BulkCandidateSkillData,
    SkillThresholdFilter,
    GetCandidateSkillsResponse,
    AddCandidateSkillResponse,
    BulkAddCandidateSkillsResponse,
    UpdateCandidateSkillResponse,
    DeleteCandidateSkillResponse,
    GetSkillsByThresholdResponse,
    SearchSkillsByNameResponse
} from '../types/SkillApiTypes';

import {
    TranscriptData,
    TranscriptMetadata,
    CreateTranscriptData,
    UpdateTranscriptData,
    TranscriptionRequest,
    TranscriptionResult,
    TranscriptAnalysis,
    TranscriptSearchCriteria,
    GetTranscriptsResponse,
    GetTranscriptResponse,
    UploadTranscriptResponse,
    TranscribeResponse,
    AnalyzeTranscriptResponse,
    SearchTranscriptsResponse
} from '../types/TranscriptApiTypes';

import {
    UserData,
    CreateUserData,
    GetAllUsersResponse,
    CreateUserResponse,
    GetUserResumeResponse
} from '../types/UserApiTypes';

// ===========================================
// API CLIENT CONFIGURATION
// ===========================================

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust as needed

// Generic API client function
async function apiCall<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: any,
    isFormData: boolean = false
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get token from localStorage
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
    
    const headers: HeadersInit = isFormData ? {} : {
        'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config: RequestInit = {
        method,
        headers,
    };

    if (data) {
        if (isFormData) {
            config.body = data; // data should be FormData
        } else {
            config.body = JSON.stringify(data);
        }
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
}

// ===========================================
// JOBS API CLIENT
// ===========================================

export class JobApiClient {
    
    // Get all jobs with pagination
    static async getAllJobs(page: number = 1, limit: number = 10): Promise<JobData[]> {
        const response = await apiCall<GetAllJobsResponse>(
            `/jobs?page=${page}&limit=${limit}`
        );
        return response.data || [];
    }

    // Get job summaries
    static async getJobSummaries(page: number = 1, limit: number = 10): Promise<JobSummary[]> {
        const response = await apiCall<GetJobSummariesResponse>(
            `/jobs/summaries?page=${page}&limit=${limit}`
        );
        return response.data || [];
    }

    // Get job by ID
    static async getJob(jobId: string): Promise<JobData | null> {
        try {
            const response = await apiCall<GetJobResponse>(`/jobs/${jobId}`);
            return response.data || null;
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    // Get job with skill names
    static async getJobWithSkillNames(jobId: string): Promise<JobWithSkillNames | null> {
        try {
            const response = await apiCall<GetJobWithSkillNamesResponse>(`/jobs/${jobId}/skills-detailed`);
            return response.data || null;
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    // Create new job
    static async createJob(jobData: CreateJobData): Promise<JobData> {
        const response = await apiCall<CreateJobResponse>('/jobs', 'POST', jobData);
        if (!response.data) {
            throw new Error('Failed to create job');
        }
        return response.data;
    }

    // Update job
    static async updateJob(jobId: string, updateData: UpdateJobData): Promise<void> {
        await apiCall<GetJobResponse>(`/jobs/${jobId}`, 'PUT', updateData);
    }

    // Delete job
    static async deleteJob(jobId: string): Promise<void> {
        await apiCall(`/jobs/${jobId}`, 'DELETE');
    }

    // Search jobs
    static async searchJobs(criteria: JobSearchCriteria): Promise<JobData[]> {
        const response = await apiCall<SearchJobsResponse>('/jobs/search', 'POST', criteria);
        return response.data || [];
    }

    // Get jobs by skill
    static async getJobsBySkill(skillId: string): Promise<JobData[]> {
        const response = await apiCall<SearchJobsResponse>(`/jobs/by-skill/${skillId}`);
        return response.data || [];
    }

    // Get jobs by skill name
    static async getJobsBySkillName(skillName: string): Promise<JobData[]> {
        const response = await apiCall<SearchJobsResponse>(`/jobs/by-skill-name/${skillName}`);
        return response.data || [];
    }

    // Add skill to job
    static async addSkillToJob(
        jobId: string, 
        skillId: string, 
        requiredLevel: number, 
        evidence?: string
    ): Promise<void> {
        await apiCall<AddSkillToJobResponse>(
            `/jobs/${jobId}/skills`, 
            'POST', 
            { skillId, requiredLevel, evidence }
        );
    }

    // Add multiple skills to job
    static async addSkillsToJob(jobId: string, skills: BulkSkillRequirement[]): Promise<void> {
        await apiCall<AddBulkSkillsResponse>(
            `/jobs/${jobId}/skills/bulk`, 
            'POST', 
            { skills }
        );
    }

    // Add skills to job by name
    static async addSkillsToJobByName(jobId: string, skills: BulkSkillByNameRequirement[]): Promise<void> {
        await apiCall<AddBulkSkillsByNameResponse>(
            `/jobs/${jobId}/skills/bulk-by-name`, 
            'POST', 
            { skills }
        );
    }

    // Remove skill from job (soft delete)
    static async removeSkillFromJob(jobId: string, skillId: string): Promise<void> {
        await apiCall(`/jobs/${jobId}/skills/${skillId}`, 'DELETE');
    }

    // Restore skill to job
    static async restoreSkillToJob(jobId: string, skillId: string): Promise<void> {
        await apiCall(`/jobs/${jobId}/skills/${skillId}/restore`, 'PATCH');
    }

    // Hard remove skill from job
    static async hardRemoveSkillFromJob(jobId: string, skillId: string): Promise<void> {
        await apiCall(`/jobs/${jobId}/skills/${skillId}/hard`, 'DELETE');
    }

    // Get active job skills
    static async getJobActiveSkills(jobId: string): Promise<JobSkillRequirement[]> {
        const response = await apiCall<{ success: boolean; data: JobSkillRequirement[] }>(
            `/jobs/${jobId}/skills/active`
        );
        return response.data || [];
    }
}

// ===========================================
// SKILLS MASTER API CLIENT
// ===========================================

export class SkillMasterApiClient {
    
    // Get all skills from master database
    static async getAllSkills(): Promise<SkillMasterData[]> {
        const response = await apiCall<GetAllSkillsResponse>('/skills/master');
        return response.data || [];
    }

    // Get skill master by ID
    static async getSkillMaster(skillId: string): Promise<SkillMasterData | null> {
        try {
            const response = await apiCall<GetSkillMasterResponse>(`/skills/master/${skillId}`);
            return response.data || null;
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    // Update skill master
    static async updateSkillMaster(skillId: string, updateData: UpdateSkillMasterData): Promise<void> {
        await apiCall(`/skills/master/${skillId}`, 'PUT', updateData);
    }

    // Search skills by name
    static async searchSkillsByName(skillName: string): Promise<SkillMasterData[]> {
        const response = await apiCall<SearchSkillsByNameResponse>(`/skills/search/${skillName}`);
        return response.data || [];
    }

    // Get candidates by skill name
    static async getCandidatesBySkillName(skillName: string): Promise<any[]> {
        const response = await apiCall<{ success: boolean; data: any[] }>(`/skills/candidates/${skillName}`);
        return response.data || [];
    }
}

// ===========================================
// TRANSCRIPTS API CLIENT
// ===========================================

export class TranscriptApiClient {
    
    // Upload transcript file
    static async uploadTranscript(
        candidateId: string, 
        transcriptFile: File, 
        metadata?: Partial<CreateTranscriptData>
    ): Promise<TranscriptData> {
        const formData = new FormData();
        formData.append('transcript', transcriptFile);
        
        if (metadata?.interviewRound) {
            formData.append('interviewRound', metadata.interviewRound);
        }

        const response = await apiCall<UploadTranscriptResponse>(
            `/candidates/${candidateId}/transcripts`, 
            'POST', 
            formData, 
            true
        );
        
        if (!response.data) {
            throw new Error('Failed to upload transcript');
        }
        
        return response.data;
    }

    // Get all transcripts for candidate
    static async getTranscripts(candidateId: string): Promise<TranscriptData[]> {
        const response = await apiCall<GetTranscriptsResponse>(
            `/candidates/${candidateId}/transcripts`
        );
        return response.data || [];
    }

    // Get specific transcript
    static async getTranscript(candidateId: string, transcriptId: string): Promise<TranscriptData | null> {
        try {
            const response = await apiCall<GetTranscriptResponse>(
                `/candidates/${candidateId}/transcripts/${transcriptId}`
            );
            return response.data || null;
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    // Update transcript metadata
    static async updateTranscript(
        candidateId: string, 
        transcriptId: string, 
        updateData: UpdateTranscriptData
    ): Promise<void> {
        await apiCall(
            `/candidates/${candidateId}/transcripts/${transcriptId}`, 
            'PUT', 
            updateData
        );
    }

    // Delete transcript
    static async deleteTranscript(candidateId: string, transcriptId: string): Promise<void> {
        await apiCall(`/candidates/${candidateId}/transcripts/${transcriptId}`, 'DELETE');
    }

    // Get transcript metadata
    static async getTranscriptMetadata(candidateId: string, transcriptId: string): Promise<TranscriptMetadata | null> {
        try {
            const response = await apiCall<{ success: boolean; data: TranscriptMetadata }>(
                `/candidates/${candidateId}/transcripts/${transcriptId}/metadata`
            );
            return response.data || null;
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    // Transcribe audio file
    static async transcribeAudio(
        candidateId: string, 
        transcriptId: string, 
        options?: TranscriptionRequest['options']
    ): Promise<TranscriptionResult> {
        const response = await apiCall<TranscribeResponse>(
            `/candidates/${candidateId}/transcripts/${transcriptId}/transcribe`, 
            'POST', 
            { options }
        );
        
        if (!response.data) {
            throw new Error('Failed to transcribe audio');
        }
        
        return response.data;
    }

    // Analyze transcript
    static async analyzeTranscript(candidateId: string, transcriptId: string): Promise<TranscriptAnalysis> {
        const response = await apiCall<AnalyzeTranscriptResponse>(
            `/candidates/${candidateId}/transcripts/${transcriptId}/analyze`, 
            'POST'
        );
        
        if (!response.data) {
            throw new Error('Failed to analyze transcript');
        }
        
        return response.data;
    }

    // Search transcripts
    static async searchTranscripts(criteria: TranscriptSearchCriteria): Promise<TranscriptData[]> {
        const response = await apiCall<SearchTranscriptsResponse>(
            '/transcripts/search', 
            'POST', 
            criteria
        );
        return response.data || [];
    }
}

// ===========================================
// USERS API CLIENT (LEGACY)
// ===========================================

export class UserApiClient {
    
    // Get all users (legacy)
    static async getAllUsers(): Promise<UserData[]> {
        const response = await apiCall<GetAllUsersResponse>('/users');
        return response.data || [];
    }

    // Create user with resume (legacy)
    static async createUser(userData: CreateUserData, resumeFile: File): Promise<UserData> {
        const formData = new FormData();
        formData.append('name', userData.name);
        formData.append('email', userData.email);
        formData.append('resume', resumeFile);

        const response = await apiCall<CreateUserResponse>('/users', 'POST', formData, true);
        
        if (!response.data) {
            throw new Error('Failed to create user');
        }
        
        return response.data;
    }

    // Get user resume (legacy)
    static async getUserResume(userId: string): Promise<any> {
        const response = await apiCall<GetUserResumeResponse>(`/users/${userId}/resume`);
        return response.data;
    }
}

// ===========================================
// USAGE EXAMPLES
// ===========================================

// Example: Create a job with skills
async function createJobWithSkillsExample() {
    try {
        // Create the job first
        const jobData: CreateJobData = {
            jobName: "Senior JavaScript Developer",
            jobDescription: "We are looking for an experienced JavaScript developer...",
            // Skills can be added later
        };

        const newJob = await JobApiClient.createJob(jobData);
        console.log("Job created:", newJob);

        // Add skills to the job
        const skills: BulkSkillByNameRequirement[] = [
            {
                skillName: "JavaScript",
                requiredLevel: 8.5,
                evidence: "5+ years of experience required"
            },
            {
                skillName: "React",
                requiredLevel: 7.0,
                evidence: "Experience with React ecosystem"
            },
            {
                skillName: "Node.js",
                requiredLevel: 6.0,
                evidence: "Backend development experience"
            }
        ];

        await JobApiClient.addSkillsToJobByName(newJob._id!, skills);
        console.log("Skills added to job successfully");

        return newJob;
    } catch (error) {
        console.error("Error creating job with skills:", error);
        throw error;
    }
}

// Example: Upload and transcribe interview
async function uploadAndTranscribeExample(candidateId: string, audioFile: File) {
    try {
        // Upload transcript
        const transcript = await TranscriptApiClient.uploadTranscript(
            candidateId, 
            audioFile, 
            { interviewRound: "technical" }
        );
        console.log("Transcript uploaded:", transcript);

        // Transcribe the audio
        const transcription = await TranscriptApiClient.transcribeAudio(
            candidateId, 
            transcript.transcriptId,
            {
                language: "en",
                speakerDetection: true
            }
        );
        console.log("Transcription completed:", transcription);

        // Analyze the transcript
        const analysis = await TranscriptApiClient.analyzeTranscript(
            candidateId, 
            transcript.transcriptId
        );
        console.log("Analysis completed:", analysis);

        return { transcript, transcription, analysis };
    } catch (error) {
        console.error("Error in transcript workflow:", error);
        throw error;
    }
}

// Export the examples
export {
    createJobWithSkillsExample,
    uploadAndTranscribeExample
};
