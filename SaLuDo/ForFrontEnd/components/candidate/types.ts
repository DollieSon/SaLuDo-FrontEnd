import { CandidateData, CandidateStatus, CreateCandidateData } from '../../types/CandidateApiTypes';

export interface CandidateCardProps {
  candidate: CandidateData;
  onClick?: (candidate: CandidateData) => void;
  onStatusChange?: (candidateId: string, status: CandidateStatus) => void;
  showActions?: boolean;
}

export interface CandidateListProps {
  onCandidateSelect?: (candidate: CandidateData) => void;
  filters?: {
    status?: CandidateStatus;
    search?: string;
    roleApplied?: string;
  };
  showActions?: boolean;
}

export interface CandidateFormProps {
  onSuccess?: (candidateId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateCandidateData>;
}

export interface CandidateProfileProps {
  candidateId: string;
  onEdit?: () => void;
  onBack?: () => void;
}

export interface CandidateSearchProps {
  onSearch: (searchTerm: string) => void;
  onStatusFilter: (status: CandidateStatus | 'ALL') => void;
  onRoleFilter: (role: string) => void;
  placeholder?: string;
  availableRoles?: string[];
}

export interface CandidateActionsProps {
  selectedCandidates: CandidateData[];
  onActionComplete: () => void;
  onSelectionClear: () => void;
}

export interface CandidateStatsProps {
  candidates: CandidateData[];
  loading?: boolean;
}

export interface CandidateDashboardProps {
  initialView?: 'list' | 'form' | 'profile';
  candidateId?: string;
}
