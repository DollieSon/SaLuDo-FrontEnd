import React, { useState, useEffect } from 'react';
import { CandidateData, CandidateStatus } from '../../CandidateApiTypes';
import { CandidateApiClient } from '../../CandidateApiClient';
import CandidateCard from './CandidateCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface CandidateListProps {
  onCandidateSelect?: (candidate: CandidateData) => void;
  filters?: {
    status?: CandidateStatus;
    search?: string;
    roleApplied?: string;
  };
  showActions?: boolean;
}

const CandidateList: React.FC<CandidateListProps> = ({
  onCandidateSelect,
  filters = {},
  showActions = true
}) => {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'ALL'>('ALL');

  const candidateClient = new CandidateApiClient();

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await candidateClient.getAllCandidates();
      
      if (response.success && response.data) {
        setCandidates(response.data);
      } else {
        setError(response.message || 'Failed to load candidates');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (candidateId: string, newStatus: CandidateStatus, reason?: string) => {
    try {
      await candidateClient.updateCandidate(candidateId, { 
        status: newStatus,
        statusChangeReason: reason,
        statusChangeSource: 'manual'
      });
      
      // Update local state
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.candidateId === candidateId 
            ? { ...candidate, status: newStatus }
            : candidate
        )
      );
    } catch (err) {
      console.error('Failed to update candidate status:', err);
      // You might want to show a toast notification here
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        candidate.name.toLowerCase().includes(searchLower) ||
        candidate.email.some(email => email.toLowerCase().includes(searchLower)) ||
        (candidate.roleApplied && candidate.roleApplied.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'ALL' && candidate.status !== statusFilter) {
      return false;
    }

    // Role filter
    if (filters.roleApplied && candidate.roleApplied !== filters.roleApplied) {
      return false;
    }

    return true;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadCandidates} />;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidates</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search candidates
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CandidateStatus | 'ALL')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(CandidateStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <div className="sm:w-auto flex items-end">
            <button
              onClick={loadCandidates}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCandidates.length} of {candidates.length} candidates
        </div>
      </div>

      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No candidates found</div>
          <div className="text-gray-400">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your filters' 
              : 'Start by adding your first candidate'
            }
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.candidateId}
              candidate={candidate}
              onClick={onCandidateSelect}
              onStatusChange={showActions ? handleStatusChange : undefined}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateList;
