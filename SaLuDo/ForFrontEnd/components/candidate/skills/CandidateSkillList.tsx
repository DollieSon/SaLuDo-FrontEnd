import React, { useState, useEffect } from 'react';
import { SkillWithMasterData, CreateSkillData, AddedBy } from '../../../types/CandidateApiTypes';
import CandidateSkillCard from './CandidateSkillCard';
import CandidateSkillForm from './CandidateSkillForm';
import ConfirmDialog from '../../common/ConfirmDialog';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

export interface CandidateSkillListProps {
  candidateId: string;
  skills: SkillWithMasterData[];
  onSkillAdd: (skillData: CreateSkillData) => Promise<void>;
  onSkillUpdate: (skillId: string, skillData: Partial<CreateSkillData>) => Promise<void>;
  onSkillDelete: (skillId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  loading?: boolean;
  compact?: boolean;
  maxDisplay?: number;
}

const CandidateSkillList: React.FC<CandidateSkillListProps> = ({
  candidateId,
  skills,
  onSkillAdd,
  onSkillUpdate,
  onSkillDelete,
  onRefresh,
  loading = false,
  compact = false,
  maxDisplay
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillWithMasterData | null>(null);
  const [deletingSkillId, setDeletingSkillId] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState<'all' | 'ai' | 'human'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date'>('score');
  const [error, setError] = useState<string | null>(null);

  const filteredAndSortedSkills = React.useMemo(() => {
    let filtered = skills.filter(skill => !skill.isDeleted);

    // Apply filter
    if (filterBy === 'ai') {
      filtered = filtered.filter(skill => skill.addedBy === AddedBy.AI);
    } else if (filterBy === 'human') {
      filtered = filtered.filter(skill => skill.addedBy === AddedBy.HUMAN);
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'name':
          return a.skillName.localeCompare(b.skillName);
        case 'date':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        default:
          return 0;
      }
    });

    // Apply max display limit
    if (maxDisplay && filtered.length > maxDisplay) {
      return filtered.slice(0, maxDisplay);
    }

    return filtered;
  }, [skills, filterBy, sortBy, maxDisplay]);

  const handleSkillAdd = async (skillData: CreateSkillData) => {
    try {
      await onSkillAdd(skillData);
      setShowAddForm(false);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add skill');
    }
  };

  const handleSkillEdit = async (skillData: CreateSkillData) => {
    if (!editingSkill) return;
    
    try {
      await onSkillUpdate(editingSkill.candidateSkillId, skillData);
      setEditingSkill(null);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update skill');
    }
  };

  const handleSkillDelete = async () => {
    if (!deletingSkillId) return;
    
    try {
      await onSkillDelete(deletingSkillId);
      setDeletingSkillId(null);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill');
    }
  };

  const getSkillStats = () => {
    const total = skills.filter(s => !s.isDeleted).length;
    const aiAdded = skills.filter(s => !s.isDeleted && s.addedBy === AddedBy.AI).length;
    const humanAdded = skills.filter(s => !s.isDeleted && s.addedBy === AddedBy.HUMAN).length;
    const avgScore = total > 0 ? skills.filter(s => !s.isDeleted).reduce((sum, s) => sum + s.score, 0) / total : 0;
    
    return { total, aiAdded, humanAdded, avgScore };
  };

  if (loading) {
    return <LoadingSpinner size="md" message="Loading skills..." />;
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {filteredAndSortedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filteredAndSortedSkills.map((skill) => (
              <CandidateSkillCard
                key={skill.candidateSkillId}
                skill={skill}
                compact={true}
                showActions={false}
              />
            ))}
            {maxDisplay && skills.filter(s => !s.isDeleted).length > maxDisplay && (
              <div className="inline-flex items-center px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-full">
                +{skills.filter(s => !s.isDeleted).length - maxDisplay} more
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No skills added yet</p>
        )}
      </div>
    );
  }

  const stats = getSkillStats();

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {/* Header with Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Skills ({stats.total})</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Skill
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Skills</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.aiAdded}</div>
            <div className="text-sm text-gray-500">AI Added</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.humanAdded}</div>
            <div className="text-sm text-gray-500">Manual</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.avgScore.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Avg Score</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Source
            </label>
            <select
              id="filter"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as 'all' | 'ai' | 'human')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Skills</option>
              <option value="ai">AI Added</option>
              <option value="human">Manual Entry</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'name' | 'date')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="score">Proficiency Score</option>
              <option value="name">Skill Name</option>
              <option value="date">Date Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      {filteredAndSortedSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedSkills.map((skill) => (
            <CandidateSkillCard
              key={skill.candidateSkillId}
              skill={skill}
              onEdit={setEditingSkill}
              onDelete={setDeletingSkillId}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No skills found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterBy !== 'all' ? 'Try changing the filter' : 'Get started by adding a skill'}
          </p>
        </div>
      )}

      {/* Add Skill Form */}
      <CandidateSkillForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleSkillAdd}
        mode="create"
      />

      {/* Edit Skill Form */}
      {editingSkill && (
        <CandidateSkillForm
          isOpen={true}
          onClose={() => setEditingSkill(null)}
          onSubmit={handleSkillEdit}
          initialData={editingSkill}
          mode="edit"
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingSkillId}
        title="Delete Skill"
        message="Are you sure you want to delete this skill? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        onConfirm={handleSkillDelete}
        onCancel={() => setDeletingSkillId(null)}
      />
    </div>
  );
};

export default CandidateSkillList;
