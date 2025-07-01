import React, { useState } from 'react';
import { CandidateStatus } from '../../types/CandidateApiTypes';

export interface CandidateSearchProps {
  onSearch: (searchTerm: string) => void;
  onStatusFilter: (status: CandidateStatus | 'ALL') => void;
  onRoleFilter: (role: string) => void;
  placeholder?: string;
  availableRoles?: string[];
}

const CandidateSearch: React.FC<CandidateSearchProps> = ({
  onSearch,
  onStatusFilter,
  onRoleFilter,
  placeholder = "Search candidates by name, email, or skills...",
  availableRoles = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'ALL'>('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as CandidateStatus | 'ALL';
    setStatusFilter(value);
    onStatusFilter(value);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setRoleFilter(value);
    onRoleFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setRoleFilter('ALL');
    onSearch('');
    onStatusFilter('ALL');
    onRoleFilter('ALL');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Candidates
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder={placeholder}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={handleStatusChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value={CandidateStatus.APPLIED}>Applied</option>
            <option value={CandidateStatus.REFERENCE_CHECK}>Reference Check</option>
            <option value={CandidateStatus.OFFER}>Offer</option>
            <option value={CandidateStatus.HIRED}>Hired</option>
            <option value={CandidateStatus.REJECTED}>Rejected</option>
            <option value={CandidateStatus.WITHDRAWN}>Withdrawn</option>
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            id="role"
            value={roleFilter}
            onChange={handleRoleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="ALL">All Roles</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters & Clear Button */}
      {(searchTerm || statusFilter !== 'ALL' || roleFilter !== 'ALL') && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {statusFilter}
              </span>
            )}
            {roleFilter !== 'ALL' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Role: {roleFilter}
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateSearch;
