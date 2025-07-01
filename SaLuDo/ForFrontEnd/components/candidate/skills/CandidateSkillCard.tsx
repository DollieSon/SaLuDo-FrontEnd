import React from 'react';
import { SkillWithMasterData, AddedBy } from '../../../types/CandidateApiTypes';

export interface CandidateSkillCardProps {
  skill: SkillWithMasterData;
  onEdit?: (skill: SkillWithMasterData) => void;
  onDelete?: (skillId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const CandidateSkillCard: React.FC<CandidateSkillCardProps> = ({
  skill,
  onEdit,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreText = (score: number) => {
    if (score >= 8) return 'Expert';
    if (score >= 6) return 'Proficient';
    if (score >= 4) return 'Intermediate';
    return 'Beginner';
  };

  const getAddedByBadge = (addedBy: AddedBy) => {
    return addedBy === AddedBy.AI ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
        🤖 AI
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
        👤 Manual
      </span>
    );
  };

  if (compact) {
    return (
      <div className="inline-flex items-center bg-gray-50 rounded-full px-3 py-1 text-sm">
        <span className="font-medium text-gray-900">{skill.skillName}</span>
        <div className={`ml-2 w-2 h-2 rounded-full ${getScoreColor(skill.score)}`}></div>
        <span className="ml-1 text-xs text-gray-500">{skill.score}/10</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900">{skill.skillName}</h4>
          <div className="flex items-center space-x-2 mt-1">
            {getAddedByBadge(skill.addedBy)}
            {!skill.isAccepted && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                Unverified
              </span>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(skill)}
                className="text-gray-400 hover:text-blue-600 focus:outline-none"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(skill.candidateSkillId)}
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

      {/* Score */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Proficiency</span>
          <span className="font-medium">{skill.score}/10 - {getScoreText(skill.score)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getScoreColor(skill.score)}`}
            style={{ width: `${(skill.score / 10) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Evidence */}
      {skill.evidence && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 font-medium mb-1">Evidence:</p>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-2 border">
            {skill.evidence}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="mt-3 text-xs text-gray-500">
        Added on {new Date(skill.addedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default CandidateSkillCard;
