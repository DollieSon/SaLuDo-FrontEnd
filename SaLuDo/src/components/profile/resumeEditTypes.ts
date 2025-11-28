// Types for Resume Edit functionality

export interface EditableSkill {
  candidateSkillId?: string;
  skillId?: string;
  skillName: string;
  score: number;
  evidence: string;
  source: 'ai' | 'manual';
  isAccepted?: boolean;
}

export interface EditableExperience {
  experienceId?: string;
  description: string;
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  source: 'ai' | 'manual';
}

export interface EditableEducation {
  educationId?: string;
  description: string;
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  graduationDate?: string;
  source: 'ai' | 'manual';
}

export interface EditableCertification {
  certificationId?: string;
  description: string;
  certificationName?: string;
  issuingOrganization?: string;
  issueDate?: string;
  expirationDate?: string;
  source: 'ai' | 'manual';
}

export interface EditableStrengthWeakness {
  strengthWeaknessId?: string;
  description: string;
  type: 'strength' | 'weakness';
  source: 'ai' | 'manual';
}

export interface ResumeEditData {
  skills: EditableSkill[];
  experience: EditableExperience[];
  education: EditableEducation[];
  certification: EditableCertification[];
  strengths: EditableStrengthWeakness[];
  weaknesses: EditableStrengthWeakness[];
}

export type ResumeSectionType = 'skills' | 'experience' | 'education' | 'certification' | 'strengths' | 'weaknesses';
