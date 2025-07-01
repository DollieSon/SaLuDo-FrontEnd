import React, { useState } from 'react';
import { Education } from '../../../types/CandidateApiTypes';
import { EducationCard } from './EducationCard';
import { EducationForm } from './EducationForm';
import { Modal } from '../../common/Modal';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface EducationListProps {
  candidateId: string;
  educations: Education[];
  onAdd: (education: Omit<Education, '_id' | 'candidateId'>) => Promise<void>;
  onUpdate: (id: string, education: Omit<Education, '_id' | 'candidateId'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
  className?: string;
}

export const EducationList: React.FC<EducationListProps> = ({
  candidateId,
  educations,
  onAdd,
  onUpdate,
  onDelete,
  loading = false,
  className = ''
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [deletingEducation, setDeletingEducation] = useState<Education | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Sort educations by start date (most recent first)
  const sortedEducations = [...educations].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return dateB - dateA;
  });

  const handleAdd = () => {
    setEditingEducation(null);
    setShowForm(true);
  };

  const handleEdit = (education: Education) => {
    setEditingEducation(education);
    setShowForm(true);
  };

  const handleFormSubmit = async (educationData: Omit<Education, '_id' | 'candidateId'>) => {
    setActionLoading(true);
    try {
      if (editingEducation) {
        await onUpdate(editingEducation._id, educationData);
      } else {
        await onAdd(educationData);
      }
      setShowForm(false);
      setEditingEducation(null);
    } catch (error) {
      console.error('Failed to save education:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEducation(null);
  };

  const handleDeleteClick = (education: Education) => {
    setDeletingEducation(education);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEducation) return;
    
    setActionLoading(true);
    try {
      await onDelete(deletingEducation._id);
      setDeletingEducation(null);
    } catch (error) {
      console.error('Failed to delete education:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingEducation(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Education ({educations.length})
        </h3>
        <button
          onClick={handleAdd}
          disabled={loading || actionLoading}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Education
        </button>
      </div>

      {/* Education List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      ) : sortedEducations.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No education records</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding the candidate's education history.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Education
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEducations.map((education) => (
            <EducationCard
              key={education._id}
              education={education}
              onEdit={() => handleEdit(education)}
              onDelete={() => handleDeleteClick(education)}
              loading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Education Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingEducation ? 'Edit Education' : 'Add Education'}
        size="lg"
      >
        <EducationForm
          candidateId={candidateId}
          education={editingEducation || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={actionLoading}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingEducation}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Education"
        message={
          deletingEducation
            ? `Are you sure you want to delete "${deletingEducation.degree}" from "${deletingEducation.institution}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};
