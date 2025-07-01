// Candidate Components
export { default as CandidateCard } from './candidate/CandidateCard';
export { default as CandidateList } from './candidate/CandidateList';
export { default as CandidateForm } from './candidate/CandidateForm';
export { default as CandidateProfile } from './candidate/CandidateProfile';
export { default as CandidateSearch } from './candidate/CandidateSearch';
export { default as CandidateActions } from './candidate/CandidateActions';
export { default as CandidateStats } from './candidate/CandidateStats';
export { default as CandidateDashboard } from './candidate/CandidateDashboard';

// Skill Management Components
export { default as CandidateSkillCard } from './candidate/skills/CandidateSkillCard';
export { default as CandidateSkillForm } from './candidate/skills/CandidateSkillForm';
export { default as CandidateSkillList } from './candidate/skills/CandidateSkillList';

// Experience Management Components
export { default as ExperienceCard } from './candidate/experience/ExperienceCard';
export { default as ExperienceForm } from './candidate/experience/ExperienceForm';
export { default as ExperienceTimeline } from './candidate/experience/ExperienceTimeline';

// Education Management Components
export { default as EducationCard } from './candidate/education/EducationCard';
export { EducationForm } from './candidate/education/EducationForm';
export { EducationList } from './candidate/education/EducationList';

// Certification Management Components
export { CertificationCard } from './candidate/certifications/CertificationCard';
export { CertificationForm } from './candidate/certifications/CertificationForm';
export { CertificationList } from './candidate/certifications/CertificationList';

// Resume Components
export { default as ResumeUpload } from './candidate/resume/ResumeUpload';

// Interview Management Components
export { default as TranscriptViewer } from './candidate/interviews/TranscriptViewer';
export { default as TranscriptUpload } from './candidate/interviews/TranscriptUpload';
export { InterviewScheduler } from './candidate/interviews/InterviewScheduler';
export { InterviewHistory } from './candidate/interviews/InterviewHistory';

// Analytics Components
export { PipelineAnalytics } from './analytics/PipelineAnalytics';
export { SkillAnalytics } from './analytics/SkillAnalytics';
export { default as AdvancedAnalytics } from './analytics/AdvancedAnalytics';

// Workflow Components
export { CandidateBulkActions } from './workflow/CandidateBulkActions';
export { AdvancedFilters } from './workflow/AdvancedFilters';
export { default as PipelineAutomation } from './workflow/PipelineAutomation';
export { default as ApprovalFlows } from './workflow/ApprovalFlows';
export { default as NotificationSystem } from './workflow/NotificationSystem';

// Form Components
export { default as ScoreInput } from './forms/ScoreInput';
export { default as AutoComplete } from './forms/AutoComplete';

// Common Components
export { default as LoadingSpinner } from './common/LoadingSpinner';
export { default as ErrorMessage } from './common/ErrorMessage';
export { default as ConfirmDialog } from './common/ConfirmDialog';
export { default as Modal } from './common/Modal';
export { StatusChangeDialog } from './common/StatusChangeDialog';
export { ActivityFeed } from './common/ActivityFeed';

// Advanced Types for Workflow Components
export type {
  AutomationRule,
  AutomationTrigger,
  AutomationAction,
  AutomationCondition
} from './workflow/PipelineAutomation';

export type {
  ApprovalRequest,
  ApprovalStep,
  ApprovalFlow,
  ApprovalComment
} from './workflow/ApprovalFlows';

export type {
  Notification,
  NotificationAction,
  NotificationSettings
} from './workflow/NotificationSystem';

export type {
  DiversityMetrics,
  HiringMetrics,
  FunnelMetrics,
  AdvancedAnalyticsData
} from './analytics/AdvancedAnalytics';
