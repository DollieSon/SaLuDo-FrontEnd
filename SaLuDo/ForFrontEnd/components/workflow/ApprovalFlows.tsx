import React, { useState, useEffect } from 'react';
import { LoadingSpinner, ErrorMessage, ConfirmDialog, Modal } from '../common';
import { CandidateData, CandidateStatus } from '../../types/CandidateApiTypes';

export interface ApprovalRequest {
  id: string;
  candidateId: string;
  candidate: CandidateData;
  requestType: 'status_change' | 'job_assignment' | 'salary_offer' | 'hire_approval';
  currentValue?: string;
  requestedValue: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  justification?: string;
  approvers: ApprovalStep[];
  currentStepIndex: number;
  comments: ApprovalComment[];
  metadata?: {
    jobId?: string;
    jobTitle?: string;
    salaryAmount?: number;
    currency?: string;
    startDate?: Date;
    [key: string]: any;
  };
}

export interface ApprovalStep {
  id: string;
  approverType: 'user' | 'role' | 'any_of';
  approverIds?: string[];
  approverRole?: string;
  approverNames: string[];
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedBy?: {
    id: string;
    name: string;
    email: string;
  };
  approvedAt?: Date;
  comments?: string;
  order: number;
  isRequired: boolean;
}

export interface ApprovalComment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  createdAt: Date;
  type: 'comment' | 'approval' | 'rejection' | 'request_changes';
}

export interface ApprovalFlow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  requestType: ApprovalRequest['requestType'];
  triggers: ApprovalTrigger[];
  steps: Omit<ApprovalStep, 'id' | 'status' | 'approvedBy' | 'approvedAt'>[];
  autoApprovalRules?: AutoApprovalRule[];
  escalationRules?: EscalationRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalTrigger {
  condition: 'always' | 'value_threshold' | 'role_based' | 'department_based';
  threshold?: number;
  roles?: string[];
  departments?: string[];
}

export interface AutoApprovalRule {
  condition: string;
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface EscalationRule {
  timeoutHours: number;
  action: 'auto_approve' | 'escalate_to_manager' | 'reject' | 'notify_admin';
  escalateToRole?: string;
}

interface ApprovalFlowsProps {
  onRequestApproval?: (request: Omit<ApprovalRequest, 'id' | 'status' | 'currentStepIndex' | 'comments' | 'requestedAt'>) => Promise<void>;
  onApproveRequest?: (requestId: string, stepId: string, comments?: string) => Promise<void>;
  onRejectRequest?: (requestId: string, stepId: string, comments: string) => Promise<void>;
  onAddComment?: (requestId: string, comment: string) => Promise<void>;
  currentUserId?: string;
  currentUserRole?: string;
}

export const ApprovalFlows: React.FC<ApprovalFlowsProps> = ({
  onRequestApproval,
  onApproveRequest,
  onRejectRequest,
  onAddComment,
  currentUserId = 'user123',
  currentUserRole = 'manager'
}) => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'my_requests' | 'completed'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [actionConfirm, setActionConfirm] = useState<{
    type: 'approve' | 'reject';
    requestId: string;
    stepId: string;
  } | null>(null);

  useEffect(() => {
    loadApprovalRequests();
  }, [activeTab]);

  const loadApprovalRequests = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockRequests: ApprovalRequest[] = [
        {
          id: 'req1',
          candidateId: 'cand1',
          candidate: {
            id: 'cand1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@email.com',
            phone: '+1234567890',
            status: CandidateStatus.FOR_REVIEW,
            appliedDate: new Date('2024-01-15'),
            skills: [],
            experience: [],
            education: [],
            certifications: [],
            resumeMetadata: null,
            transcriptMetadata: [],
            jobId: 'job1',
            addedBy: 'HUMAN' as any,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15')
          },
          requestType: 'hire_approval',
          requestedValue: 'hire',
          requestedBy: {
            id: 'user456',
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            role: 'recruiter'
          },
          requestedAt: new Date('2024-01-20'),
          status: 'pending',
          priority: 'high',
          reason: 'Excellent candidate with strong technical skills and cultural fit',
          justification: 'Scored 95/100 in technical assessment, positive feedback from all interviewers',
          approvers: [
            {
              id: 'step1',
              approverType: 'role',
              approverRole: 'hiring_manager',
              approverNames: ['Mike Johnson'],
              status: 'approved',
              approvedBy: {
                id: 'user789',
                name: 'Mike Johnson',
                email: 'mike.johnson@company.com'
              },
              approvedAt: new Date('2024-01-21'),
              comments: 'Great candidate, approve to proceed',
              order: 1,
              isRequired: true
            },
            {
              id: 'step2',
              approverType: 'role',
              approverRole: 'hr_director',
              approverNames: ['Sarah Wilson'],
              status: 'pending',
              order: 2,
              isRequired: true
            }
          ],
          currentStepIndex: 1,
          comments: [
            {
              id: 'comment1',
              userId: 'user456',
              userName: 'Jane Smith',
              userRole: 'recruiter',
              comment: 'Requesting approval for immediate hire',
              createdAt: new Date('2024-01-20'),
              type: 'comment'
            }
          ],
          metadata: {
            jobId: 'job1',
            jobTitle: 'Senior Software Engineer',
            salaryAmount: 120000,
            currency: 'USD',
            startDate: new Date('2024-02-01')
          }
        },
        {
          id: 'req2',
          candidateId: 'cand2',
          candidate: {
            id: 'cand2',
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@email.com',
            phone: '+1234567891',
            status: CandidateStatus.FOR_REVIEW,
            appliedDate: new Date('2024-01-18'),
            skills: [],
            experience: [],
            education: [],
            certifications: [],
            resumeMetadata: null,
            transcriptMetadata: [],
            jobId: 'job2',
            addedBy: 'HUMAN' as any,
            createdAt: new Date('2024-01-18'),
            updatedAt: new Date('2024-01-18')
          },
          requestType: 'salary_offer',
          currentValue: '100000',
          requestedValue: '115000',
          requestedBy: {
            id: currentUserId,
            name: 'Current User',
            email: 'current.user@company.com',
            role: currentUserRole
          },
          requestedAt: new Date('2024-01-22'),
          status: 'pending',
          priority: 'medium',
          reason: 'Candidate has competing offer from another company',
          approvers: [
            {
              id: 'step1',
              approverType: 'role',
              approverRole: 'finance_director',
              approverNames: ['David Brown'],
              status: 'pending',
              order: 1,
              isRequired: true
            }
          ],
          currentStepIndex: 0,
          comments: [],
          metadata: {
            jobId: 'job2',
            jobTitle: 'Product Manager',
            salaryAmount: 115000,
            currency: 'USD'
          }
        }
      ];
      
      const filteredRequests = mockRequests.filter(req => {
        switch (activeTab) {
          case 'pending':
            return req.status === 'pending' && canApproveStep(req, currentUserId, currentUserRole);
          case 'my_requests':
            return req.requestedBy.id === currentUserId;
          case 'completed':
            return req.status === 'approved' || req.status === 'rejected';
          default:
            return true;
        }
      });
      
      setRequests(filteredRequests);
    } catch (err) {
      setError('Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  };

  const canApproveStep = (request: ApprovalRequest, userId: string, userRole: string): boolean => {
    const currentStep = request.approvers[request.currentStepIndex];
    if (!currentStep || currentStep.status !== 'pending') return false;
    
    if (currentStep.approverType === 'user') {
      return currentStep.approverIds?.includes(userId) || false;
    } else if (currentStep.approverType === 'role') {
      return currentStep.approverRole === userRole;
    }
    return false;
  };

  const handleApproveRequest = async (requestId: string, stepId: string, comments?: string) => {
    try {
      await onApproveRequest?.(requestId, stepId, comments);
      setActionConfirm(null);
      loadApprovalRequests();
    } catch (err) {
      setError('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: string, stepId: string, comments: string) => {
    try {
      await onRejectRequest?.(requestId, stepId, comments);
      setActionConfirm(null);
      loadApprovalRequests();
    } catch (err) {
      setError('Failed to reject request');
    }
  };

  const formatRequestType = (type: ApprovalRequest['requestType']): string => {
    switch (type) {
      case 'status_change': return 'Status Change';
      case 'job_assignment': return 'Job Assignment';
      case 'salary_offer': return 'Salary Offer';
      case 'hire_approval': return 'Hire Approval';
      default: return type;
    }
  };

  const getPriorityColor = (priority: ApprovalRequest['priority']): string => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="approval-flows">
      <div className="approval-header">
        <div>
          <h2>Approval Flows</h2>
          <p>Manage approval requests and workflows</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowRequestForm(true)}
        >
          New Request
        </button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <div className="approval-tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals ({requests.filter(r => r.status === 'pending' && canApproveStep(r, currentUserId, currentUserRole)).length})
        </button>
        <button
          className={`tab ${activeTab === 'my_requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_requests')}
        >
          My Requests
        </button>
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      <div className="approval-stats">
        <div className="stat-card">
          <h3>{requests.filter(r => r.status === 'pending').length}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{requests.filter(r => r.priority === 'urgent').length}</h3>
          <p>Urgent</p>
        </div>
        <div className="stat-card">
          <h3>{requests.filter(r => r.status === 'approved').length}</h3>
          <p>Approved</p>
        </div>
        <div className="stat-card">
          <h3>2.1 days</h3>
          <p>Avg Response Time</p>
        </div>
      </div>

      <div className="approval-requests">
        {requests.map(request => {
          const currentStep = request.approvers[request.currentStepIndex];
          const canApprove = canApproveStep(request, currentUserId, currentUserRole);
          
          return (
            <div key={request.id} className={`request-card ${getPriorityColor(request.priority)}`}>
              <div className="request-header">
                <div className="request-info">
                  <div className="request-title">
                    <h3>{formatRequestType(request.requestType)}</h3>
                    <span className={`priority-badge ${request.priority}`}>
                      {request.priority.toUpperCase()}
                    </span>
                    <span className={`status-badge ${request.status}`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="candidate-info">
                    <strong>{request.candidate.firstName} {request.candidate.lastName}</strong>
                    {request.metadata?.jobTitle && ` • ${request.metadata.jobTitle}`}
                  </p>
                  <p className="request-meta">
                    Requested by {request.requestedBy.name} • {request.requestedAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="request-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    View Details
                  </button>
                  {canApprove && request.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => setActionConfirm({
                          type: 'approve',
                          requestId: request.id,
                          stepId: currentStep.id
                        })}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setActionConfirm({
                          type: 'reject',
                          requestId: request.id,
                          stepId: currentStep.id
                        })}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="request-details">
                <p><strong>Reason:</strong> {request.reason}</p>
                {request.justification && (
                  <p><strong>Justification:</strong> {request.justification}</p>
                )}
                
                {request.requestType === 'salary_offer' && request.metadata && (
                  <p>
                    <strong>Salary:</strong> 
                    {request.currentValue && ` ${request.currentValue} → `}
                    {request.metadata.currency} {request.metadata.salaryAmount?.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="approval-progress">
                <h4>Approval Progress</h4>
                <div className="approval-steps">
                  {request.approvers.map((step, index) => (
                    <div key={step.id} className={`approval-step ${step.status} ${index === request.currentStepIndex ? 'current' : ''}`}>
                      <div className="step-indicator">
                        {step.status === 'approved' && '✓'}
                        {step.status === 'rejected' && '✗'}
                        {step.status === 'pending' && (index + 1)}
                      </div>
                      <div className="step-info">
                        <p>{step.approverNames.join(', ')}</p>
                        <small>{step.approverRole}</small>
                        {step.approvedAt && (
                          <small>Approved: {step.approvedAt.toLocaleDateString()}</small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedRequest && (
        <ApprovalRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={(stepId, comments) => handleApproveRequest(selectedRequest.id, stepId, comments)}
          onReject={(stepId, comments) => handleRejectRequest(selectedRequest.id, stepId, comments)}
          onAddComment={(comment) => onAddComment?.(selectedRequest.id, comment)}
          canApprove={canApproveStep(selectedRequest, currentUserId, currentUserRole)}
        />
      )}

      {actionConfirm && (
        <ApprovalActionConfirm
          action={actionConfirm}
          onConfirm={(comments) => {
            if (actionConfirm.type === 'approve') {
              handleApproveRequest(actionConfirm.requestId, actionConfirm.stepId, comments);
            } else {
              handleRejectRequest(actionConfirm.requestId, actionConfirm.stepId, comments || 'No reason provided');
            }
          }}
          onCancel={() => setActionConfirm(null)}
        />
      )}
    </div>
  );
};

interface ApprovalRequestModalProps {
  request: ApprovalRequest;
  onClose: () => void;
  onApprove: (stepId: string, comments?: string) => void;
  onReject: (stepId: string, comments: string) => void;
  onAddComment: (comment: string) => void;
  canApprove: boolean;
}

const ApprovalRequestModal: React.FC<ApprovalRequestModalProps> = ({
  request,
  onClose,
  onApprove,
  onReject,
  onAddComment,
  canApprove
}) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <Modal onClose={onClose} size="large">
      <div className="approval-request-modal">
        <div className="modal-header">
          <h3>Approval Request Details</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="modal-body">
          <div className="request-overview">
            <h4>{request.candidate.firstName} {request.candidate.lastName}</h4>
            <p>{request.metadata?.jobTitle}</p>
            <div className="request-badges">
              <span className={`priority-badge ${request.priority}`}>
                {request.priority.toUpperCase()}
              </span>
              <span className={`status-badge ${request.status}`}>
                {request.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="request-content">
            <div className="section">
              <h4>Request Details</h4>
              <p><strong>Type:</strong> {formatRequestType(request.requestType)}</p>
              <p><strong>Requested by:</strong> {request.requestedBy.name} ({request.requestedBy.role})</p>
              <p><strong>Date:</strong> {request.requestedAt.toLocaleString()}</p>
              <p><strong>Reason:</strong> {request.reason}</p>
              {request.justification && (
                <p><strong>Justification:</strong> {request.justification}</p>
              )}
            </div>

            <div className="section">
              <h4>Approval Steps</h4>
              <div className="approval-timeline">
                {request.approvers.map((step, index) => (
                  <div key={step.id} className={`timeline-item ${step.status}`}>
                    <div className="timeline-marker">
                      {step.status === 'approved' && '✓'}
                      {step.status === 'rejected' && '✗'}
                      {step.status === 'pending' && '⏳'}
                    </div>
                    <div className="timeline-content">
                      <h5>{step.approverNames.join(', ')}</h5>
                      <p>{step.approverRole}</p>
                      {step.approvedBy && (
                        <p>Approved by {step.approvedBy.name} on {step.approvedAt?.toLocaleDateString()}</p>
                      )}
                      {step.comments && <p>"{step.comments}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <h4>Comments</h4>
              <div className="comments-list">
                {request.comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <strong>{comment.userName}</strong>
                      <span>({comment.userRole})</span>
                      <small>{comment.createdAt.toLocaleString()}</small>
                    </div>
                    <p>{comment.comment}</p>
                  </div>
                ))}
              </div>

              <div className="add-comment">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  className="btn btn-secondary btn-sm"
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {canApprove && request.status === 'pending' && (
            <>
              <button
                className="btn btn-success"
                onClick={() => onApprove(request.approvers[request.currentStepIndex].id)}
              >
                Approve
              </button>
              <button
                className="btn btn-danger"
                onClick={() => onReject(request.approvers[request.currentStepIndex].id, 'Rejected from modal')}
              >
                Reject
              </button>
            </>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface ApprovalActionConfirmProps {
  action: {
    type: 'approve' | 'reject';
    requestId: string;
    stepId: string;
  };
  onConfirm: (comments?: string) => void;
  onCancel: () => void;
}

const ApprovalActionConfirm: React.FC<ApprovalActionConfirmProps> = ({
  action,
  onConfirm,
  onCancel
}) => {
  const [comments, setComments] = useState('');

  return (
    <ConfirmDialog
      title={action.type === 'approve' ? 'Approve Request' : 'Reject Request'}
      message={`Are you sure you want to ${action.type} this request?`}
      onConfirm={() => onConfirm(comments)}
      onCancel={onCancel}
      confirmText={action.type === 'approve' ? 'Approve' : 'Reject'}
      cancelText="Cancel"
    >
      <div className="approval-comments">
        <label>Comments {action.type === 'reject' ? '(required)' : '(optional)'}:</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder={`Add ${action.type === 'approve' ? 'approval' : 'rejection'} comments...`}
          rows={3}
          required={action.type === 'reject'}
        />
      </div>
    </ConfirmDialog>
  );
};

// Helper function to format request type (duplicate from component, extracted for reuse)
const formatRequestType = (type: ApprovalRequest['requestType']): string => {
  switch (type) {
    case 'status_change': return 'Status Change';
    case 'job_assignment': return 'Job Assignment';
    case 'salary_offer': return 'Salary Offer';
    case 'hire_approval': return 'Hire Approval';
    default: return type;
  }
};

export default ApprovalFlows;
