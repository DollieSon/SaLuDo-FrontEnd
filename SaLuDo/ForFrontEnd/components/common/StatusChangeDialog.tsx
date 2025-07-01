import React from 'react';

interface StatusChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (newStatus: string, reason?: string) => Promise<void>;
  currentStatus: string;
  candidateName: string;
  availableStatuses: Array<{
    value: string;
    label: string;
    color: string;
    requiresReason?: boolean;
  }>;
  loading?: boolean;
}

export const StatusChangeDialog: React.FC<StatusChangeDialogProps> = ({
  isOpen,
  onClose,
  onStatusChange,
  currentStatus,
  candidateName,
  availableStatuses,
  loading = false
}) => {
  const [selectedStatus, setSelectedStatus] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');

  const selectedStatusInfo = availableStatuses.find(s => s.value === selectedStatus);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedStatus('');
      setReason('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedStatus) {
      setError('Please select a status');
      return;
    }

    if (selectedStatusInfo?.requiresReason && !reason.trim()) {
      setError('Please provide a reason for this status change');
      return;
    }

    try {
      await onStatusChange(selectedStatus, reason.trim() || undefined);
      onClose();
    } catch (err) {
      setError('Failed to update status. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Change Candidate Status
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Update the status for <strong>{candidateName}</strong>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Current status: <span className="font-medium">{currentStatus}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="mt-5 space-y-4">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <div className="space-y-2">
                  {availableStatuses
                    .filter(status => status.value !== currentStatus)
                    .map((status) => (
                      <label
                        key={status.value}
                        className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${
                          selectedStatus === status.value
                            ? 'border-blue-600 ring-2 ring-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status.value}
                          checked={selectedStatus === status.value}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="sr-only"
                          disabled={loading}
                        />
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: status.color }}
                          ></div>
                          <div className="flex-1">
                            <span className="block text-sm font-medium text-gray-900">
                              {status.label}
                            </span>
                            {status.requiresReason && (
                              <span className="block text-xs text-gray-500">
                                Requires reason
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                </div>
              </div>

              {/* Reason Input */}
              {selectedStatusInfo?.requiresReason && (
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Change *
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please provide a reason for this status change..."
                    disabled={loading}
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !selectedStatus}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
