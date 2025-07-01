import React, { useState } from 'react';

interface InterviewSchedulerProps {
  candidateId: string;
  jobId?: string;
  onSchedule: (interviewData: InterviewScheduleData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface InterviewScheduleData {
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'behavioral';
  title: string;
  description?: string;
  scheduledDate: Date;
  duration: number; // in minutes
  location?: string;
  meetingUrl?: string;
  interviewers: string[];
  notes?: string;
}

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  candidateId,
  jobId,
  onSchedule,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    type: 'video' as const,
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: '60',
    location: '',
    meetingUrl: '',
    interviewers: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const interviewTypes = [
    { value: 'phone', label: 'Phone Interview', icon: '📞' },
    { value: 'video', label: 'Video Call', icon: '📹' },
    { value: 'in-person', label: 'In-Person', icon: '🏢' },
    { value: 'technical', label: 'Technical Interview', icon: '💻' },
    { value: 'behavioral', label: 'Behavioral Interview', icon: '🎭' }
  ];

  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-generate title based on type
    if (name === 'type' && !formData.title) {
      const typeOption = interviewTypes.find(t => t.value === value);
      if (typeOption) {
        setFormData(prev => ({
          ...prev,
          title: typeOption.label
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Interview title is required';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Date is required';
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Time is required';
    }

    // Check if scheduled time is in the past
    if (formData.scheduledDate && formData.scheduledTime) {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      if (scheduledDateTime <= new Date()) {
        newErrors.scheduledDate = 'Interview must be scheduled for a future date and time';
      }
    }

    if (formData.type === 'video' && !formData.meetingUrl.trim()) {
      newErrors.meetingUrl = 'Meeting URL is required for video interviews';
    }

    if (formData.type === 'in-person' && !formData.location.trim()) {
      newErrors.location = 'Location is required for in-person interviews';
    }

    if (formData.meetingUrl && !isValidUrl(formData.meetingUrl)) {
      newErrors.meetingUrl = 'Please enter a valid URL';
    }

    if (!formData.interviewers.trim()) {
      newErrors.interviewers = 'At least one interviewer is required';
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

    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    const interviewersList = formData.interviewers
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    const interviewData: InterviewScheduleData = {
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      scheduledDate: scheduledDateTime,
      duration: parseInt(formData.duration),
      location: formData.location.trim() || undefined,
      meetingUrl: formData.meetingUrl.trim() || undefined,
      interviewers: interviewersList,
      notes: formData.notes.trim() || undefined
    };

    try {
      await onSchedule(interviewData);
    } catch (error) {
      console.error('Failed to schedule interview:', error);
    }
  };

  const getDefaultTime = () => {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    return nextHour.toTimeString().slice(0, 5);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Interview Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Interview Type *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {interviewTypes.map((type) => (
            <label
              key={type.value}
              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                formData.type === type.value
                  ? 'border-blue-600 ring-2 ring-blue-600'
                  : 'border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="type"
                value={type.value}
                checked={formData.type === type.value}
                onChange={handleChange}
                className="sr-only"
                disabled={loading}
              />
              <div className="flex items-center text-sm">
                <span className="mr-2 text-lg">{type.icon}</span>
                <span className="font-medium text-gray-900">{type.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Interview Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Technical Interview - Frontend Developer"
            disabled={loading}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="scheduledDate"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.scheduledDate ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.scheduledDate && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
          )}
        </div>

        {/* Time */}
        <div>
          <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
            Time *
          </label>
          <input
            type="time"
            id="scheduledTime"
            name="scheduledTime"
            value={formData.scheduledTime}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.scheduledTime ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.scheduledTime && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Meeting URL for video interviews */}
        {formData.type === 'video' && (
          <div>
            <label htmlFor="meetingUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Meeting URL *
            </label>
            <input
              type="url"
              id="meetingUrl"
              name="meetingUrl"
              value={formData.meetingUrl}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.meetingUrl ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="https://zoom.us/j/..."
              disabled={loading}
            />
            {errors.meetingUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.meetingUrl}</p>
            )}
          </div>
        )}

        {/* Location for in-person interviews */}
        {formData.type === 'in-person' && (
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.location ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="123 Main St, Conference Room A"
              disabled={loading}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>
        )}

        {/* Interviewers */}
        <div className="md:col-span-2">
          <label htmlFor="interviewers" className="block text-sm font-medium text-gray-700 mb-1">
            Interviewers *
          </label>
          <input
            type="text"
            id="interviewers"
            name="interviewers"
            value={formData.interviewers}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.interviewers ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="John Smith, Jane Doe (separate with commas)"
            disabled={loading}
          />
          {errors.interviewers && (
            <p className="mt-1 text-sm text-red-600">{errors.interviewers}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Enter interviewer names separated by commas
          </p>
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
            placeholder="Interview agenda, topics to cover, etc."
            disabled={loading}
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Internal Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Internal notes, preparation checklist, etc."
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
          {loading ? 'Scheduling...' : 'Schedule Interview'}
        </button>
      </div>
    </form>
  );
};
