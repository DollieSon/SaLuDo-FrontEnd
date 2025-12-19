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
      label: 'For Review',
      value: candidates.filter(c => c.status === CandidateStatus.FOR_REVIEW).length,
      color: 'bg-blue-500',
      icon: '📝'
    },
    {
      label: 'Paper Screening',
      value: candidates.filter(c => c.status === CandidateStatus.PAPER_SCREENING).length,
      color: 'bg-indigo-500',
      icon: '📄'
    },
    {
      label: 'Exam',
      value: candidates.filter(c => c.status === CandidateStatus.EXAM).length,
      color: 'bg-cyan-500',
      icon: '📝'
    },
    {
      label: 'HR Interview',
      value: candidates.filter(c => c.status === CandidateStatus.HR_INTERVIEW).length,
      color: 'bg-sky-500',
      icon: '👔'
    },
    {
      label: 'Technical Interview',
      value: candidates.filter(c => c.status === CandidateStatus.TECHNICAL_INTERVIEW).length,
      color: 'bg-blue-600',
      icon: '💻'
    },
    {
      label: 'Final Interview',
      value: candidates.filter(c => c.status === CandidateStatus.FINAL_INTERVIEW).length,
      color: 'bg-violet-500',
      icon: '🎯'
    },
    {
      label: 'For Job Offer',
      value: candidates.filter(c => c.status === CandidateStatus.FOR_JOB_OFFER).length,
      color: 'bg-purple-500',
      icon: '📋'
    },
    {
      label: 'Offer Extended',
      value: candidates.filter(c => c.status === CandidateStatus.OFFER_EXTENDED).length,
      color: 'bg-fuchsia-500',
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
