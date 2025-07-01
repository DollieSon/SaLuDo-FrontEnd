import React from 'react';
import { ExperienceData } from '../../../types/CandidateApiTypes';
import ExperienceCard from './ExperienceCard';

export interface ExperienceTimelineProps {
  experiences: ExperienceData[];
  onEdit?: (experience: ExperienceData) => void;
  onDelete?: (experienceId: string) => void;
  showActions?: boolean;
}

const ExperienceTimeline: React.FC<ExperienceTimelineProps> = ({
  experiences,
  onEdit,
  onDelete,
  showActions = true
}) => {
  // Sort experiences by start date (most recent first)
  const sortedExperiences = [...experiences]
    .filter(exp => !exp.isDeleted)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const calculateTotalExperience = () => {
    let totalMonths = 0;
    
    sortedExperiences.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const diffTime = end.getTime() - start.getTime();
      const months = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
      totalMonths += months;
    });
    
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    
    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
    
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  if (sortedExperiences.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No work experience added</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding their first job or internship
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-900">
              Total Work Experience: {calculateTotalExperience()}
            </h3>
            <p className="text-sm text-blue-700">
              {sortedExperiences.length} position{sortedExperiences.length !== 1 ? 's' : ''} across{' '}
              {new Set(sortedExperiences.map(exp => exp.company)).size} compan{new Set(sortedExperiences.map(exp => exp.company)).size !== 1 ? 'ies' : 'y'}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        
        <div className="space-y-8">
          {sortedExperiences.map((experience, index) => {
            const isLast = index === sortedExperiences.length - 1;
            const isCurrent = !experience.endDate;
            
            return (
              <div key={experience.experienceId} className="relative flex items-start space-x-6">
                {/* Timeline dot */}
                <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 ${
                  isCurrent 
                    ? 'bg-green-500 border-green-500' 
                    : 'bg-white border-gray-300'
                } relative z-10`}>
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-8">
                  <ExperienceCard
                    experience={experience}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    showActions={showActions}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Career Progression Insights */}
      {sortedExperiences.length > 1 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Career Progression</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Companies worked at:</span>
              <div className="font-medium text-gray-900">
                {new Set(sortedExperiences.map(exp => exp.company)).size}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Average tenure:</span>
              <div className="font-medium text-gray-900">
                {(() => {
                  const completedJobs = sortedExperiences.filter(exp => exp.endDate);
                  if (completedJobs.length === 0) return 'N/A';
                  
                  const totalMonths = completedJobs.reduce((sum, exp) => {
                    const start = new Date(exp.startDate);
                    const end = new Date(exp.endDate!);
                    const months = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
                    return sum + months;
                  }, 0);
                  
                  const avgMonths = Math.floor(totalMonths / completedJobs.length);
                  const years = Math.floor(avgMonths / 12);
                  const months = avgMonths % 12;
                  
                  if (years === 0) return `${months} months`;
                  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
                  return `${years}y ${months}m`;
                })()}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Current status:</span>
              <div className="font-medium text-gray-900">
                {sortedExperiences.some(exp => !exp.endDate) ? 'Employed' : 'Available'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceTimeline;
