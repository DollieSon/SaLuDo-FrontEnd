import React, { useState } from 'react';
import { Certification } from '../../../types/CandidateApiTypes';

interface CertificationFormProps {
  candidateId: string;
  certification?: Certification;
  onSubmit: (certification: Omit<Certification, '_id' | 'candidateId'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const CertificationForm: React.FC<CertificationFormProps> = ({
  candidateId,
  certification,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: certification?.name || '',
    issuingOrganization: certification?.issuingOrganization || '',
    issueDate: certification?.issueDate ? new Date(certification.issueDate).toISOString().split('T')[0] : '',
    expirationDate: certification?.expirationDate ? new Date(certification.expirationDate).toISOString().split('T')[0] : '',
    credentialId: certification?.credentialId || '',
    credentialUrl: certification?.credentialUrl || '',
    description: certification?.description || '',
    neverExpires: !certification?.expirationDate
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-clear expiration date if marking as never expires
    if (name === 'neverExpires' && checked) {
      setFormData(prev => ({ ...prev, expirationDate: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Certification name is required';
    }

    if (!formData.issuingOrganization.trim()) {
      newErrors.issuingOrganization = 'Issuing organization is required';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }

    if (!formData.neverExpires && !formData.expirationDate) {
      newErrors.expirationDate = 'Expiration date is required unless certification never expires';
    }

    if (formData.issueDate && formData.expirationDate && new Date(formData.issueDate) > new Date(formData.expirationDate)) {
      newErrors.expirationDate = 'Expiration date must be after issue date';
    }

    if (formData.credentialUrl && !isValidUrl(formData.credentialUrl)) {
      newErrors.credentialUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const certificationData: Omit<Certification, '_id' | 'candidateId'> = {
      name: formData.name.trim(),
      issuingOrganization: formData.issuingOrganization.trim(),
      issueDate: new Date(formData.issueDate),
      expirationDate: formData.neverExpires ? undefined : new Date(formData.expirationDate),
      credentialId: formData.credentialId.trim() || undefined,
      credentialUrl: formData.credentialUrl.trim() || undefined,
      description: formData.description.trim() || undefined
    };

    try {
      await onSubmit(certificationData);
    } catch (error) {
      console.error('Failed to save certification:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certification Name */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Certification Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="AWS Certified Solutions Architect"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Issuing Organization */}
        <div className="md:col-span-2">
          <label htmlFor="issuingOrganization" className="block text-sm font-medium text-gray-700 mb-1">
            Issuing Organization *
          </label>
          <input
            type="text"
            id="issuingOrganization"
            name="issuingOrganization"
            value={formData.issuingOrganization}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.issuingOrganization ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Amazon Web Services"
            disabled={loading}
          />
          {errors.issuingOrganization && (
            <p className="mt-1 text-sm text-red-600">{errors.issuingOrganization}</p>
          )}
        </div>

        {/* Issue Date */}
        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Issue Date *
          </label>
          <input
            type="date"
            id="issueDate"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.issueDate ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.issueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.issueDate}</p>
          )}
        </div>

        {/* Never Expires Toggle */}
        <div className="flex items-center justify-center">
          <div className="flex items-center h-full">
            <input
              type="checkbox"
              id="neverExpires"
              name="neverExpires"
              checked={formData.neverExpires}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="neverExpires" className="ml-2 block text-sm text-gray-700">
              This certification never expires
            </label>
          </div>
        </div>

        {/* Expiration Date */}
        {!formData.neverExpires && (
          <div className="md:col-span-2">
            <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date *
            </label>
            <input
              type="date"
              id="expirationDate"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.expirationDate ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.expirationDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expirationDate}</p>
            )}
          </div>
        )}

        {/* Credential ID */}
        <div>
          <label htmlFor="credentialId" className="block text-sm font-medium text-gray-700 mb-1">
            Credential ID
          </label>
          <input
            type="text"
            id="credentialId"
            name="credentialId"
            value={formData.credentialId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="AWS-SAA-12345"
            disabled={loading}
          />
        </div>

        {/* Credential URL */}
        <div>
          <label htmlFor="credentialUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Credential URL
          </label>
          <input
            type="url"
            id="credentialUrl"
            name="credentialUrl"
            value={formData.credentialUrl}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.credentialUrl ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="https://credly.com/badges/..."
            disabled={loading}
          />
          {errors.credentialUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.credentialUrl}</p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional details about this certification..."
            disabled={loading}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : certification ? 'Update' : 'Add'} Certification
        </button>
      </div>
    </form>
  );
};
