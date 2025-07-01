import React, { useState, useEffect } from 'react';
import { CandidateData, CandidateStatus } from '../../types/CandidateApiTypes';
import { CandidateApiClient } from '../../clients/CandidateApiClient';

import CandidateStats from './CandidateStats';
import CandidateSearch from './CandidateSearch';
import CandidateList from './CandidateList';
import CandidateForm from './CandidateForm';
import CandidateProfile from './CandidateProfile';
import CandidateActions from './CandidateActions';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

export interface CandidateDashboardProps {
  initialView?: 'list' | 'form' | 'profile';
  candidateId?: string;
}

type ViewType = 'list' | 'form' | 'profile';

const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  initialView = 'list',
  candidateId
}) => {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(candidateId || null);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateData[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'ALL'>('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, searchTerm, statusFilter, roleFilter]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const candidateData = await CandidateApiClient.getAllCandidates();
      setCandidates(candidateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...candidates];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.some(email => email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }

    // Apply role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(candidate => candidate.roleApplied === roleFilter);
    }

    setFilteredCandidates(filtered);
  };

  const handleCandidateSelect = (candidate: CandidateData) => {
    setSelectedCandidateId(candidate.candidateId);
    setCurrentView('profile');
  };

  const handleFormSuccess = (candidateId: string) => {
    loadCandidates(); // Refresh the list
    setSelectedCandidateId(candidateId);
    setCurrentView('profile');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedCandidateId(null);
  };

  const handleNewCandidate = () => {
    setCurrentView('form');
    setSelectedCandidateId(null);
  };

  const handleBulkActionComplete = () => {
    loadCandidates(); // Refresh the list
    setSelectedCandidates([]); // Clear selection
  };

  const handleSelectionClear = () => {
    setSelectedCandidates([]);
  };

  const getAvailableRoles = () => {
    const roles = new Set(candidates.map(c => c.roleApplied).filter(Boolean));
    return Array.from(roles) as string[];
  };

  const renderHeader = () => (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentView === 'list' && 'Candidate Management'}
            {currentView === 'form' && 'Add New Candidate'}
            {currentView === 'profile' && 'Candidate Profile'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {currentView === 'list' && 'Manage and track your candidates'}
            {currentView === 'form' && 'Create a new candidate profile'}
            {currentView === 'profile' && 'View and edit candidate details'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {currentView === 'list' && (
            <button
              onClick={handleNewCandidate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Candidate
            </button>
          )}
          
          {(currentView === 'form' || currentView === 'profile') && (
            <button
              onClick={handleBackToList}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Back to List
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading && currentView === 'list') {
      return <LoadingSpinner size="lg" message="Loading candidates..." />;
    }

    if (error && currentView === 'list') {
      return <ErrorMessage message={error} onRetry={loadCandidates} />;
    }

    switch (currentView) {
      case 'form':
        return (
          <CandidateForm
            onSuccess={handleFormSuccess}
            onCancel={handleBackToList}
          />
        );

      case 'profile':
        if (!selectedCandidateId) {
          return <ErrorMessage message="No candidate selected" />;
        }
        return (
          <CandidateProfile
            candidateId={selectedCandidateId}
            onBack={handleBackToList}
          />
        );

      case 'list':
      default:
        return (
          <div className="space-y-6">
            {/* Statistics */}
            <CandidateStats candidates={candidates} loading={loading} />
            
            {/* Search and Filters */}
            <CandidateSearch
              onSearch={setSearchTerm}
              onStatusFilter={setStatusFilter}
              onRoleFilter={setRoleFilter}
              availableRoles={getAvailableRoles()}
            />
            
            {/* Bulk Actions */}
            <CandidateActions
              selectedCandidates={selectedCandidates}
              onActionComplete={handleBulkActionComplete}
              onSelectionClear={handleSelectionClear}
            />
            
            {/* Candidate List */}
            <CandidateList
              candidates={filteredCandidates}
              onCandidateSelect={handleCandidateSelect}
              selectedCandidates={selectedCandidates}
              onSelectionChange={setSelectedCandidates}
              showBulkActions={true}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default CandidateDashboard;
