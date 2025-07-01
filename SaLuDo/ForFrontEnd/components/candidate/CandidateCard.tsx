import React from 'react';
import { CandidateData, CandidateStatus } from '../../CandidateApiTypes';

interface CandidateCardProps {
  candidate: CandidateData;
  onClick?: (candidate: CandidateData) => void;
  onStatusChange?: (candidateId: string, status: CandidateStatus) => void;
  showActions?: boolean;
}

const statusColors = {
  [CandidateStatus.APPLIED]: 'bg-blue-100 text-blue-800',
  [CandidateStatus.REFERENCE_CHECK]: 'bg-yellow-100 text-yellow-800',
  [CandidateStatus.OFFER]: 'bg-purple-100 text-purple-800',
  [CandidateStatus.HIRED]: 'bg-green-100 text-green-800',
  [CandidateStatus.REJECTED]: 'bg-red-100 text-red-800',
  [CandidateStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800',
};

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onClick,
  onStatusChange,
  showActions = true
}) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newStatus = e.target.value as CandidateStatus;
    onStatusChange?.(candidate.candidateId, newStatus);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={() => onClick?.(candidate)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{candidate.name}</h3>
          <p className="text-gray-600">{candidate.email[0]}</p>
          {candidate.roleApplied && (
            <p className="text-sm text-blue-600 font-medium">Applied for: {candidate.roleApplied}</p>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[candidate.status]}`}>
            {candidate.status}
          </span>
          <span className="text-xs text-gray-500">
            Applied: {formatDate(candidate.dateCreated)}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-600">{candidate.skills?.length || 0}</div>
          <div className="text-xs text-gray-600">Skills</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-lg font-bold text-green-600">{candidate.experience?.length || 0}</div>
          <div className="text-xs text-gray-600">Experience</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-lg font-bold text-purple-600">{candidate.education?.length || 0}</div>
          <div className="text-xs text-gray-600">Education</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-lg font-bold text-orange-600">{candidate.certification?.length || 0}</div>
          <div className="text-xs text-gray-600">Certs</div>
        </div>
      </div>

      {/* Top Skills Preview */}
      {candidate.skills && candidate.skills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Top Skills</h4>
          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 6).map((skill, index) => (
              <span
                key={`${skill.candidateSkillId}-${index}`}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {skill.skillId} ({skill.score}/10)
              </span>
            ))}
            {candidate.skills.length > 6 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{candidate.skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Resume Status */}
      {candidate.resumeMetadata && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Resume uploaded ({(candidate.resumeMetadata.size / 1024 / 1024).toFixed(1)}MB)
            </span>
            {candidate.resumeMetadata.parseStatus && (
              <span className={`px-2 py-1 text-xs rounded ${
                candidate.resumeMetadata.parseStatus === 'completed' ? 'bg-green-100 text-green-800' :
                candidate.resumeMetadata.parseStatus === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {candidate.resumeMetadata.parseStatus}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Handle view details
              }}
            >
              View Details
            </button>
            <button
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Handle edit
              }}
            >
              Edit
            </button>
          </div>
          
          {onStatusChange && (
            <select
              value={candidate.status}
              onChange={handleStatusChange}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            >
              {Object.values(CandidateStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateCard;
