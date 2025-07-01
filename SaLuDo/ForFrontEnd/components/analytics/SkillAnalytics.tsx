import React from 'react';

interface SkillData {
  name: string;
  count: number;
  averageScore: number;
  category?: string;
}

interface SkillAnalyticsProps {
  skills: SkillData[];
  totalCandidates: number;
  loading?: boolean;
  className?: string;
}

export const SkillAnalytics: React.FC<SkillAnalyticsProps> = ({
  skills,
  totalCandidates,
  loading = false,
  className = ''
}) => {
  // Sort skills by frequency and average score
  const sortedSkills = [...skills].sort((a, b) => {
    // First sort by count (frequency), then by average score
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return b.averageScore - a.averageScore;
  });

  // Get top skills
  const topSkills = sortedSkills.slice(0, 10);

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, SkillData[]>);

  // Calculate skill frequency percentage
  const getFrequencyPercentage = (count: number) => {
    return totalCandidates > 0 ? ((count / totalCandidates) * 100).toFixed(1) : '0';
  };

  // Get score color based on average score
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Get bar width for skill frequency visualization
  const getBarWidth = (count: number) => {
    const maxCount = Math.max(...skills.map(s => s.count));
    return maxCount > 0 ? (count / maxCount) * 100 : 0;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-2 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
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
          Skills Analytics
        </h3>
        <div className="text-sm text-gray-600">
          {skills.length} unique skills across {totalCandidates} candidates
        </div>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>No skills data available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Skills */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Most Common Skills
            </h4>
            <div className="space-y-3">
              {topSkills.map((skill, index) => (
                <div key={skill.name} className="flex items-center space-x-3">
                  {/* Rank */}
                  <div className="w-6 text-center">
                    <span className={`text-sm font-medium ${
                      index < 3 ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      #{index + 1}
                    </span>
                  </div>

                  {/* Skill Name */}
                  <div className="w-32 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900">
                      {skill.name}
                    </span>
                  </div>

                  {/* Frequency Bar */}
                  <div className="flex-1 relative">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getBarWidth(skill.count)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Frequency Count */}
                  <div className="w-16 text-right">
                    <span className="text-sm text-gray-600">
                      {skill.count} ({getFrequencyPercentage(skill.count)}%)
                    </span>
                  </div>

                  {/* Average Score */}
                  <div className="w-16">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      getScoreColor(skill.averageScore)
                    }`}>
                      {skill.averageScore.toFixed(1)}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills by Category */}
          {Object.keys(skillsByCategory).length > 1 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Skills by Category
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">
                      {category} ({categorySkills.length})
                    </h5>
                    <div className="space-y-2">
                      {categorySkills
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 5)
                        .map((skill) => (
                          <div key={skill.name} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700 truncate">
                              {skill.name}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {skill.count}
                              </span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                getScoreColor(skill.averageScore)
                              }`}>
                                {skill.averageScore.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      {categorySkills.length > 5 && (
                        <div className="text-xs text-gray-500 text-center pt-1">
                          +{categorySkills.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Summary Statistics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-900">
                  {skills.length}
                </div>
                <div className="text-gray-600">Total Skills</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">
                  {(skills.reduce((sum, skill) => sum + skill.averageScore, 0) / skills.length).toFixed(1)}
                </div>
                <div className="text-gray-600">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">
                  {Math.max(...skills.map(s => s.count))}
                </div>
                <div className="text-gray-600">Most Common</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">
                  {Object.keys(skillsByCategory).length}
                </div>
                <div className="text-gray-600">Categories</div>
              </div>
            </div>
          </div>

          {/* High-Demand Skills */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">
              High-Demand Skills (&gt;50% of candidates)
            </h4>
            <div className="flex flex-wrap gap-2">
              {skills
                .filter(skill => (skill.count / totalCandidates) > 0.5)
                .sort((a, b) => b.count - a.count)
                .map((skill) => (
                  <span
                    key={skill.name}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {skill.name}
                    <span className="ml-1 text-blue-600">
                      ({getFrequencyPercentage(skill.count)}%)
                    </span>
                  </span>
                ))}
              {skills.filter(skill => (skill.count / totalCandidates) > 0.5).length === 0 && (
                <span className="text-sm text-gray-500">
                  No skills found in more than 50% of candidates
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
