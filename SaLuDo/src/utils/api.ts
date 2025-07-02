import { Data } from '../types/data'

// Get API URL from environment variables with fallback
const getApiUrl = (): string => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  return envApiUrl || 'http://localhost:3000/api/';
};

export async function fetchApiData(): Promise<Data | null> {
  const response = await fetch(`${getApiUrl()}data`)
  if (!response.ok) return null
  return response.json()
}

export const apiUrl: string = getApiUrl();

// Skills API functions
export const skillsApi = {
  // Get all master skills - AVAILABLE: GET /api/skills
  getAllMasterSkills: async () => {
    const response = await fetch(`${apiUrl}skills`);
    if (!response.ok) throw new Error('Failed to fetch skills');
    return response.json();
  },

  // Get single skill master data - AVAILABLE: GET /api/skills/master/:skillId
  getSkillMaster: async (skillId: string) => {
    const response = await fetch(`${apiUrl}skills/master/${skillId}`);
    if (!response.ok) throw new Error('Failed to fetch skill');
    return response.json();
  },

  // Update skill master data - AVAILABLE: PUT /api/skills/master/:skillId
  updateSkillMaster: async (skillId: string, updates: { skillName?: string; isAccepted?: boolean }) => {
    const response = await fetch(`${apiUrl}skills/master/${skillId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update skill');
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
    const response = await fetch(`${apiUrl}skills/search/${encodeURIComponent(skillName)}`);
    if (!response.ok) throw new Error('Failed to search skills');
    return response.json();
  },

  // Get candidates with specific skill - AVAILABLE: GET /api/skills/candidates/:skillName
  getCandidatesWithSkill: async (skillName: string) => {
    const response = await fetch(`${apiUrl}skills/candidates/${encodeURIComponent(skillName)}`);
    if (!response.ok) throw new Error('Failed to get candidates with skill');
    return response.json();
  },

  // Merge skills - AVAILABLE: POST /api/skills/master/merge
  mergeSkills: async (targetSkillId: string, sourceSkillIds: string[]) => {
    const response = await fetch(`${apiUrl}skills/master/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetSkillId, sourceSkillIds })
    });
    if (!response.ok) throw new Error('Failed to merge skills');
    return response.json();
  }
};

// Note: The backend doesn't have direct endpoints for:
// - Creating new skill masters (they're created automatically via getOrCreate when added to candidates)
// - Deleting skill masters (only soft delete by setting isAccepted: false)
// - Merging skills (would need to be implemented)

// Job API functions
export const jobsApi = {
  // Get all jobs
  getAllJobs: async () => {
    const response = await fetch(`${apiUrl}jobs?limit=1000`); // Set high limit to get all jobs
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  },

  // Get single job with skill names
  getJob: async (jobId: string, includeSkillNames: boolean = true) => {
    const response = await fetch(`${apiUrl}jobs/${jobId}?includeSkillNames=${includeSkillNames}`);
    if (!response.ok) throw new Error('Failed to fetch job');
    return response.json();
  },

  // Create new job
  createJob: async (jobData: any) => {
    const response = await fetch(`${apiUrl}jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    if (!response.ok) throw new Error('Failed to create job');
    return response.json();
  },

  // Update job
  updateJob: async (jobId: string, updates: any) => {
    const response = await fetch(`${apiUrl}jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update job');
    return response.json();
  },

  // Delete job
  deleteJob: async (jobId: string) => {
    const response = await fetch(`${apiUrl}jobs/${jobId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete job');
    return response.json();
  },

  // Add skill to job
  addSkillToJob: async (jobId: string, skillData: { skillId: string; requiredLevel: number; evidence?: string }) => {
    const response = await fetch(`${apiUrl}jobs/${jobId}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skillData)
    });
    if (!response.ok) throw new Error('Failed to add skill to job');
    return response.json();
  },

  // Remove skill from job
  removeSkillFromJob: async (jobId: string, skillId: string) => {
    const response = await fetch(`${apiUrl}jobs/${jobId}/skills/${skillId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove skill from job');
    return response.json();
  }
};

// Candidate API functions
export const candidatesApi = {
  // Get all candidates
  getAllCandidates: async () => {
    const response = await fetch(`${apiUrl}candidates`);
    if (!response.ok) throw new Error('Failed to fetch candidates');
    return response.json();
  },

  // Create new candidate
  createCandidate: async (formData: FormData) => {
    const response = await fetch(`${apiUrl}candidates`, {
      method: 'POST',
      body: formData // Don't set Content-Type header, let browser set it for FormData
    });
    if (!response.ok) throw new Error('Failed to create candidate');
    return response.json();
  },

  // Get single candidate by ID
  getCandidateById: async (candidateId: string) => {
    const response = await fetch(`${apiUrl}candidates/${candidateId}`);
    if (!response.ok) throw new Error('Failed to fetch candidate');
    return response.json();
  },

  // Get candidate personality data
  getCandidatePersonality: async (candidateId: string) => {
    const response = await fetch(`${apiUrl}candidates/${candidateId}/personality`);
    if (!response.ok) throw new Error('Failed to fetch candidate personality');
    return response.json();
  },

  // Update candidate information
  updateCandidate: async (candidateId: string, updates: any) => {
    const response = await fetch(`${apiUrl}candidates/${candidateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update candidate');
    return response.json();
  },

  // Upload transcript file
  uploadTranscript: async (candidateId: string, formData: FormData) => {
    const response = await fetch(`${apiUrl}candidates/${candidateId}/transcripts`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload transcript');
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
};