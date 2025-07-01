import React, { useState } from 'react';
import { Education } from '../../../types/CandidateApiTypes';

interface EducationFormProps {
  candidateId: string;
  education?: Education;
  onSubmit: (education: Omit<Education, '_id' | 'candidateId'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  candidateId,
  education,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    institution: education?.institution || '',
    degree: education?.degree || '',
    fieldOfStudy: education?.fieldOfStudy || '',
    startDate: education?.startDate ? new Date(education.startDate).toISOString().split('T')[0] : '',
    endDate: education?.endDate ? new Date(education.endDate).toISOString().split('T')[0] : '',
    gpa: education?.gpa?.toString() || '',
    honors: education?.honors || '',
    description: education?.description || '',
    isCurrent: education?.endDate ? false : true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    // Auto-clear end date if marking as current
    if (name === 'isCurrent' && checked) {
      setFormData(prev => ({ ...prev, endDate: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.institution.trim()) {
      newErrors.institution = 'Institution is required';
    }

    if (!formData.degree.trim()) {
      newErrors.degree = 'Degree is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.isCurrent && !formData.endDate) {
      newErrors.endDate = 'End date is required for completed education';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.gpa && (isNaN(Number(formData.gpa)) || Number(formData.gpa) < 0 || Number(formData.gpa) > 4.0)) {
      newErrors.gpa = 'GPA must be a number between 0 and 4.0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const educationData: Omit<Education, '_id' | 'candidateId'> = {
      institution: formData.institution.trim(),
      degree: formData.degree.trim(),
      fieldOfStudy: formData.fieldOfStudy.trim() || undefined,
      startDate: new Date(formData.startDate),
      endDate: formData.isCurrent ? undefined : new Date(formData.endDate),
      gpa: formData.gpa ? Number(formData.gpa) : undefined,
      honors: formData.honors.trim() || undefined,
      description: formData.description.trim() || undefined
    };

    try {
      await onSubmit(educationData);
    } catch (error) {
      console.error('Failed to save education:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Institution */}
        <div className="md:col-span-2">
          <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
            Institution *
          </label>
          <input
            type="text"
            id="institution"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.institution ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="University of California, Berkeley"
            disabled={loading}
          />
          {errors.institution && (
            <p className="mt-1 text-sm text-red-600">{errors.institution}</p>
          )}
        </div>

        {/* Degree */}
        <div>
          <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
            Degree *
          </label>
          <input
            type="text"
            id="degree"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.degree ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Bachelor of Science"
            disabled={loading}
          />
          {errors.degree && (
            <p className="mt-1 text-sm text-red-600">{errors.degree}</p>
          )}
        </div>

        {/* Field of Study */}
        <div>
          <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700 mb-1">
            Field of Study
          </label>
          <input
            type="text"
            id="fieldOfStudy"
            name="fieldOfStudy"
            value={formData.fieldOfStudy}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Computer Science"
            disabled={loading}
          />
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.startDate ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>

        {/* Current Education Toggle */}
        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isCurrent"
              name="isCurrent"
              checked={formData.isCurrent}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-700">
              I am currently enrolled in this program
            </label>
          </div>
        </div>

        {/* End Date */}
        {!formData.isCurrent && (
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endDate ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>
        )}

        {/* GPA */}
        <div>
          <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-1">
            GPA
          </label>
          <input
            type="number"
            id="gpa"
            name="gpa"
            value={formData.gpa}
            onChange={handleChange}
            step="0.01"
            min="0"
            max="4.0"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.gpa ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="3.85"
            disabled={loading}
          />
          {errors.gpa && (
            <p className="mt-1 text-sm text-red-600">{errors.gpa}</p>
          )}
        </div>

        {/* Honors */}
        <div className="md:col-span-2">
          <label htmlFor="honors" className="block text-sm font-medium text-gray-700 mb-1">
            Honors & Awards
          </label>
          <input
            type="text"
            id="honors"
            name="honors"
            value={formData.honors}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Summa Cum Laude, Dean's List"
            disabled={loading}
          />
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
            placeholder="Relevant coursework, projects, or additional details..."
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
          {loading ? 'Saving...' : education ? 'Update' : 'Add'} Education
        </button>
      </div>
    </form>
  );
};
