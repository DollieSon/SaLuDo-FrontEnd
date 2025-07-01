import React, { useState } from 'react';
import { Certification } from '../../../types/CandidateApiTypes';
import { CertificationCard } from './CertificationCard';
import { CertificationForm } from './CertificationForm';
import { Modal } from '../../common/Modal';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface CertificationListProps {
  candidateId: string;
  certifications: Certification[];
  onAdd: (certification: Omit<Certification, '_id' | 'candidateId'>) => Promise<void>;
  onUpdate: (id: string, certification: Omit<Certification, '_id' | 'candidateId'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
  className?: string;
}

export const CertificationList: React.FC<CertificationListProps> = ({
  candidateId,
  certifications,
  onAdd,
  onUpdate,
  onDelete,
  loading = false,
  className = ''
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [deletingCertification, setDeletingCertification] = useState<Certification | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Sort certifications by issue date (most recent first) and expiration status
  const sortedCertifications = [...certifications].sort((a, b) => {
    // First, sort by expiration status (expired last)
    const aExpired = a.expirationDate && new Date(a.expirationDate) < new Date();
    const bExpired = b.expirationDate && new Date(b.expirationDate) < new Date();
    
    if (aExpired !== bExpired) {
      return aExpired ? 1 : -1;
    }
    
    // Then by issue date (most recent first)
    const dateA = new Date(a.issueDate).getTime();
    const dateB = new Date(b.issueDate).getTime();
    return dateB - dateA;
  });

  // Get statistics
  const activeCertifications = certifications.filter(cert => 
    !cert.expirationDate || new Date(cert.expirationDate) >= new Date()
  ).length;
  
  const expiringSoon = certifications.filter(cert => {
    if (!cert.expirationDate) return false;
    const expirationDate = new Date(cert.expirationDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expirationDate <= threeMonthsFromNow && expirationDate >= new Date();
  }).length;

  const handleAdd = () => {
    setEditingCertification(null);
    setShowForm(true);
  };

  const handleEdit = (certification: Certification) => {
    setEditingCertification(certification);
    setShowForm(true);
  };

  const handleFormSubmit = async (certificationData: Omit<Certification, '_id' | 'candidateId'>) => {
    setActionLoading(true);
    try {
      if (editingCertification) {
        await onUpdate(editingCertification._id, certificationData);
      } else {
        await onAdd(certificationData);
      }
      setShowForm(false);
      setEditingCertification(null);
    } catch (error) {
      console.error('Failed to save certification:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCertification(null);
  };

  const handleDeleteClick = (certification: Certification) => {
    setDeletingCertification(certification);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCertification) return;
    
    setActionLoading(true);
    try {
      await onDelete(deletingCertification._id);
      setDeletingCertification(null);
    } catch (error) {
      console.error('Failed to delete certification:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingCertification(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Statistics */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Certifications ({certifications.length})
          </h3>
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-sm text-green-600">
              {activeCertifications} Active
            </span>
            {expiringSoon > 0 && (
              <span className="text-sm text-yellow-600">
                {expiringSoon} Expiring Soon
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={loading || actionLoading}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Certification
        </button>
      </div>

      {/* Certification List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      ) : sortedCertifications.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No certifications</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding the candidate's professional certifications.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Certification
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCertifications.map((certification) => (
            <CertificationCard
              key={certification._id}
              certification={certification}
              onEdit={() => handleEdit(certification)}
              onDelete={() => handleDeleteClick(certification)}
              loading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Certification Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingCertification ? 'Edit Certification' : 'Add Certification'}
        size="lg"
      >
        <CertificationForm
          candidateId={candidateId}
          certification={editingCertification || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={actionLoading}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCertification}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Certification"
        message={
          deletingCertification
            ? `Are you sure you want to delete "${deletingCertification.name}" certification? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};
