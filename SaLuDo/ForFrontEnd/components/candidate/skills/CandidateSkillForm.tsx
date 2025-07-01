import React, { useState, useEffect } from 'react';
import { CreateSkillData, AddedBy } from '../../../types/CandidateApiTypes';
import Modal from '../../common/Modal';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

export interface CandidateSkillFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (skillData: CreateSkillData) => Promise<void>;
  initialData?: Partial<CreateSkillData>;
  mode?: 'create' | 'edit';
  availableSkills?: string[]; // For autocomplete
}

const CandidateSkillForm: React.FC<CandidateSkillFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  mode = 'create',
  availableSkills = []
}) => {
  const [formData, setFormData] = useState<CreateSkillData>({
    skillName: initialData.skillName || '',
    evidence: initialData.evidence || '',
    score: initialData.score || 5,
    addedBy: initialData.addedBy || AddedBy.HUMAN
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);

  useEffect(() => {
    if (formData.skillName && availableSkills.length > 0) {
      const filtered = availableSkills.filter(skill =>
        skill.toLowerCase().includes(formData.skillName.toLowerCase()) &&
        skill.toLowerCase() !== formData.skillName.toLowerCase()
      );
      setFilteredSkills(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [formData.skillName, availableSkills]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.skillName.trim()) {
      setError('Skill name is required');
      return;
    }

    if (!formData.evidence.trim()) {
      setError('Evidence is required');
      return;
    }

    if (formData.score < 1 || formData.score > 10) {
      setError('Score must be between 1 and 10');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        skillName: '',
        evidence: '',
        score: 5,
        addedBy: AddedBy.HUMAN
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillSelect = (skillName: string) => {
    setFormData(prev => ({ ...prev, skillName }));
    setShowSuggestions(false);
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Expert';
    if (score >= 6) return 'Proficient';
    if (score >= 4) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Skill' : 'Edit Skill'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} />}

        {/* Skill Name */}
        <div className="relative">
          <label htmlFor="skillName" className="block text-sm font-medium text-gray-700 mb-2">
            Skill Name *
          </label>
          <input
            type="text"
            id="skillName"
            value={formData.skillName}
            onChange={(e) => setFormData(prev => ({ ...prev, skillName: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., JavaScript, Project Management, Python"
            required
          />
          
          {/* Autocomplete Suggestions */}
          {showSuggestions && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {filteredSkills.map((skill, index) => (
                <div
                  key={index}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                  onClick={() => handleSkillSelect(skill)}
                >
                  <span className="block truncate">{skill}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Score */}
        <div>
          <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
            Proficiency Score: {formData.score}/10 - {getScoreLabel(formData.score)}
          </label>
          <input
            type="range"
            id="score"
            min="1"
            max="10"
            value={formData.score}
            onChange={(e) => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Beginner</span>
            <span>Intermediate</span>
            <span>Proficient</span>
            <span>Expert</span>
          </div>
        </div>

        {/* Evidence */}
        <div>
          <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-2">
            Evidence/Description *
          </label>
          <textarea
            id="evidence"
            rows={4}
            value={formData.evidence}
            onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Describe your experience with this skill, projects you've worked on, certifications, etc."
            required
          />
        </div>

        {/* Added By */}
        <div>
          <label htmlFor="addedBy" className="block text-sm font-medium text-gray-700 mb-2">
            Added By
          </label>
          <select
            id="addedBy"
            value={formData.addedBy}
            onChange={(e) => setFormData(prev => ({ ...prev, addedBy: e.target.value as AddedBy }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value={AddedBy.HUMAN}>Manual Entry</option>
            <option value={AddedBy.AI}>AI Extracted</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size="sm" message="" /> : (mode === 'create' ? 'Add Skill' : 'Update Skill')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CandidateSkillForm;
