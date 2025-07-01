import React from 'react';
import { EducationData } from '../../../types/CandidateApiTypes';

export interface EducationCardProps {
  education: EducationData;
  onEdit?: (education: EducationData) => void;
  onDelete?: (educationId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const EducationCard: React.FC<EducationCardProps> = ({
  education,
  onEdit,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const calculateDuration = () => {
    const start = new Date(education.startDate);
    const end = education.endDate ? new Date(education.endDate) : new Date();
    
    const diffTime = end.getTime() - start.getTime();
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    }
    
    const years = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  if (compact) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm">{education.institution}</h4>
            <p className="text-xs text-gray-500">
              {formatDate(education.startDate)} - {education.endDate ? formatDate(education.endDate) : 'Present'}
            </p>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {calculateDuration()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start space-x-3">
            {/* Institution Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{education.institution}</h3>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(education.startDate)} - {education.endDate ? formatDate(education.endDate) : 'Present'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {calculateDuration()}
                </div>
                {!education.endDate && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Current
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(education)}
                className="text-gray-400 hover:text-blue-600 focus:outline-none"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(education.educationId)}
                className="text-gray-400 hover:text-red-600 focus:outline-none"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {education.description && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
          <div className="text-sm text-gray-700 bg-gray-50 rounded-md p-3 border">
            {education.description.split('\n').map((line, index) => (
              <p key={index} className={index > 0 ? 'mt-2' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Added on {new Date(education.createdAt).toLocaleDateString()}</span>
        {education.updatedAt && new Date(education.updatedAt).getTime() !== new Date(education.createdAt).getTime() && (
          <span>Updated on {new Date(education.updatedAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

export default EducationCard;
