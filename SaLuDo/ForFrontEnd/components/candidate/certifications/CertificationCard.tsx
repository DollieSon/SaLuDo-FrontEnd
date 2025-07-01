import React from 'react';
import { Certification } from '../../../types/CandidateApiTypes';

interface CertificationCardProps {
  certification: Certification;
  onEdit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
  className?: string;
}

export const CertificationCard: React.FC<CertificationCardProps> = ({
  certification,
  onEdit,
  onDelete,
  loading = false,
  className = ''
}) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const isExpiringSoon = () => {
    if (!certification.expirationDate) return false;
    const expirationDate = new Date(certification.expirationDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expirationDate <= threeMonthsFromNow;
  };

  const isExpired = () => {
    if (!certification.expirationDate) return false;
    return new Date(certification.expirationDate) < new Date();
  };

  const getStatusBadge = () => {
    if (isExpired()) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      );
    }
    if (isExpiringSoon()) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Expiring Soon
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-lg font-medium text-gray-900 truncate">
                {certification.name}
              </h4>
              {certification.issuingOrganization && (
                <p className="text-sm text-gray-600 mt-1">
                  Issued by {certification.issuingOrganization}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              {getStatusBadge()}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            {/* Issue Date */}
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                Issued: {formatDate(certification.issueDate)}
                {certification.expirationDate && (
                  <> • Expires: {formatDate(certification.expirationDate)}</>
                )}
              </span>
            </div>

            {/* Credential ID */}
            {certification.credentialId && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>ID: {certification.credentialId}</span>
              </div>
            )}

            {/* Credential URL */}
            {certification.credentialUrl && (
              <div className="flex items-center text-sm">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <a
                  href={certification.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View Credential
                </a>
              </div>
            )}

            {/* Description */}
            {certification.description && (
              <div className="mt-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {certification.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="ml-4 flex space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md disabled:opacity-50"
                title="Edit certification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md disabled:opacity-50"
                title="Delete certification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
