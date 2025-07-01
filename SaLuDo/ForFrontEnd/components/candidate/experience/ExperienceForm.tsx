import React, { useState } from 'react';
import { CreateExperienceData } from '../../../types/CandidateApiTypes';
import Modal from '../../common/Modal';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

export interface ExperienceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (experienceData: CreateExperienceData) => Promise<void>;
  initialData?: Partial<CreateExperienceData>;
  mode?: 'create' | 'edit';
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  mode = 'create'
}) => {
  const [formData, setFormData] = useState<CreateExperienceData>({
    title: initialData.title || '',
    company: initialData.company || '',
    startDate: initialData.startDate || new Date(),
    endDate: initialData.endDate || undefined,
    description: initialData.description || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentJob, setIsCurrentJob] = useState(!initialData.endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Job title is required');
      return;
    }

    if (!formData.company.trim()) {
      setError('Company name is required');
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required');
      return;
    }

    if (!isCurrentJob && !formData.endDate) {
      setError('End date is required for past positions');
      return;
    }

    if (!isCurrentJob && formData.endDate && formData.endDate <= formData.startDate) {
      setError('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const submissionData = {
        ...formData,
        endDate: isCurrentJob ? undefined : formData.endDate
      };
      
      await onSubmit(submissionData);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        company: '',
        startDate: new Date(),
        endDate: undefined,
        description: ''
      });
      setIsCurrentJob(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentJobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCurrentJob(e.target.checked);
    if (e.target.checked) {
      setFormData(prev => ({ ...prev, endDate: undefined }));
    }
  };

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add Work Experience' : 'Edit Work Experience'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} />}

        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Senior Software Engineer, Marketing Manager"
            required
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            Company *
          </label>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Google, Microsoft, Acme Corp"
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              value={formatDateForInput(formData.startDate)}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date {!isCurrentJob && '*'}
            </label>
            <input
              type="date"
              id="endDate"
              value={formatDateForInput(formData.endDate)}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isCurrentJob}
              required={!isCurrentJob}
            />
          </div>
        </div>

        {/* Current Job Checkbox */}
        <div className="flex items-center">
          <input
            id="currentJob"
            type="checkbox"
            checked={isCurrentJob}
            onChange={handleCurrentJobChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="currentJob" className="ml-2 block text-sm text-gray-900">
            This is my current position
          </label>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            id="description"
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Describe your responsibilities, achievements, technologies used, team size, etc.&#10;&#10;• Led a team of 5 developers&#10;• Implemented microservices architecture&#10;• Increased system performance by 40%"
          />
          <p className="mt-1 text-xs text-gray-500">
            Use bullet points to highlight key achievements and responsibilities
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size="sm" message="" /> : (mode === 'create' ? 'Add Experience' : 'Update Experience')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExperienceForm;
