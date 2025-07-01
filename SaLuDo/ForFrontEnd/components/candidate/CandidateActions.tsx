import React, { useState } from 'react';
import { CandidateData, CandidateStatus } from '../../types/CandidateApiTypes';
import { CandidateApiClient } from '../../clients/CandidateApiClient';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

export interface CandidateActionsProps {
  selectedCandidates: CandidateData[];
  onActionComplete: () => void;
  onSelectionClear: () => void;
}

const CandidateActions: React.FC<CandidateActionsProps> = ({
  selectedCandidates,
  onActionComplete,
  onSelectionClear
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'status' | 'delete';
    data?: any;
  } | null>(null);

  const handleBulkStatusUpdate = async (newStatus: CandidateStatus) => {
    setPendingAction({ type: 'status', data: newStatus });
    setShowConfirmModal(true);
  };

  const handleBulkDelete = () => {
    setPendingAction({ type: 'delete' });
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    if (!pendingAction) return;

    try {
      setLoading(true);
      setError(null);

      const candidateIds = selectedCandidates.map(c => c.candidateId);

      if (pendingAction.type === 'status') {
        const updatePromises = candidateIds.map(id =>
          CandidateApiClient.updateCandidate(id, { status: pendingAction.data })
        );
        await Promise.all(updatePromises);
      } else if (pendingAction.type === 'delete') {
        const deletePromises = candidateIds.map(id =>
          CandidateApiClient.deleteCandidate(id)
        );
        await Promise.all(deletePromises);
      }

      onActionComplete();
      onSelectionClear();
      setShowConfirmModal(false);
      setPendingAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const cancelAction = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
    setError(null);
  };

  if (selectedCandidates.length === 0) {
    return null;
  }

  return (
    <>
      {/* Actions Bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? 's' : ''} selected
            </span>
            
            {/* Status Update Dropdown */}
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusUpdate(e.target.value as CandidateStatus);
                    e.target.value = ''; // Reset selection
                  }
                }}
                className="text-sm border border-blue-300 rounded-md px-3 py-1 bg-white focus:ring-blue-500 focus:border-blue-500"
                defaultValue=""
              >
                <option value="" disabled>Update Status</option>
                <option value={CandidateStatus.APPLIED}>Mark as Applied</option>
                <option value={CandidateStatus.REFERENCE_CHECK}>Move to Reference Check</option>
                <option value={CandidateStatus.OFFER}>Move to Offer</option>
                <option value={CandidateStatus.HIRED}>Mark as Hired</option>
                <option value={CandidateStatus.REJECTED}>Mark as Rejected</option>
                <option value={CandidateStatus.WITHDRAWN}>Mark as Withdrawn</option>
              </select>
            </div>

            {/* Delete Button */}
            <button
              onClick={handleBulkDelete}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Selected
            </button>
          </div>

          {/* Clear Selection */}
          <button
            onClick={onSelectionClear}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Selection
          </button>
        </div>

        {error && (
          <div className="mt-4">
            <ErrorMessage message={error} onRetry={() => setError(null)} />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Confirm Action
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {pendingAction?.type === 'delete' 
                    ? `Are you sure you want to delete ${selectedCandidates.length} candidate${selectedCandidates.length !== 1 ? 's' : ''}? This action cannot be undone.`
                    : `Are you sure you want to update the status of ${selectedCandidates.length} candidate${selectedCandidates.length !== 1 ? 's' : ''} to "${pendingAction?.data}"?`
                  }
                </p>
              </div>
              <div className="items-center px-4 py-3">
                {loading ? (
                  <LoadingSpinner size="sm" message="Processing..." />
                ) : (
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={cancelAction}
                      className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeAction}
                      className={`px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                        pendingAction?.type === 'delete'
                          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-300'
                          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'
                      }`}
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CandidateActions;
