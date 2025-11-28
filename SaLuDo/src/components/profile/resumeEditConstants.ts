// Constants for Resume Edit functionality

export const RESUME_SECTION_TYPES = {
  SKILLS: 'skills',
  EXPERIENCE: 'experience',
  EDUCATION: 'education',
  CERTIFICATION: 'certification',
  STRENGTHS: 'strengths',
  WEAKNESSES: 'weaknesses'
} as const;

export const RESUME_SECTION_LABELS = {
  [RESUME_SECTION_TYPES.SKILLS]: 'Skills',
  [RESUME_SECTION_TYPES.EXPERIENCE]: 'Experience',
  [RESUME_SECTION_TYPES.EDUCATION]: 'Education',
  [RESUME_SECTION_TYPES.CERTIFICATION]: 'Certification',
  [RESUME_SECTION_TYPES.STRENGTHS]: 'Strength',
  [RESUME_SECTION_TYPES.WEAKNESSES]: 'Weaknesses'
} as const;

export const EMPTY_MESSAGES = {
  [RESUME_SECTION_TYPES.SKILLS]: 'No skills data available',
  [RESUME_SECTION_TYPES.EXPERIENCE]: 'No experience data available',
  [RESUME_SECTION_TYPES.EDUCATION]: 'No education data available',
  [RESUME_SECTION_TYPES.CERTIFICATION]: 'No certification data available',
  [RESUME_SECTION_TYPES.STRENGTHS]: 'No strengths data available',
  [RESUME_SECTION_TYPES.WEAKNESSES]: 'No weaknesses data available'
} as const;

export const SKILL_SCORE = {
  MIN: 1,
  MAX: 10,
  DEFAULT: 5
} as const;

export const SOURCE_TYPES = {
  AI: 'ai',
  MANUAL: 'manual'
} as const;

export const API_ENDPOINTS = {
  SKILLS: (candidateId: string, skillId?: string) => 
    `/api/candidates/${candidateId}/skills${skillId ? `/${skillId}` : ''}`,
  EXPERIENCE: (candidateId: string, expId?: string) => 
    `/api/candidates/${candidateId}/experience${expId ? `/${expId}` : ''}`,
  EDUCATION: (candidateId: string, eduId?: string) => 
    `/api/candidates/${candidateId}/education${eduId ? `/${eduId}` : ''}`,
  CERTIFICATIONS: (candidateId: string, certId?: string) => 
    `/api/candidates/${candidateId}/certifications${certId ? `/${certId}` : ''}`,
  STRENGTHS_WEAKNESSES: (candidateId: string, id?: string) => 
    `/api/candidates/${candidateId}/strengths-weaknesses${id ? `/${id}` : ''}`
} as const;

export const BUTTON_STYLES = {
  CANCEL: { backgroundColor: '#6b7280' },
  DELETE: { backgroundColor: '#dc2626' },
  ADD: { backgroundColor: '#10b981' }
} as const;

export const INPUT_STYLES = {
  TEXT: {
    width: '100%',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px'
  },
  TEXTAREA: {
    width: '100%',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical' as const
  },
  NUMBER: {
    width: '80px',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px'
  },
  DATE: {
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px'
  }
} as const;
