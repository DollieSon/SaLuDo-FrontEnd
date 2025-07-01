import React from 'react';

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface PipelineAnalyticsProps {
  stages: PipelineStage[];
  totalCandidates: number;
  loading?: boolean;
  className?: string;
}

export const PipelineAnalytics: React.FC<PipelineAnalyticsProps> = ({
  stages,
  totalCandidates,
  loading = false,
  className = ''
}) => {
  const calculatePercentage = (count: number) => {
    return totalCandidates > 0 ? ((count / totalCandidates) * 100).toFixed(1) : '0';
  };

  const getConversionRate = (currentIndex: number) => {
    if (currentIndex === 0) return '100.0';
    const previousStage = stages[currentIndex - 1];
    const currentStage = stages[currentIndex];
    if (previousStage.count === 0) return '0';
    return ((currentStage.count / previousStage.count) * 100).toFixed(1);
  };

  const getBarWidth = (count: number) => {
    if (totalCandidates === 0) return '0%';
    return `${(count / totalCandidates) * 100}%`;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Recruitment Pipeline
        </h3>
        <div className="text-sm text-gray-600">
          Total: {totalCandidates} candidates
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className="relative">
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stage.color }}
                ></div>
                <span className="font-medium text-gray-900">{stage.name}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-900 font-medium">
                  {stage.count} candidates
                </span>
                <span className="text-gray-600">
                  {calculatePercentage(stage.count)}% of total
                </span>
                {index > 0 && (
                  <span className="text-blue-600">
                    {getConversionRate(index)}% conversion
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    backgroundColor: stage.color,
                    width: getBarWidth(stage.count)
                  }}
                ></div>
              </div>
              
              {/* Count Label on Bar */}
              {stage.count > 0 && (
                <div
                  className="absolute inset-y-0 flex items-center px-2"
                  style={{ 
                    left: '4px',
                    color: stage.count / totalCandidates > 0.1 ? 'white' : stage.color
                  }}
                >
                  <span className="text-xs font-medium">
                    {stage.count}
                  </span>
                </div>
              )}
            </div>

            {/* Connection Line to Next Stage */}
            {index < stages.length - 1 && (
              <div className="flex justify-center mt-2 mb-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {stages.length > 0 ? stages[0].count : 0}
            </div>
            <div className="text-gray-600">Applied</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {stages.length > 1 ? stages[stages.length - 1].count : 0}
            </div>
            <div className="text-gray-600">Final Stage</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {stages.length > 1 ? 
                ((stages[stages.length - 1].count / (stages[0].count || 1)) * 100).toFixed(1) 
                : '0'}%
            </div>
            <div className="text-gray-600">Overall Conversion</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {stages.reduce((sum, stage) => sum + stage.count, 0) - (stages[stages.length - 1]?.count || 0)}
            </div>
            <div className="text-gray-600">In Progress</div>
          </div>
        </div>
      </div>

      {/* Stage Details */}
      <div className="mt-6">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
            View detailed conversion rates
          </summary>
          <div className="mt-3 space-y-2">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex justify-between items-center text-sm py-1">
                <span className="text-gray-700">{stage.name}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-900">{stage.count} candidates</span>
                  {index > 0 && (
                    <span className="text-blue-600">
                      {getConversionRate(index)}% from previous
                    </span>
                  )}
                  <span className="text-gray-600 w-12 text-right">
                    {calculatePercentage(stage.count)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};
