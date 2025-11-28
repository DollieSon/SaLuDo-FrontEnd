// Candidate profile types

export interface ProfileItem {
  text: string;
  score?: number;
  skillName?: string;
  evidence?: string;
  addedBy?: string;
  title?: string;
  role?: string;
  institution?: string;
  name?: string;
  issuingOrganization?: string;
  issueDate?: Date | string;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface ResumeMetadata {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  parsedAt?: string;
  parseStatus?: "pending" | "completed" | "failed" | "not_started";
  textContent?: string;
}

export interface TranscriptMetadata {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  transcribedAt?: string;
  transcriptionStatus?: "pending" | "completed" | "failed" | "not_started";
  textContent?: string;
  interviewRound?: string;
  duration?: number;
}

export interface VideoMetadata {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  duration?: number;
  resolution?: string;
  interviewRound?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface CandidateProfile {
  candidateId: string;
  name: string;
  email: string[];
  birthdate: string;
  dateCreated: string;
  dateUpdated: string;
  roleApplied: string | null;
  status: string;
  isDeleted: boolean;
  socialLinks?: SocialLink[];
  resume?: ResumeMetadata; // Backend returns this as 'resume'
  resumeMetadata?: ResumeMetadata; // For backward compatibility
  transcripts?: TranscriptMetadata[];
  interviewVideos?: VideoMetadata[];
  introductionVideos?: VideoMetadata[];
  
  skills: Array<{
    skillId: string;
    skillName: string;
    source: "ai" | "manual";
    score?: number;
    evidence?: string;
    isAccepted?: boolean;
    addedBy?: 'AI' | 'HUMAN';
  }>;
  
  experience: Array<{
    experienceId: string;
    source: "ai" | "manual";
    description: string;
    title?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    addedBy?: 'AI' | 'HUMAN';
  }>;
  
  education: Array<{
    educationId: string;
    source: "ai" | "manual";
    description: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
    addedBy?: 'AI' | 'HUMAN';
  }>;
  
  certification: Array<{
    certificationId: string;
    source: "ai" | "manual";
    description: string;
    name?: string;
    certificationName?: string;
    issuingOrganization?: string;
    issueDate?: string;
    addedBy?: 'AI' | 'HUMAN';
  }>;
  
  strengths: Array<{
    strengthWeaknessId: string;
    source: "ai" | "manual";
    description: string;
    type: "strength";
    name?: string;
    addedBy?: 'AI' | 'HUMAN';
  }>;
  
  weaknesses: Array<{
    strengthWeaknessId: string;
    source: "ai" | "manual";
    description: string;
    type: "weakness";
    name?: string;
    addedBy?: 'AI' | 'HUMAN';
  }>;
  
  resumeAssessment?: string;
  interviewAssessment?: string;
  // Add these optional job matching properties
  jobMatchScore?: number;
  matchedSkills?: number;
  totalJobSkills?: number;
  missingSkills?: string[];
}

export interface PersonalityTrait {
  trait: string;
  value: number;
  breakdown: Array<{
    sub: string;
    score: number;
  }>;
}

export interface BackendTrait {
  traitName: string;
  score: number;
  evidence: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalityData {
  cognitiveAndProblemSolving?: {
    [key: string]: BackendTrait;
  };
  communicationAndTeamwork?: {
    [key: string]: BackendTrait;
  };
  workEthicAndReliability?: {
    [key: string]: BackendTrait;
  };
  growthAndLeadership?: {
    [key: string]: BackendTrait;
  };
  cultureAndPersonalityFit?: {
    [key: string]: BackendTrait;
  };
  bonusTraits?: {
    [key: string]: BackendTrait;
  };
}

export interface ProfileData {
  candidate: CandidateProfile;
  personality?: PersonalityData;
}
