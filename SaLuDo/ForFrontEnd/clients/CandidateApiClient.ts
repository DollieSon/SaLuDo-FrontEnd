// ===========================================
// CANDIDATE API USAGE EXAMPLES FOR FRONTEND
// ===========================================

import { 
    CandidateData,
    CreateCandidateData,
    UpdateCandidateData,
    CreateSkillData,
    CreateEducationData,
    CreateExperienceData,
    CreateCertificationData,
    CreateStrengthWeaknessData,
    ApiResponse,
    GetAllCandidatesResponse,
    GetCandidateResponse,
    CandidateStatus,
    AddedBy
} from '../types/CandidateApiTypes';

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
    
    const config: RequestInit = {
        method,
        headers: isFormData ? {} : {
            'Content-Type': 'application/json',
            // Add authentication headers here
            // 'Authorization': `Bearer ${token}`,
        },
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
// CANDIDATE CRUD OPERATIONS
// ===========================================

export class CandidateApiClient {
    
    // Get all candidates
    static async getAllCandidates(): Promise<CandidateData[]> {
        const response = await apiCall<GetAllCandidatesResponse>('/candidates');
        return response.data || [];
    }

    // Get candidate by ID
    static async getCandidate(candidateId: string): Promise<CandidateData | null> {
        try {
            const response = await apiCall<GetCandidateResponse>(`/candidates/${candidateId}`);
            return response.data || null;
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    // Create new candidate with resume
    static async createCandidate(
        candidateData: CreateCandidateData, 
        resumeFile: File
    ): Promise<CandidateData> {
        const formData = new FormData();
        
        formData.append('name', candidateData.name);
        candidateData.email.forEach(email => formData.append('email', email));
        formData.append('birthdate', candidateData.birthdate.toISOString());
        
        if (candidateData.roleApplied) {
            formData.append('roleApplied', candidateData.roleApplied);
        }
        
        if (candidateData.status) {
            formData.append('status', candidateData.status);
        }
        
        formData.append('resume', resumeFile);

        const response = await apiCall<ApiResponse<CandidateData>>(
            '/candidates', 
            'POST', 
            formData, 
            true
        );
        
        if (!response.data) {
            throw new Error('Failed to create candidate');
        }
        
        return response.data;
    }

    // Update candidate
    static async updateCandidate(
        candidateId: string, 
        updateData: UpdateCandidateData
    ): Promise<void> {
        await apiCall<ApiResponse<CandidateData>>(
            `/candidates/${candidateId}`, 
            'PUT', 
            updateData
        );
    }

    // Delete candidate (soft delete)
    static async deleteCandidate(candidateId: string): Promise<void> {
        await apiCall<ApiResponse<null>>(`/candidates/${candidateId}`, 'DELETE');
    }
}

// ===========================================
// SKILLS OPERATIONS
// ===========================================

export class SkillsApiClient {
    
    // Get candidate skills
    static async getCandidateSkills(
        candidateId: string, 
        includeUnaccepted: boolean = true,
        includeDeleted: boolean = false
    ) {
        const params = new URLSearchParams({
            includeUnaccepted: includeUnaccepted.toString(),
            includeDeleted: includeDeleted.toString()
        });
        
        const response = await apiCall<ApiResponse<any[]>>(
            `/skills/${candidateId}/skills?${params}`
        );
        return response.data || [];
    }

    // Add skill to candidate
    static async addSkill(candidateId: string, skillData: CreateSkillData): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/skills/${candidateId}/skills`, 
            'POST', 
            skillData
        );
    }

    // Bulk add skills
    static async addSkillsBulk(candidateId: string, skills: CreateSkillData[]): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/skills/${candidateId}/skills/bulk`, 
            'POST', 
            skills
        );
    }

    // Update skill
    static async updateSkill(
        candidateId: string, 
        candidateSkillId: string, 
        updateData: Partial<CreateSkillData>
    ): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/skills/${candidateId}/skills/${candidateSkillId}`, 
            'PUT', 
            updateData
        );
    }

    // Delete skill (soft delete)
    static async deleteSkill(candidateId: string, candidateSkillId: string): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/skills/${candidateId}/skills/${candidateSkillId}`, 
            'DELETE'
        );
    }

    // Restore deleted skill
    static async restoreSkill(candidateId: string, candidateSkillId: string): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/skills/${candidateId}/skills/${candidateSkillId}/restore`, 
            'PATCH'
        );
    }

    // Permanently delete skill
    static async hardDeleteSkill(candidateId: string, candidateSkillId: string): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/skills/${candidateId}/skills/${candidateSkillId}/hard`, 
            'DELETE'
        );
    }
}

// ===========================================
// EDUCATION OPERATIONS
// ===========================================

export class EducationApiClient {
    
    // Get candidate education
    static async getEducation(candidateId: string, includeDeleted: boolean = false) {
        const params = includeDeleted ? '?includeDeleted=true' : '';
        const response = await apiCall<ApiResponse<any[]>>(
            `/candidates/${candidateId}/education${params}`
        );
        return response.data || [];
    }

    // Add education
    static async addEducation(candidateId: string, educationData: CreateEducationData): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/candidates/${candidateId}/education`, 
            'POST', 
            educationData
        );
    }

    // Update education
    static async updateEducation(
        candidateId: string, 
        eduId: string, 
        educationData: CreateEducationData
    ): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/candidates/${candidateId}/education/${eduId}`, 
            'PUT', 
            educationData
        );
    }

    // Delete education (soft delete)
    static async deleteEducation(candidateId: string, eduId: string): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/candidates/${candidateId}/education/${eduId}`, 
            'DELETE'
        );
    }

    // Restore education
    static async restoreEducation(candidateId: string, eduId: string): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/candidates/${candidateId}/education/${eduId}/restore`, 
            'PATCH'
        );
    }

    // Hard delete education
    static async hardDeleteEducation(candidateId: string, eduId: string): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/candidates/${candidateId}/education/${eduId}/hard`, 
            'DELETE'
        );
    }
}

// ===========================================
// EXPERIENCE OPERATIONS
// ===========================================

export class ExperienceApiClient {
    
    // Get candidate experience
    static async getExperience(candidateId: string, includeDeleted: boolean = false) {
        const params = includeDeleted ? '?includeDeleted=true' : '';
        const response = await apiCall<ApiResponse<any[]>>(
            `/candidates/${candidateId}/experience${params}`
        );
        return response.data || [];
    }

    // Add experience
    static async addExperience(candidateId: string, experienceData: CreateExperienceData): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/candidates/${candidateId}/experience`, 
            'POST', 
            experienceData
        );
    }

    // Update experience
    static async updateExperience(
        candidateId: string, 
        expId: string, 
        experienceData: CreateExperienceData
    ): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/candidates/${candidateId}/experience/${expId}`, 
            'PUT', 
            experienceData
        );
    }

    // Delete experience (soft delete)
    static async deleteExperience(candidateId: string, expId: string): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/candidates/${candidateId}/experience/${expId}`, 
            'DELETE'
        );
    }

    // Restore experience
    static async restoreExperience(candidateId: string, expId: string): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/candidates/${candidateId}/experience/${expId}/restore`, 
            'PATCH'
        );
    }

    // Hard delete experience
    static async hardDeleteExperience(candidateId: string, expId: string): Promise<void> {
        await apiCall<ApiResponse<null>>(
            `/candidates/${candidateId}/experience/${expId}/hard`, 
            'DELETE'
        );
    }
}

// ===========================================
// USAGE EXAMPLES
// ===========================================

// Example: Create a new candidate
async function createCandidateExample() {
    try {
        const candidateData: CreateCandidateData = {
            name: "John Doe",
            email: ["john.doe@email.com", "john.doe.work@company.com"],
            birthdate: new Date("1990-01-01"),
            roleApplied: "507f1f77bcf86cd799439012", // Optional job ID
            status: CandidateStatus.APPLIED
        };

        // Assuming you have a file input
        const fileInput = document.getElementById('resume') as HTMLInputElement;
        const resumeFile = fileInput.files?.[0];
        
        if (!resumeFile) {
            throw new Error("Resume file is required");
        }

        const newCandidate = await CandidateApiClient.createCandidate(candidateData, resumeFile);
        console.log("Candidate created:", newCandidate);
        
        return newCandidate;
    } catch (error) {
        console.error("Error creating candidate:", error);
        throw error;
    }
}

// Example: Update candidate status
async function updateCandidateStatusExample(candidateId: string, newStatus: CandidateStatus) {
    try {
        await CandidateApiClient.updateCandidate(candidateId, {
            status: newStatus
        });
        console.log("Candidate status updated successfully");
    } catch (error) {
        console.error("Error updating candidate status:", error);
        throw error;
    }
}

// Example: Add a skill to candidate
async function addSkillExample(candidateId: string) {
    try {
        const skillData: CreateSkillData = {
            skillName: "JavaScript",
            evidence: "5 years of professional experience with React and Node.js",
            score: 8,
            addedBy: AddedBy.HUMAN
        };

        await SkillsApiClient.addSkill(candidateId, skillData);
        console.log("Skill added successfully");
    } catch (error) {
        console.error("Error adding skill:", error);
        throw error;
    }
}

// Example: Add education record
async function addEducationExample(candidateId: string) {
    try {
        const educationData: CreateEducationData = {
            institution: "MIT",
            startDate: new Date("2008-09-01"),
            endDate: new Date("2012-06-15"),
            description: "Bachelor of Science in Computer Science"
        };

        await EducationApiClient.addEducation(candidateId, educationData);
        console.log("Education added successfully");
    } catch (error) {
        console.error("Error adding education:", error);
        throw error;
    }
}

// Example: Get candidate with all data
async function getCandidateFullProfile(candidateId: string) {
    try {
        const [candidate, skills, education, experience] = await Promise.all([
            CandidateApiClient.getCandidate(candidateId),
            SkillsApiClient.getCandidateSkills(candidateId),
            EducationApiClient.getEducation(candidateId),
            ExperienceApiClient.getExperience(candidateId)
        ]);

        return {
            candidate,
            skills,
            education,
            experience
        };
    } catch (error) {
        console.error("Error fetching candidate profile:", error);
        throw error;
    }
}

// Export the examples
export {
    createCandidateExample,
    updateCandidateStatusExample,
    addSkillExample,
    addEducationExample,
    getCandidateFullProfile
};
