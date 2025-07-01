import React from 'react';
import { CandidateData, CandidateStatus } from '../../types/CandidateApiTypes';

export interface CandidateStatsProps {
  candidates: CandidateData[];
  loading?: boolean;
}

interface StatCard {
  label: string;
  value: number;
  color: string;
  icon: string;
}

const CandidateStats: React.FC<CandidateStatsProps> = ({ candidates, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats: StatCard[] = [
    {
      label: 'Total Candidates',
      value: candidates.length,
      color: 'bg-blue-500',
      icon: '👥'
    },
    {
      label: 'Applied',
      value: candidates.filter(c => c.status === CandidateStatus.APPLIED).length,
      color: 'bg-blue-500',
      icon: '📝'
    },
    {
      label: 'Reference Check',
      value: candidates.filter(c => c.status === CandidateStatus.REFERENCE_CHECK).length,
      color: 'bg-yellow-500',
      icon: '🔍'
    },
    {
      label: 'Offer',
      value: candidates.filter(c => c.status === CandidateStatus.OFFER).length,
      color: 'bg-purple-500',
      icon: '💼'
    },
    {
      label: 'Hired',
      value: candidates.filter(c => c.status === CandidateStatus.HIRED).length,
      color: 'bg-green-500',
      icon: '✅'
    },
    {
      label: 'Rejected/Withdrawn',
      value: candidates.filter(c => 
        c.status === CandidateStatus.REJECTED || c.status === CandidateStatus.WITHDRAWN
      ).length,
      color: 'bg-red-500',
      icon: '❌'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color} text-white text-2xl`}>
              {stat.icon}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CandidateStats;
