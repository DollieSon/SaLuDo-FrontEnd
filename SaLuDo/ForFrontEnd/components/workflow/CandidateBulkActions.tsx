import React, { useState } from 'react';
import { CandidateData, CandidateStatus } from '../../types/CandidateApiTypes';

interface CandidateBulkActionsProps {
  selectedCandidates: CandidateData[];
  onBulkStatusChange: (candidateIds: string[], newStatus: CandidateStatus, reason?: string) => Promise<void>;
  onBulkJobAssign: (candidateIds: string[], jobId: string) => Promise<void>;
  onBulkDelete: (candidateIds: string[]) => Promise<void>;
  onBulkExport: (candidateIds: string[], format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  onBulkEmail: (candidateIds: string[], template: string, customMessage?: string) => Promise<void>;
  onClearSelection: () => void;
  availableJobs: Array<{ id: string; title: string; company: string }>;
  emailTemplates: Array<{ id: string; name: string; subject: string }>;
  loading?: boolean;
}

export const CandidateBulkActions: React.FC<CandidateBulkActionsProps> = ({
  selectedCandidates,
  onBulkStatusChange,
  onBulkJobAssign,
  onBulkDelete,
  onBulkExport,
  onBulkEmail,
  onClearSelection,
  availableJobs,
  emailTemplates,
  loading = false
}) => {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [statusFormData, setStatusFormData] = useState({
    newStatus: CandidateStatus.FOR_REVIEW,
    reason: ''
  });

  const [jobFormData, setJobFormData] = useState({
    jobId: ''
  });

  const [emailFormData, setEmailFormData] = useState({
    templateId: '',
    customMessage: ''
  });

  const statusOptions = [
    { value: CandidateStatus.FOR_REVIEW, label: 'For Review', color: 'blue' },
    { value: CandidateStatus.PAPER_SCREENING, label: 'Paper Screening', color: 'indigo' },
    { value: CandidateStatus.EXAM, label: 'Exam', color: 'cyan' },
    { value: CandidateStatus.HR_INTERVIEW, label: 'HR Interview', color: 'sky' },
    { value: CandidateStatus.TECHNICAL_INTERVIEW, label: 'Technical Interview', color: 'blue' },
    { value: CandidateStatus.FINAL_INTERVIEW, label: 'Final Interview', color: 'violet' },
    { value: CandidateStatus.FOR_JOB_OFFER, label: 'For Job Offer', color: 'purple' },
    { value: CandidateStatus.OFFER_EXTENDED, label: 'Offer Extended', color: 'fuchsia' },
    { value: CandidateStatus.HIRED, label: 'Hired', color: 'green' },
    { value: CandidateStatus.REJECTED, label: 'Rejected', color: 'red' },
    { value: CandidateStatus.WITHDRAWN, label: 'Withdrawn', color: 'gray' },
    { value: CandidateStatus.ON_HOLD, label: 'On Hold', color: 'yellow' }
  ];

  const handleBulkStatusChange = async () => {
    setActionLoading(true);
    try {
      const candidateIds = selectedCandidates.map(c => c._id);
      await onBulkStatusChange(
        candidateIds, 
        statusFormData.newStatus, 
        statusFormData.reason || undefined
      );
      setShowStatusDialog(false);
      setStatusFormData({ newStatus: CandidateStatus.APPLIED, reason: '' });
      onClearSelection();
    } catch (error) {
      console.error('Failed to update candidate statuses:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkJobAssign = async () => {
    setActionLoading(true);
    try {
      const candidateIds = selectedCandidates.map(c => c._id);
      await onBulkJobAssign(candidateIds, jobFormData.jobId);
      setShowJobDialog(false);
      setJobFormData({ jobId: '' });
      onClearSelection();
    } catch (error) {
      console.error('Failed to assign candidates to job:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkEmail = async () => {
    setActionLoading(true);
    try {
      const candidateIds = selectedCandidates.map(c => c._id);
      await onBulkEmail(
        candidateIds, 
        emailFormData.templateId, 
        emailFormData.customMessage || undefined
      );
      setShowEmailDialog(false);
      setEmailFormData({ templateId: '', customMessage: '' });
      onClearSelection();
    } catch (error) {
      console.error('Failed to send bulk emails:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setActionLoading(true);
    try {
      const candidateIds = selectedCandidates.map(c => c._id);
      await onBulkDelete(candidateIds);
      setShowDeleteDialog(false);
      onClearSelection();
    } catch (error) {
      console.error('Failed to delete candidates:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setActionLoading(true);
    try {
      const candidateIds = selectedCandidates.map(c => c._id);
      await onBulkExport(candidateIds, format);
    } catch (error) {
      console.error('Failed to export candidates:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (selectedCandidates.length === 0) {
    return null;
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            {/* Selection Info */}
            <div className="text-sm font-medium text-gray-900">
              {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''} selected
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Status Change */}
              <button
                onClick={() => setShowStatusDialog(true)}
                disabled={loading || actionLoading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Change Status
              </button>

              {/* Job Assignment */}
              <button
                onClick={() => setShowJobDialog(true)}
                disabled={loading || actionLoading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                </svg>
                Assign Job
              </button>

              {/* Email */}
              <button
                onClick={() => setShowEmailDialog(true)}
                disabled={loading || actionLoading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </button>

              {/* Export Dropdown */}
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleExport(e.target.value as 'csv' | 'excel' | 'pdf');
                      e.target.value = '';
                    }
                  }}
                  disabled={loading || actionLoading}
                  className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">Export...</option>
                  <option value="csv">Export as CSV</option>
                  <option value="excel">Export as Excel</option>
                  <option value="pdf">Export as PDF</option>
                </select>
              </div>

              {/* Delete */}
              <button
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading || actionLoading}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>

              {/* Clear Selection */}
              <button
                onClick={onClearSelection}
                disabled={loading || actionLoading}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Dialog */}
      {showStatusDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowStatusDialog(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Change Status for {selectedCandidates.length} Candidates
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Status
                    </label>
                    <select
                      value={statusFormData.newStatus}
                      onChange={(e) => setStatusFormData(prev => ({ ...prev, newStatus: e.target.value as CandidateStatus }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason (Optional)
                    </label>
                    <textarea
                      value={statusFormData.reason}
                      onChange={(e) => setStatusFormData(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional reason for status change..."
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleBulkStatusChange}
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowStatusDialog(false)}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Assignment Dialog */}
      {showJobDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowJobDialog(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Assign Job to {selectedCandidates.length} Candidates
                </h3>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Job
                  </label>
                  <select
                    value={jobFormData.jobId}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, jobId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a job...</option>
                    {availableJobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} - {job.company}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleBulkJobAssign}
                  disabled={actionLoading || !jobFormData.jobId}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Assigning...' : 'Assign Job'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJobDialog(false)}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEmailDialog(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Send Email to {selectedCandidates.length} Candidates
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Template
                    </label>
                    <select
                      value={emailFormData.templateId}
                      onChange={(e) => setEmailFormData(prev => ({ ...prev, templateId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a template...</option>
                      {emailTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} - {template.subject}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Message (Optional)
                    </label>
                    <textarea
                      value={emailFormData.customMessage}
                      onChange={(e) => setEmailFormData(prev => ({ ...prev, customMessage: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a custom message to the template..."
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleBulkEmail}
                  disabled={actionLoading || !emailFormData.templateId}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Sending...' : 'Send Emails'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailDialog(false)}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteDialog(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Candidates
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''}? 
                        This action cannot be undone and will permanently remove all associated data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
