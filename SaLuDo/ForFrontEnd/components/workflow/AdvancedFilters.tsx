import React, { useState, useEffect } from 'react';

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: Date;
  isDefault?: boolean;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: Record<string, any>) => void;
  onSaveFilter: (name: string, filters: Record<string, any>) => Promise<void>;
  onLoadFilter: (filterId: string) => Promise<void>;
  onDeleteFilter: (filterId: string) => Promise<void>;
  savedFilters: SavedFilter[];
  availableSkills: string[];
  availableJobs: Array<{ id: string; title: string; company: string }>;
  loading?: boolean;
  className?: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  savedFilters,
  availableSkills,
  availableJobs,
  loading = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const [filters, setFilters] = useState({
    // Basic filters
    name: '',
    email: '',
    status: [],
    jobId: '',
    
    // Date filters
    dateCreatedFrom: '',
    dateCreatedTo: '',
    dateUpdatedFrom: '',
    dateUpdatedTo: '',
    
    // Skill filters
    hasSkills: [],
    skillScoreMin: '',
    skillScoreMax: '',
    aiAddedSkills: '',
    
    // Experience filters
    experienceYearsMin: '',
    experienceYearsMax: '',
    currentRole: '',
    previousCompany: '',
    
    // Education filters
    degree: '',
    institution: '',
    gpaMin: '',
    fieldOfStudy: '',
    
    // Certification filters
    certificationName: '',
    certificationStatus: '',
    
    // Resume filters
    hasResume: '',
    resumeParseStatus: '',
    
    // Interview filters
    hasTranscripts: '',
    personalityScoreMin: '',
    personalityScoreMax: '',
    
    // Advanced filters
    ageMin: '',
    ageMax: '',
    location: '',
    isDeleted: false
  });

  const statusOptions = [
    { value: 'applied', label: 'Applied' },
    { value: 'reference_check', label: 'Reference Check' },
    { value: 'offer', label: 'Offer' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ];

  const certificationStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'expiring_soon', label: 'Expiring Soon' },
    { value: 'expired', label: 'Expired' }
  ];

  const booleanOptions = [
    { value: '', label: 'Any' },
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ];

  const resumeParseStatusOptions = [
    { value: '', label: 'Any' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' }
  ];

  // Update active filters when filters change
  useEffect(() => {
    const active = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    setActiveFilters(active);
    onFiltersChange(active);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMultiSelectChange = (key: string, value: string) => {
    setFilters(prev => {
      const currentValues = prev[key] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [key]: newValues
      };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      name: '',
      email: '',
      status: [],
      jobId: '',
      dateCreatedFrom: '',
      dateCreatedTo: '',
      dateUpdatedFrom: '',
      dateUpdatedTo: '',
      hasSkills: [],
      skillScoreMin: '',
      skillScoreMax: '',
      aiAddedSkills: '',
      experienceYearsMin: '',
      experienceYearsMax: '',
      currentRole: '',
      previousCompany: '',
      degree: '',
      institution: '',
      gpaMin: '',
      fieldOfStudy: '',
      certificationName: '',
      certificationStatus: '',
      hasResume: '',
      resumeParseStatus: '',
      hasTranscripts: '',
      personalityScoreMin: '',
      personalityScoreMax: '',
      ageMin: '',
      ageMax: '',
      location: '',
      isDeleted: false
    });
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) return;
    
    try {
      await onSaveFilter(filterName.trim(), activeFilters);
      setShowSaveDialog(false);
      setFilterName('');
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  };

  const handleLoadFilter = async (filterId: string) => {
    try {
      const savedFilter = savedFilters.find(f => f.id === filterId);
      if (savedFilter) {
        setFilters(prev => ({
          ...prev,
          ...savedFilter.filters
        }));
      }
      await onLoadFilter(filterId);
    } catch (error) {
      console.error('Failed to load filter:', error);
    }
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Advanced Filters</span>
            </button>
            
            {getActiveFilterCount() > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getActiveFilterCount()} active
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Saved Filters Dropdown */}
            {savedFilters.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleLoadFilter(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
                disabled={loading}
              >
                <option value="">Load saved filter...</option>
                {savedFilters.map((filter) => (
                  <option key={filter.id} value={filter.id}>
                    {filter.name} {filter.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            )}

            {/* Save Filter Button */}
            {getActiveFilterCount() > 0 && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                disabled={loading}
              >
                Save Filter
              </button>
            )}

            {/* Clear All Button */}
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by name..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by email..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Job</label>
                <select
                  value={filters.jobId}
                  onChange={(e) => handleFilterChange('jobId', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All jobs</option>
                  {availableJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.company}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City, State..."
                />
              </div>
            </div>

            {/* Status Multi-Select */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <label key={option.value} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.status as string[]).includes(option.value)}
                      onChange={() => handleMultiSelectChange('status', option.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Date Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Date Range</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Created From</label>
                <input
                  type="date"
                  value={filters.dateCreatedFrom}
                  onChange={(e) => handleFilterChange('dateCreatedFrom', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Created To</label>
                <input
                  type="date"
                  value={filters.dateCreatedTo}
                  onChange={(e) => handleFilterChange('dateCreatedTo', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Age Min</label>
                <input
                  type="number"
                  value={filters.ageMin}
                  onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="18"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Age Max</label>
                <input
                  type="number"
                  value={filters.ageMax}
                  onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="65"
                />
              </div>
            </div>
          </div>

          {/* Skills Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Skills & Experience</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Min Score</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={filters.skillScoreMin}
                  onChange={(e) => handleFilterChange('skillScoreMin', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1-10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Max Score</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={filters.skillScoreMax}
                  onChange={(e) => handleFilterChange('skillScoreMax', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1-10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Min Years Experience</label>
                <input
                  type="number"
                  min="0"
                  value={filters.experienceYearsMin}
                  onChange={(e) => handleFilterChange('experienceYearsMin', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Max Years Experience</label>
                <input
                  type="number"
                  min="0"
                  value={filters.experienceYearsMax}
                  onChange={(e) => handleFilterChange('experienceYearsMax', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50"
                />
              </div>
            </div>

            {/* Skills Multi-Select */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">Required Skills</label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableSkills.slice(0, 20).map((skill) => (
                    <label key={skill} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={(filters.hasSkills as string[]).includes(skill)}
                        onChange={() => handleMultiSelectChange('hasSkills', skill)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-xs text-gray-700 truncate">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Education & Certifications */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Education & Certifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Degree</label>
                <input
                  type="text"
                  value={filters.degree}
                  onChange={(e) => handleFilterChange('degree', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bachelor, Master..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Institution</label>
                <input
                  type="text"
                  value={filters.institution}
                  onChange={(e) => handleFilterChange('institution', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="University name..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Min GPA</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  value={filters.gpaMin}
                  onChange={(e) => handleFilterChange('gpaMin', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0-4.0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Certification Status</label>
                <select
                  value={filters.certificationStatus}
                  onChange={(e) => handleFilterChange('certificationStatus', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any status</option>
                  {certificationStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* File & Data Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Files & Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Has Resume</label>
                <select
                  value={filters.hasResume}
                  onChange={(e) => handleFilterChange('hasResume', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {booleanOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Resume Parse Status</label>
                <select
                  value={filters.resumeParseStatus}
                  onChange={(e) => handleFilterChange('resumeParseStatus', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {resumeParseStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Has Transcripts</label>
                <select
                  value={filters.hasTranscripts}
                  onChange={(e) => handleFilterChange('hasTranscripts', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {booleanOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">AI Added Skills</label>
                <select
                  value={filters.aiAddedSkills}
                  onChange={(e) => handleFilterChange('aiAddedSkills', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {booleanOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowSaveDialog(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Save Filter
                </h3>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter Name
                  </label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter filter name..."
                    autoFocus
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveFilter}
                  disabled={!filterName.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
