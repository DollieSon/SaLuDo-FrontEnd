import React, { useState } from 'react';
import { CreateCandidateData, CandidateStatus } from '../../CandidateApiTypes';
import { CandidateApiClient } from '../../CandidateApiClient';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface CandidateFormProps {
  onSuccess?: (candidateId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateCandidateData>;
}

const CandidateForm: React.FC<CandidateFormProps> = ({
  onSuccess,
  onCancel,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<CreateCandidateData>({
    name: initialData.name || '',
    email: initialData.email || [''],
    birthdate: initialData.birthdate || new Date(),
    roleApplied: initialData.roleApplied || null,
    status: initialData.status || CandidateStatus.APPLIED
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const candidateClient = new CandidateApiClient();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    // Email validation
    if (!formData.email[0] || !formData.email[0].trim()) {
      errors.email = 'At least one email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email[0])) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Birthdate validation
    const today = new Date();
    const birthDate = new Date(formData.birthdate);
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 16 || age > 100) {
      errors.birthdate = 'Please enter a valid birthdate (age 16-100)';
    }

    // Resume file validation (optional but if provided, must be valid)
    if (resumeFile) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(resumeFile.type)) {
        errors.resume = 'Resume must be a PDF or Word document';
      }
      
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (resumeFile.size > maxSize) {
        errors.resume = 'Resume file size must not exceed 10MB';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof CreateCandidateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...formData.email];
    newEmails[index] = value;
    handleInputChange('email', newEmails);
  };

  const addEmailField = () => {
    handleInputChange('email', [...formData.email, '']);
  };

  const removeEmailField = (index: number) => {
    if (formData.email.length > 1) {
      const newEmails = formData.email.filter((_, i) => i !== index);
      handleInputChange('email', newEmails);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await candidateClient.createCandidate(formData, resumeFile);
      
      if (response.success && response.data) {
        onSuccess?.(response.data.candidateId);
      } else {
        setError(response.message || 'Failed to create candidate');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Creating candidate..." />;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Candidate</h2>
      
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter candidate's full name"
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>

        {/* Email Addresses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Addresses *
          </label>
          {formData.email.map((email, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {formData.email.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEmailField(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addEmailField}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add another email
          </button>
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
          )}
        </div>

        {/* Birthdate */}
        <div>
          <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            id="birthdate"
            value={formData.birthdate.toISOString().split('T')[0]}
            onChange={(e) => handleInputChange('birthdate', new Date(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.birthdate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.birthdate && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.birthdate}</p>
          )}
        </div>

        {/* Role Applied */}
        <div>
          <label htmlFor="roleApplied" className="block text-sm font-medium text-gray-700 mb-1">
            Role Applied For
          </label>
          <input
            type="text"
            id="roleApplied"
            value={formData.roleApplied || ''}
            onChange={(e) => handleInputChange('roleApplied', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Software Engineer, Product Manager"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Initial Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as CandidateStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(CandidateStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Resume Upload */}
        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
            Resume Upload
          </label>
          <input
            type="file"
            id="resume"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.resume ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <p className="mt-1 text-sm text-gray-500">
            Upload PDF or Word document (max 10MB). Resume will be automatically parsed to extract skills and experience.
          </p>
          {validationErrors.resume && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.resume}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Candidate
          </button>
        </div>
      </form>
    </div>
  );
};

export default CandidateForm;
