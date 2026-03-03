import React, { useState, useEffect } from 'react';
import { LoadingSpinner, ErrorMessage, ConfirmDialog } from '../common';
import { CandidateData, CandidateStatus } from '../../types/CandidateApiTypes';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  conditions?: AutomationCondition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationTrigger {
  type: 'status_change' | 'time_elapsed' | 'score_threshold' | 'interview_completed' | 'resume_uploaded';
  fromStatus?: CandidateStatus;
  toStatus?: CandidateStatus;
  timeValue?: number;
  timeUnit?: 'hours' | 'days' | 'weeks';
  scoreType?: 'overall' | 'technical' | 'communication';
  threshold?: number;
  operator?: 'greater_than' | 'less_than' | 'equals';
}

export interface AutomationAction {
  type: 'change_status' | 'send_email' | 'schedule_interview' | 'add_note' | 'assign_job' | 'notify_team';
  targetStatus?: CandidateStatus;
  emailTemplate?: string;
  recipients?: string[];
  noteContent?: string;
  jobId?: string;
  teamMembers?: string[];
  delay?: number;
  delayUnit?: 'hours' | 'days';
}

export interface AutomationCondition {
  field: 'score' | 'experience_years' | 'education_level' | 'skill_count' | 'job_match';
  operator: 'greater_than' | 'less_than' | 'equals' | 'contains';
  value: string | number;
}

interface PipelineAutomationProps {
  onRuleCreate?: (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onRuleUpdate?: (ruleId: string, updates: Partial<AutomationRule>) => Promise<void>;
  onRuleDelete?: (ruleId: string) => Promise<void>;
  onRuleToggle?: (ruleId: string, isActive: boolean) => Promise<void>;
}

export const PipelineAutomation: React.FC<PipelineAutomationProps> = ({
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete,
  onRuleToggle
}) => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockRules: AutomationRule[] = [
        {
          id: '1',
          name: 'Auto-advance qualified candidates',
          description: 'Automatically move candidates to technical interview when they pass initial screening',
          isActive: true,
          trigger: {
            type: 'status_change',
            fromStatus: CandidateStatus.FOR_REVIEW,
            toStatus: CandidateStatus.PAPER_SCREENING
          },
          actions: [
            {
              type: 'change_status',
              targetStatus: CandidateStatus.OFFER_EXTENDED,
              delay: 1,
              delayUnit: 'hours'
            },
            {
              type: 'send_email',
              emailTemplate: 'technical_interview_invitation',
              recipients: ['candidate']
            }
          ],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          name: 'Follow up on pending interviews',
          description: 'Send reminder emails for interviews scheduled more than 2 days ago',
          isActive: true,
          trigger: {
            type: 'time_elapsed',
            timeValue: 2,
            timeUnit: 'days'
          },
          actions: [
            {
              type: 'send_email',
              emailTemplate: 'interview_reminder',
              recipients: ['candidate', 'interviewer']
            }
          ],
          conditions: [
            {
              field: 'job_match',
              operator: 'equals',
              value: 'technical_interview'
            }
          ],
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-20')
        }
      ];
      setRules(mockRules);
    } catch (err) {
      setError('Failed to load automation rules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (ruleData: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await onRuleCreate?.(ruleData);
      setShowRuleForm(false);
      loadRules();
    } catch (err) {
      setError('Failed to create automation rule');
    }
  };

  const handleUpdateRule = async (ruleId: string, updates: Partial<AutomationRule>) => {
    try {
      await onRuleUpdate?.(ruleId, updates);
      setEditingRule(null);
      loadRules();
    } catch (err) {
      setError('Failed to update automation rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await onRuleDelete?.(ruleId);
      setDeleteConfirm(null);
      loadRules();
    } catch (err) {
      setError('Failed to delete automation rule');
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await onRuleToggle?.(ruleId, isActive);
      loadRules();
    } catch (err) {
      setError('Failed to toggle automation rule');
    }
  };

  const formatTrigger = (trigger: AutomationTrigger): string => {
    switch (trigger.type) {
      case 'status_change':
        return `When status changes from ${trigger.fromStatus} to ${trigger.toStatus}`;
      case 'time_elapsed':
        return `After ${trigger.timeValue} ${trigger.timeUnit} have elapsed`;
      case 'score_threshold':
        return `When ${trigger.scoreType} score is ${trigger.operator?.replace('_', ' ')} ${trigger.threshold}`;
      case 'interview_completed':
        return 'When interview is completed';
      case 'resume_uploaded':
        return 'When resume is uploaded';
      default:
        return 'Unknown trigger';
    }
  };

  const formatActions = (actions: AutomationAction[]): string => {
    return actions.map(action => {
      switch (action.type) {
        case 'change_status':
          return `Change status to ${action.targetStatus}`;
        case 'send_email':
          return `Send email using ${action.emailTemplate} template`;
        case 'schedule_interview':
          return 'Schedule interview';
        case 'add_note':
          return 'Add note';
        case 'assign_job':
          return 'Assign to job';
        case 'notify_team':
          return 'Notify team members';
        default:
          return 'Unknown action';
      }
    }).join(', ');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="pipeline-automation">
      <div className="automation-header">
        <div>
          <h2>Pipeline Automation</h2>
          <p>Automate repetitive tasks in your recruitment pipeline</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowRuleForm(true)}
        >
          Create Automation Rule
        </button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <div className="automation-stats">
        <div className="stat-card">
          <h3>{rules.length}</h3>
          <p>Total Rules</p>
        </div>
        <div className="stat-card">
          <h3>{rules.filter(r => r.isActive).length}</h3>
          <p>Active Rules</p>
        </div>
        <div className="stat-card">
          <h3>127</h3>
          <p>Actions This Week</p>
        </div>
        <div className="stat-card">
          <h3>89%</h3>
          <p>Success Rate</p>
        </div>
      </div>

      <div className="automation-rules">
        {rules.map(rule => (
          <div key={rule.id} className={`rule-card ${rule.isActive ? 'active' : 'inactive'}`}>
            <div className="rule-header">
              <div className="rule-info">
                <h3>{rule.name}</h3>
                <p>{rule.description}</p>
              </div>
              <div className="rule-controls">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={rule.isActive}
                    onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditingRule(rule)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setDeleteConfirm(rule.id)}
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="rule-details">
              <div className="rule-section">
                <h4>Trigger</h4>
                <p>{formatTrigger(rule.trigger)}</p>
              </div>
              
              {rule.conditions && rule.conditions.length > 0 && (
                <div className="rule-section">
                  <h4>Conditions</h4>
                  <ul>
                    {rule.conditions.map((condition, index) => (
                      <li key={index}>
                        {condition.field} {condition.operator.replace('_', ' ')} {condition.value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="rule-section">
                <h4>Actions</h4>
                <p>{formatActions(rule.actions)}</p>
              </div>
            </div>

            <div className="rule-footer">
              <span className="rule-meta">
                Created: {rule.createdAt.toLocaleDateString()} • 
                Updated: {rule.updatedAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showRuleForm && (
        <AutomationRuleForm
          onSubmit={handleCreateRule}
          onCancel={() => setShowRuleForm(false)}
        />
      )}

      {editingRule && (
        <AutomationRuleForm
          rule={editingRule}
          onSubmit={(ruleData) => handleUpdateRule(editingRule.id, ruleData)}
          onCancel={() => setEditingRule(null)}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Automation Rule"
          message="Are you sure you want to delete this automation rule? This action cannot be undone."
          onConfirm={() => handleDeleteRule(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

interface AutomationRuleFormProps {
  rule?: AutomationRule;
  onSubmit: (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const AutomationRuleForm: React.FC<AutomationRuleFormProps> = ({
  rule,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    isActive: rule?.isActive ?? true,
    trigger: {
      type: 'status_change' as const,
      fromStatus: CandidateStatus.FOR_REVIEW,
      toStatus: CandidateStatus.PAPER_SCREENING
    },
    actions: rule?.actions || [],
    conditions: rule?.conditions || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, {
        type: 'change_status',
        targetStatus: CandidateStatus.OFFER
      }]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal rule-form-modal">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3>{rule ? 'Edit' : 'Create'} Automation Rule</h3>
            <button type="button" onClick={onCancel} className="close-btn">×</button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label>Rule Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({...prev, isActive: e.target.checked}))}
                />
                Active
              </label>
            </div>

            <div className="form-section">
              <h4>Trigger</h4>
              <div className="form-group">
                <label>Trigger Type</label>
                <select
                  value={formData.trigger.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    trigger: {...prev.trigger, type: e.target.value as AutomationTrigger['type']}
                  }))}
                >
                  <option value="status_change">Status Change</option>
                  <option value="time_elapsed">Time Elapsed</option>
                  <option value="score_threshold">Score Threshold</option>
                  <option value="interview_completed">Interview Completed</option>
                  <option value="resume_uploaded">Resume Uploaded</option>
                </select>
              </div>

              {formData.trigger.type === 'status_change' && (
                <>
                  <div className="form-group">
                    <label>From Status</label>
                    <select
                      value={formData.trigger.fromStatus || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        trigger: {...prev.trigger, fromStatus: e.target.value as CandidateStatus}
                      }))}
                    >
                      {Object.values(CandidateStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>To Status</label>
                    <select
                      value={formData.trigger.toStatus || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        trigger: {...prev.trigger, toStatus: e.target.value as CandidateStatus}
                      }))}
                    >
                      {Object.values(CandidateStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="form-section">
              <div className="section-header">
                <h4>Actions</h4>
                <button type="button" onClick={addAction} className="btn btn-secondary btn-sm">
                  Add Action
                </button>
              </div>
              
              {formData.actions.map((action, index) => (
                <div key={index} className="action-item">
                  <select
                    value={action.type}
                    onChange={(e) => {
                      const newActions = [...formData.actions];
                      newActions[index] = {...action, type: e.target.value as AutomationAction['type']};
                      setFormData(prev => ({...prev, actions: newActions}));
                    }}
                  >
                    <option value="change_status">Change Status</option>
                    <option value="send_email">Send Email</option>
                    <option value="schedule_interview">Schedule Interview</option>
                    <option value="add_note">Add Note</option>
                    <option value="assign_job">Assign Job</option>
                    <option value="notify_team">Notify Team</option>
                  </select>
                  
                  {action.type === 'change_status' && (
                    <select
                      value={action.targetStatus || ''}
                      onChange={(e) => {
                        const newActions = [...formData.actions];
                        newActions[index] = {...action, targetStatus: e.target.value as CandidateStatus};
                        setFormData(prev => ({...prev, actions: newActions}));
                      }}
                    >
                      {Object.values(CandidateStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="btn btn-danger btn-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {rule ? 'Update' : 'Create'} Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PipelineAutomation;
