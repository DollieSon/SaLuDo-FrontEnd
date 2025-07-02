// Job-related types

export interface JobSkillRequirement {
  skillId: string;
  requiredLevel: number;
  evidence?: string;
  isDeleted?: boolean;
}

export interface Job {
  _id: string;
  jobName: string;
  jobDescription: string;
  skills: JobSkillRequirement[];
  createdAt: string;
  updatedAt: string;
}

export interface JobSummary {
  _id: string;
  jobName: string;
  skillCount: number;
  createdAt: string;
}

export interface JobListResponse {
  success: boolean;
  data: Job[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
