import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsApi, skillsApi, candidatesApi } from '../utils/api';
import './css/JobDetails.css';

interface JobSkillRequirement {
  skillId: string;
  requiredLevel: number;
  evidence?: string;
  skillName?: string;
  isAccepted?: boolean;
  addedBy?: string;
}

interface Job {
  _id: string;
  jobName: string;
  jobDescription: string;
  skills: JobSkillRequirement[];
  createdAt: string;
  updatedAt: string;
}

interface CandidateSkill {
  skillId: string;
  score: number;
  evidence: string;
  skillName: string;
  isAccepted: boolean;
}

interface CandidateMatch {
  candidateId: string;
  candidateName: string;
  matchScore: number;
  matchedSkills: number;
  totalSkills: number;
  calculation: string;
  missingSkills: string[];
  skills: CandidateSkill[];
}

const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [candidateMatches, setCandidateMatches] = useState<CandidateMatch[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'matches' | 'applicants'>('matches');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeAcceptedOnly, setIncludeAcceptedOnly] = useState(false);
  const [minMatchThreshold, setMinMatchThreshold] = useState(50);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [showEditSkillModal, setShowEditSkillModal] = useState(false);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [editJobData, setEditJobData] = useState({ jobName: '', jobDescription: '' });
  const [newSkill, setNewSkill] = useState({ skillName: '', requiredLevel: 5, evidence: '' });
  const [editSkillData, setEditSkillData] = useState({ skillName: '', requiredLevel: 5, evidence: '' });
  const [masterSkillsList, setMasterSkillsList] = useState<any[]>([]);
  const [skillSuggestions, setSkillSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch master skills list for autocomplete
  useEffect(() => {
    const fetchMasterSkills = async () => {
      try {
        const response = await skillsApi.getAllMasterSkills();
        if (response.success && response.data) {
          console.log('Master skills loaded:', response.data.length, 'skills');
          console.log('Sample master skill:', response.data[0]);
          setMasterSkillsList(response.data);
        }
      } catch (error) {
        console.error('Error fetching master skills:', error);
      }
    };
    fetchMasterSkills();
  }, []);

  // Fetch job details
  const fetchJobDetails = async () => {
    if (!jobId) return;
    
    try {
      setIsLoading(true);
      const response = await jobsApi.getJob(jobId, true);
      
      if (response.success && response.data) {
        const jobData = response.data;
        
        // Enrich skills with names from master skills list
        await enrichSkillsWithNames(jobData);
        
        setJob(jobData);
        await calculateCandidateMatches(jobData);
        await fetchApplicants(jobId);
        setError(null);
      } else {
        throw new Error('Failed to load job details');
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced skill name enrichment function
  const enrichSkillsWithNames = async (jobData: Job) => {
    try {
      // Get all master skills to use for name resolution
      const skillResponse = await skillsApi.getAllMasterSkills();
      let masterSkills: any[] = [];
      
      if (skillResponse.success && skillResponse.data) {
        masterSkills = skillResponse.data;
      }

      // Enrich each job skill with name and acceptance status
      jobData.skills = jobData.skills.map((skill: JobSkillRequirement) => {
        if (!skill.skillName && skill.skillId) {
          // Try to find the skill in master skills
          const masterSkill = masterSkills.find((ms: any) => 
            ms.skillId === skill.skillId
          );
          
          if (masterSkill) {
            skill.skillName = masterSkill.skillName;
            skill.isAccepted = masterSkill.isAccepted;
          } else {
            // Fallback: create a readable name from skillId
            skill.skillName = skill.skillId.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase()).trim();
            console.warn(`Could not find skill name for ID: ${skill.skillId}, using fallback: ${skill.skillName}`);
          }
        }
        return skill;
      });

    } catch (err) {
      console.error('Error enriching skills with names:', err);
      // Fallback: ensure all skills have at least a readable name
      jobData.skills = jobData.skills.map((skill: JobSkillRequirement) => {
        if (!skill.skillName) {
          skill.skillName = skill.skillId ? 
            skill.skillId.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase()).trim() : 
            'Unknown Skill';
        }
        return skill;
      });
    }
  };

  // Calculate candidate matches based on job requirements
  const calculateCandidateMatches = async (jobData: Job) => {
    try {
      const allMatches: CandidateMatch[] = [];
      const candidateMap = new Map<string, any>();

      // Get all master skills for name resolution
      const skillResponse = await skillsApi.getAllMasterSkills();
      let masterSkills: any[] = [];
      
      if (skillResponse.success && skillResponse.data) {
        masterSkills = skillResponse.data;
      }

      // For each job skill, get candidates who have that skill
      for (const jobSkill of jobData.skills) {
        if (jobSkill.skillName) {
          const response = await skillsApi.getCandidatesWithSkill(jobSkill.skillName);
          
          if (response.success && response.data) {
            response.data.forEach((candidateData: any) => {
              if (!candidateMap.has(candidateData.candidateId)) {
                candidateMap.set(candidateData.candidateId, {
                  candidateId: candidateData.candidateId,
                  candidateName: null, // Will be fetched separately
                  skills: []
                });
              }
              
              // Enrich candidate skills with names
              const enrichedSkills = candidateData.skills.map((skill: any) => {
                if (!skill.skillName && skill.skillId) {
                  const masterSkill = masterSkills.find((ms: any) => 
                    ms.skillId === skill.skillId
                  );
                  if (masterSkill) {
                    skill.skillName = masterSkill.skillName;
                    skill.isAccepted = masterSkill.isAccepted;
                  } else {
                    skill.skillName = skill.skillId.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase()).trim();
                  }
                }
                return skill;
              });
              
              candidateMap.get(candidateData.candidateId).skills.push(...enrichedSkills);
            });
          }
        }
      }

      // Fetch candidate names for all candidates found
      const candidateNamesMap = new Map<string, string>();
      try {
        const candidatesResponse = await candidatesApi.getAllCandidates();
        if (candidatesResponse.success && candidatesResponse.data) {
          candidatesResponse.data.forEach((candidate: any) => {
            candidateNamesMap.set(candidate.candidateId, candidate.name);
          });
        }
      } catch (error) {
        console.warn('Could not fetch candidate names:', error);
      }

      // Calculate match scores for each candidate
      candidateMap.forEach((candidate) => {
        // Set candidate name from the fetched names or fallback
        candidate.candidateName = candidateNamesMap.get(candidate.candidateId) || `Candidate ${candidate.candidateId}`;
        
        const match = calculateMatchScore(candidate, jobData);
        if (match.matchScore >= minMatchThreshold) {
          allMatches.push(match);
        }
      });

      // Sort by match score (highest first)
      allMatches.sort((a, b) => b.matchScore - a.matchScore);
      setCandidateMatches(allMatches);
    } catch (err) {
      console.error('Error calculating candidate matches:', err);
    }
  };

  // Calculate match score for a single candidate
  const calculateMatchScore = (candidate: any, jobData: Job): CandidateMatch => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    let matchedSkills = 0;
    const calculations: string[] = [];
    const missingSkills: string[] = [];

    jobData.skills.forEach(jobSkill => {
      const candidateSkill = candidate.skills.find((cs: any) => cs.skillId === jobSkill.skillId);
      
      if (candidateSkill) {
        // Include only if skill is accepted (when toggle is ON) or if toggle is OFF
        if (!includeAcceptedOnly || candidateSkill.isAccepted) {
          const skillScore = jobSkill.requiredLevel * candidateSkill.score;
          totalScore += skillScore;
          matchedSkills++;
          calculations.push(`${candidateSkill.skillName}: ${jobSkill.requiredLevel}×${candidateSkill.score} = ${skillScore.toFixed(1)}`);
        }
      } else {
        missingSkills.push(`${jobSkill.skillName} (Required: ${jobSkill.requiredLevel})`);
      }
      
      maxPossibleScore += jobSkill.requiredLevel * 10; // Max candidate score is 10
    });

    const matchScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    return {
      candidateId: candidate.candidateId,
      candidateName: candidate.candidateName,
      matchScore: Math.round(matchScore * 10) / 10, // Round to 1 decimal
      matchedSkills,
      totalSkills: jobData.skills.length,
      calculation: `${totalScore.toFixed(1)} points out of ${maxPossibleScore} possible = ${matchScore.toFixed(1)}%`,
      missingSkills,
      skills: candidate.skills
    };
  };

  // Fetch candidates who have applied for this job
  const fetchApplicants = async (jobId: string) => {
    try {
      const candidatesResponse = await candidatesApi.getAllCandidates();
      
      if (candidatesResponse.success && candidatesResponse.data) {
        // Filter candidates who applied for this job
        const jobApplicants = candidatesResponse.data.filter(
          (candidate: any) => candidate.roleApplied === jobId
        );
        setApplicants(jobApplicants);
      } else {
        setApplicants([]);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setApplicants([]);
    }
  };

  // Generate application link and QR code
  const generateApplicationLink = () => {
    const baseUrl = window.location.origin;
    const applicationUrl = `${baseUrl}/candidate-form?jobId=${jobId}`;
    
    // Generate QR code using QR Server API (free service)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(applicationUrl)}`;
    setQrCodeUrl(qrUrl);
    setShowQRCode(true);
    
    // Copy link to clipboard
    navigator.clipboard.writeText(applicationUrl).then(() => {
      alert(`Application link copied to clipboard!\n\nLink: ${applicationUrl}`);
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      prompt('Copy this application link:', applicationUrl);
    });
  };

  // Download QR code
  const downloadQRCode = async () => {
    if (qrCodeUrl) {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `job-${jobId}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  // Get match category and color
  const getMatchCategory = (score: number) => {
    if (score >= 90) return { label: 'Perfect Match', color: '#10b981' };
    if (score >= 70) return { label: 'Good Match', color: '#f59e0b' };
    if (score >= 50) return { label: 'Partial Match', color: '#f97316' };
    return { label: 'Poor Match', color: '#ef4444' };
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    if (job) {
      calculateCandidateMatches(job);
    }
  }, [includeAcceptedOnly, minMatchThreshold]);

  if (isLoading) {
    return (
      <div className="candidateform-bg">
        <div className="form-container">
          <h2 className="form-title">Loading Job Details...</h2>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="candidateform-bg">
        <div className="form-container">
          <h2 className="form-title">Error</h2>
          <p style={{ color: '#ef4444', textAlign: 'center' }}>
            {error || 'Job not found'}
          </p>
          <button 
            onClick={() => navigate('/job-list')}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Back to Job List
          </button>
        </div>
      </div>
    );
  }

  const perfectMatches = candidateMatches.filter(c => c.matchScore >= 90).length;
  const goodMatches = candidateMatches.filter(c => c.matchScore >= 70 && c.matchScore < 90).length;
  const partialMatches = candidateMatches.filter(c => c.matchScore >= 50 && c.matchScore < 70).length;
  const poorMatches = candidateMatches.filter(c => c.matchScore < 50).length;

  return (
    <div style={{ 
      padding: '20px', 
      height: 'calc(100vh - 70px)',
      overflow: 'auto',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ 
        maxWidth: '100%', 
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <nav style={{ fontSize: '14px', color: '#6b7280' }}>
              <span onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', color: '#007bff' }}>Dashboard</span> {' > '}
              <span onClick={() => navigate('/job-list')} style={{ cursor: 'pointer', color: '#007bff' }}>Jobs</span> {' > '}
              <span>{job.jobName}</span>
            </nav>
            <div className="job-details-header-actions">
              <button 
                onClick={() => navigate(`/jobs/${jobId}/scoring-settings`)}
                className="btn-secondary"
                title="Configure scoring weights for this job"
              >
                Scoring Settings
              </button>
              <button 
                onClick={() => {
                  setEditJobData({ jobName: job.jobName, jobDescription: job.jobDescription });
                  setShowEditJobModal(true);
                }}
                className="btn-primary"
              >
                Edit
              </button>
              <button 
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to delete the job "${job.jobName}"? This action cannot be undone.`)) {
                    try {
                      await jobsApi.deleteJob(jobId!);
                      alert('Job deleted successfully!');
                      navigate('/job-list');
                    } catch (error) {
                      console.error('Error deleting job:', error);
                      alert('Failed to delete job. Please try again.');
                    }
                  }
                }}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
          <h1 className="form-title" style={{ margin: '0', fontSize: '32px' }}>Job Details</h1>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="job-details-grid">
          
          {/* Job Information Panel */}
          <div className="panel panel-half">
            <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#1f2937' }}>Job Information</h2>
            
            {/* Basic Info */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', color: '#1f2937', marginBottom: '8px' }}>{job.jobName}</h3>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '16px', 
                borderRadius: '6px', 
                border: '1px solid #e5e7eb',
                marginBottom: '16px'
              }}>
                <p style={{ margin: '0', color: '#4b5563', lineHeight: '1.6' }}>
                  {job.jobDescription.length > 200 
                    ? `${job.jobDescription.substring(0, 200)}...` 
                    : job.jobDescription
                  }
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                <span>Created: {formatDate(job.createdAt)}</span>
                <span>Updated: {formatDate(job.updatedAt)}</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="job-details-stats-grid">
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{job.skills.length}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Required Skills</div>
              </div>
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{candidateMatches.length}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Matches</div>
              </div>
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{perfectMatches}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Perfect Matches</div>
              </div>
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {job.skills.length > 0 ? (job.skills.reduce((sum, skill) => sum + skill.requiredLevel, 0) / job.skills.length).toFixed(1) : '0'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Avg Skill Level</div>
              </div>
            </div>

            {/* Application Link Section */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              border: '1px solid #e5e7eb',
              minHeight: '300px', // Fixed minimum height to prevent layout shifts
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1f2937' }}>Candidate Application</h3>
              
              <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
                Generate a direct application link for candidates to apply for this position:
              </p>
              
              <button
                onClick={generateApplicationLink}
                className="btn-primary"
                style={{ 
                  width: '100%',
                  backgroundColor: '#10b981',
                  marginBottom: '16px',
                  fontSize: '16px'
                }}
              >
                Generate Application Link & QR Code
              </button>

              {showQRCode && qrCodeUrl && (
                <div style={{ 
                  marginTop: 'auto', // Push to bottom of container
                  padding: '16px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center',
                  flexShrink: 0
                }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '16px' }}>QR Code for Easy Access</h4>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '180px',
                    margin: '0 auto'
                  }}>
                    <div style={{
                      padding: '8px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code for job application" 
                        style={{ 
                          width: '120px', 
                          height: '120px', 
                          display: 'block'
                        }}
                      />
                    </div>
                    <button
                      onClick={downloadQRCode}
                      className="btn-primary"
                      style={{ 
                        fontSize: '14px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Download QR Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skills Requirements Panel */}
          <div className="panel panel-half">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: '0', fontSize: '24px', color: '#1f2937' }}>Skills Required ({job.skills.length})</h2>
              <button 
                onClick={() => setShowAddSkillModal(true)}
                className="btn-primary"
                style={{ backgroundColor: '#10b981' }}
              >
                + Add Skill
              </button>
            </div>

            <div className="panel-content-scrollable">
              {job.skills.map((skill, index) => {
                const isAICreated = skill.addedBy === undefined || skill.addedBy === null;
                return (
                <div 
                  key={index}
                  className={`skill-card ${isAICreated ? 'ai-created' : 'human-created'}`}
                >
                  <div className="skill-card-header">
                    <div className="skill-card-title">
                      <h4 style={{ margin: '0', color: '#1f2937', fontSize: '16px' }}>
                        {skill.skillName || 'Unknown Skill'}
                        {skill.skillId && skill.skillName && skill.skillName !== skill.skillId && (
                          <span className="skill-card-title-id">
                            {' '}(ID: {skill.skillId})
                          </span>
                        )}
                      </h4>
                      <span className={`skill-badge ${isAICreated ? 'ai' : 'human'}`}>
                        {isAICreated ? 'AI' : 'Human'}
                      </span>
                    </div>
                    <div className="skill-card-actions">
                      <button 
                        onClick={() => {
                          setEditingSkillIndex(index);
                          setEditSkillData({
                            skillName: skill.skillName || '',
                            requiredLevel: skill.requiredLevel,
                            evidence: skill.evidence || ''
                          });
                          setShowEditSkillModal(true);
                        }}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete "${skill.skillName}"?`)) {
                            try {
                              const updatedSkillsForDisplay = job.skills.filter((_, i) => i !== index);
                              
                              // Validate that skill IDs exist in master skills
                              const validSkillIds = new Set(masterSkillsList.map((s: any) => s.skillId));
                              const updatedSkillsForBackend = updatedSkillsForDisplay
                                .filter(s => {
                                  const isValid = validSkillIds.has(s.skillId);
                                  if (!isValid) {
                                    console.warn('Removing invalid skill ID:', s.skillId, s.skillName);
                                  }
                                  return isValid;
                                })
                                .map(s => ({
                                  skillId: s.skillId,
                                  requiredLevel: s.requiredLevel,
                                  evidence: s.evidence || undefined
                                }));
                              
                              await jobsApi.updateJob(jobId!, { skills: updatedSkillsForBackend });
                              setJob({ ...job, skills: updatedSkillsForDisplay });
                              alert('Skill deleted successfully!');
                            } catch (error) {
                              console.error('Error deleting skill:', error);
                              alert('Failed to delete skill. Please try again.');
                            }
                          }
                        }}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                      <span>Required Level:</span>
                      <span style={{ fontWeight: 'bold' }}>{skill.requiredLevel}/10</span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      backgroundColor: '#e5e7eb', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${(skill.requiredLevel / 10) * 100}%`, 
                        height: '100%', 
                        backgroundColor: '#007bff'
                      }} />
                    </div>
                  </div>
                  
                  {skill.evidence && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                      "{skill.evidence}"
                    </p>
                  )}
                </div>
              );
              })}
            </div>
          </div>
        </div>

        {/* Candidate Matches Panel - Full Width */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <h2 style={{ margin: '0', fontSize: '24px', color: '#1f2937' }}>Candidates</h2>
              <div className="view-toggle">
                <button
                  onClick={() => setViewMode('matches')}
                  className={`view-toggle-btn ${viewMode === 'matches' ? 'active' : ''}`}
                >
                  Matches ({candidateMatches.length})
                </button>
                <button
                  onClick={() => setViewMode('applicants')}
                  className={`view-toggle-btn ${viewMode === 'applicants' ? 'active' : ''}`}
                >
                  Applicants ({applicants.length})
                </button>
              </div>
            </div>
            {viewMode === 'matches' && (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={includeAcceptedOnly}
                    onChange={(e) => setIncludeAcceptedOnly(e.target.checked)}
                  />
                  Include Accepted Skills Only
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                Min Match:
                <select 
                  value={minMatchThreshold} 
                  onChange={(e) => setMinMatchThreshold(Number(e.target.value))}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                >
                  <option value={0}>0%</option>
                  <option value={25}>25%</option>
                  <option value={50}>50%</option>
                  <option value={70}>70%</option>
                  <option value={90}>90%</option>
                </select>
              </label>
              <button 
                onClick={() => calculateCandidateMatches(job)}
                className="btn-primary"
              >
                Refresh
              </button>
              </div>
            )}
          </div>

          {/* Match Statistics - Only show for matches view */}
          {viewMode === 'matches' && (
            <div className="job-details-match-stats">
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{perfectMatches}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Perfect Match (90-100%)</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>{goodMatches}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Good Match (70-89%)</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f97316' }}>{partialMatches}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Partial Match (50-69%)</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>{poorMatches}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Poor Match (&lt;50%)</div>
            </div>
          </div>
          )}

          {/* Candidates List - Conditional rendering based on view mode */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {viewMode === 'matches' ? (
              // Candidate Matches View
              <>
                {candidateMatches.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <p>No candidate matches found. Try adjusting your filters or adding more skills to the job.</p>
              </div>
            ) : (
              candidateMatches.map((candidate, index) => {
                const category = getMatchCategory(candidate.matchScore);
                return (
                  <div 
                    key={index}
                    style={{ 
                      backgroundColor: 'white', 
                      padding: '20px', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb',
                      marginBottom: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }}>•</div>
                        <div>
                          <h3 style={{ margin: '0', fontSize: '18px', color: '#1f2937' }}>
                            {candidate.candidateName}
                          </h3>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            ID: {candidate.candidateId} • Skills Match: {candidate.matchedSkills}/{candidate.totalSkills} skills
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold', 
                          color: category.color,
                          marginBottom: '4px'
                        }}>
                          {candidate.matchScore}%
                        </div>
                        <div style={{ fontSize: '12px', color: category.color }}>
                          {category.label}
                        </div>
                      </div>
                    </div>

                    {/* Skills Progress Bar */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        width: '100%', 
                        height: '12px', 
                        backgroundColor: '#e5e7eb', 
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${candidate.matchScore}%`, 
                          height: '100%', 
                          backgroundColor: category.color,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Calculation Details */}
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                      <strong>Calculation:</strong> {candidate.calculation}
                    </div>

                    {/* Missing Skills */}
                    {candidate.missingSkills.length > 0 && (
                      <div style={{ fontSize: '14px', color: '#ef4444', marginBottom: '12px' }}>
                        <strong>Missing:</strong> {candidate.missingSkills.join(', ')}
                      </div>
                    )}

                    {/* View Profile Button */}
                    <button
                      onClick={() => navigate(`/profile/${candidate.candidateId}`)}
                      className="btn-primary"
                    >
                      View Profile
                    </button>
                  </div>
                );
              })
            )}
            </>
            ) : (
              // Applicants View
              <>
                {applicants.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>No applicants yet. Share the job posting to receive applications.</p>
                  </div>
                ) : (
                  applicants.map((applicant, index) => (
                    <div 
                      key={index}
                      style={{ 
                        backgroundColor: 'white', 
                        padding: '20px', 
                        borderRadius: '8px', 
                        border: '1px solid #e5e7eb',
                        marginBottom: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }}>•</div>
                          <div>
                            <h3 style={{ margin: '0', fontSize: '18px', color: '#1f2937' }}>
                              {applicant.name}
                            </h3>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              ID: {applicant.candidateId} • Email: {applicant.email || 'N/A'}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                              Status: <span style={{ 
                                fontWeight: 'bold',
                                color: applicant.status === 'Approved' ? '#10b981' : 
                                       applicant.status === 'Rejected' ? '#ef4444' : '#f59e0b'
                              }}>{applicant.status}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                            Applied: {new Date(applicant.dateCreated).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            Skills: {applicant.skills?.length || 0}
                          </div>
                        </div>
                      </div>

                      {/* Applicant Quick Info */}
                      <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {applicant.phone && (
                          <div><strong>Phone:</strong> {applicant.phone}</div>
                        )}
                        {applicant.location && (
                          <div><strong>Location:</strong> {applicant.location}</div>
                        )}
                      </div>

                      {/* View Profile Button */}
                      <button
                        onClick={() => navigate(`/profile/${applicant.candidateId}`)}
                        className="btn-primary"
                      >
                        View Profile
                      </button>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Job Modal */}
      {showEditJobModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h2 className="modal-header">Edit Job Details</h2>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Job Name
              </label>
              <input
                type="text"
                value={editJobData.jobName}
                onChange={(e) => setEditJobData({ ...editJobData, jobName: e.target.value })}
                placeholder="Enter job name"
                className="modal-input"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-label">
                Job Description
              </label>
              <textarea
                value={editJobData.jobDescription}
                onChange={(e) => setEditJobData({ ...editJobData, jobDescription: e.target.value })}
                placeholder="Enter job description"
                rows={6}
                className="modal-textarea"
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowEditJobModal(false);
                }}
                className="modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await jobsApi.updateJob(jobId!, {
                      jobName: editJobData.jobName,
                      jobDescription: editJobData.jobDescription
                    });
                    // Update local state
                    if (job) {
                      setJob({
                        ...job,
                        jobName: editJobData.jobName,
                        jobDescription: editJobData.jobDescription
                      });
                    }
                    setShowEditJobModal(false);
                    alert('Job updated successfully!');
                  } catch (error) {
                    console.error('Error updating job:', error);
                    alert('Failed to update job. Please try again.');
                  }
                }}
                disabled={!editJobData.jobName.trim() || !editJobData.jobDescription.trim()}
                className="modal-btn-submit"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Skill Modal */}
      {showEditSkillModal && editingSkillIndex !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-header">Edit Skill</h2>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Skill Name
              </label>
              <input
                type="text"
                value={editSkillData.skillName}
                onChange={(e) => setEditSkillData({ ...editSkillData, skillName: e.target.value })}
                placeholder="Enter skill name"
                className="modal-input"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-label">
                Required Level: {editSkillData.requiredLevel}/10
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={editSkillData.requiredLevel}
                onChange={(e) => setEditSkillData({ ...editSkillData, requiredLevel: parseFloat(e.target.value) })}
                className="modal-range"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-label">
                Evidence/Justification (Optional)
              </label>
              <textarea
                value={editSkillData.evidence}
                onChange={(e) => setEditSkillData({ ...editSkillData, evidence: e.target.value })}
                placeholder="Why is this skill required?"
                rows={3}
                className="modal-textarea"
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowEditSkillModal(false);
                  setEditingSkillIndex(null);
                }}
                className="modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const updatedSkillsForDisplay = [...job.skills];
                    updatedSkillsForDisplay[editingSkillIndex] = {
                      ...updatedSkillsForDisplay[editingSkillIndex],
                      skillName: editSkillData.skillName,
                      requiredLevel: editSkillData.requiredLevel,
                      evidence: editSkillData.evidence
                    };
                    
                    // Send only backend-compatible fields and filter out invalid skill IDs
                    const validSkillIds = new Set(masterSkillsList.map((s: any) => s.skillId));
                    const updatedSkillsForBackend = updatedSkillsForDisplay
                      .filter(s => {
                        const isValid = validSkillIds.has(s.skillId);
                        if (!isValid) {
                          console.warn('Removing invalid skill ID:', s.skillId, s.skillName);
                        }
                        return isValid;
                      })
                      .map(s => ({
                        skillId: s.skillId,
                        requiredLevel: s.requiredLevel,
                        evidence: s.evidence || undefined
                      }));
                    
                    await jobsApi.updateJob(jobId!, { skills: updatedSkillsForBackend });
                    setJob({ ...job, skills: updatedSkillsForDisplay });
                    setShowEditSkillModal(false);
                    setEditingSkillIndex(null);
                    alert('Skill updated successfully!');
                  } catch (error) {
                    console.error('Error updating skill:', error);
                    alert('Failed to update skill. Please try again.');
                  }
                }}
                disabled={!editSkillData.skillName.trim()}
                className="modal-btn-submit"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddSkillModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-header">Add New Skill</h2>
            
            <div className="modal-form-group autocomplete">
              <label className="modal-label">
                Skill Name
              </label>
              <input
                type="text"
                value={newSkill.skillName}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewSkill({ ...newSkill, skillName: value });
                  
                  // Filter suggestions
                  if (value.trim().length > 0) {
                    const filtered = masterSkillsList.filter((skill: any) =>
                      skill.skillName.toLowerCase().includes(value.toLowerCase())
                    ).slice(0, 10); // Limit to 10 suggestions
                    setSkillSuggestions(filtered);
                    setShowSuggestions(filtered.length > 0);
                  } else {
                    // Show all skills when input is empty
                    const allSkills = masterSkillsList.slice(0, 10);
                    setSkillSuggestions(allSkills);
                    setShowSuggestions(allSkills.length > 0);
                  }
                }}
                onFocus={() => {
                  // Show suggestions on focus
                  if (newSkill.skillName.trim().length > 0) {
                    const filtered = masterSkillsList.filter((skill: any) =>
                      skill.skillName.toLowerCase().includes(newSkill.skillName.toLowerCase())
                    ).slice(0, 10);
                    setSkillSuggestions(filtered);
                    setShowSuggestions(filtered.length > 0);
                  } else {
                    // Show first 10 skills if input is empty
                    const allSkills = masterSkillsList.slice(0, 10);
                    setSkillSuggestions(allSkills);
                    setShowSuggestions(allSkills.length > 0);
                  }
                }}
                onBlur={() => {
                  // Delay to allow click on suggestion
                  setTimeout(() => setShowSuggestions(false), 300);
                }}
                placeholder="Enter or search for a skill"
                className="modal-input"
              />
              
              {/* Autocomplete suggestions dropdown */}
              {showSuggestions && skillSuggestions.length > 0 && (
                <div 
                  className="autocomplete-dropdown"
                  onMouseDown={(e) => {
                    // Prevent blur event when clicking on dropdown
                    e.preventDefault();
                  }}
                >
                  {skillSuggestions.map((skill: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => {
                        setNewSkill({ ...newSkill, skillName: skill.skillName });
                        setShowSuggestions(false);
                      }}
                      className="autocomplete-item"
                    >
                      <div className="autocomplete-item-name">{skill.skillName}</div>
                      {skill.skillId && (
                        <div className="autocomplete-item-id">ID: {skill.skillId}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-form-group">
              <label className="modal-label">
                Required Level: {newSkill.requiredLevel}/10
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={newSkill.requiredLevel}
                onChange={(e) => setNewSkill({ ...newSkill, requiredLevel: parseFloat(e.target.value) })}
                className="modal-range"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-label">
                Evidence/Justification (Optional)
              </label>
              <textarea
                value={newSkill.evidence}
                onChange={(e) => setNewSkill({ ...newSkill, evidence: e.target.value })}
                placeholder="Why is this skill required?"
                rows={3}
                className="modal-textarea"
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowAddSkillModal(false);
                  setNewSkill({ skillName: '', requiredLevel: 5, evidence: '' });
                }}
                className="modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    // Find the skill in master skills list to get the skillId
                    const masterSkill = masterSkillsList.find(
                      (skill: any) => skill.skillName === newSkill.skillName
                    );
                    
                    if (!masterSkill) {
                      alert('Please select a skill from the suggestions list.');
                      return;
                    }

                    console.log('Master skill found:', masterSkill);
                    console.log('Master skill skillId:', masterSkill.skillId);
                    
                    if (!masterSkill.skillId) {
                      alert('Selected skill does not have a valid skillId. Please try another skill.');
                      console.error('Invalid master skill:', masterSkill);
                      return;
                    }

                    // Prepare skills for backend - only include skills with valid IDs
                    // Validate that existing skill IDs exist in master skills
                    const validSkillIds = new Set(masterSkillsList.map((s: any) => s.skillId));
                    
                    const backendSkills = job.skills
                      .filter(skill => {
                        const isValid = validSkillIds.has(skill.skillId);
                        if (!isValid) {
                          console.warn('Removing invalid skill ID from job:', skill.skillId, skill.skillName);
                        }
                        return isValid;
                      })
                      .map(skill => ({
                        skillId: skill.skillId,
                        requiredLevel: skill.requiredLevel,
                        evidence: skill.evidence || undefined
                      }));

                    // Add new skill
                    const newSkillData = {
                      skillId: masterSkill.skillId,
                      requiredLevel: newSkill.requiredLevel,
                      evidence: newSkill.evidence || undefined
                    };
                    
                    console.log('Adding skill to job:', newSkillData);
                    backendSkills.push(newSkillData);
                    
                    console.log('All valid skills being sent:', backendSkills);

                    await jobsApi.updateJob(jobId!, { skills: backendSkills });
                    
                    // Update local state with enriched data for display
                    const enrichedSkills = [
                      ...job.skills,
                      {
                        skillId: masterSkill.skillId,
                        skillName: newSkill.skillName,
                        requiredLevel: newSkill.requiredLevel,
                        evidence: newSkill.evidence,
                        isAccepted: masterSkill.isAccepted
                      }
                    ];
                    
                    setJob({ ...job, skills: enrichedSkills });
                    setShowAddSkillModal(false);
                    setNewSkill({ skillName: '', requiredLevel: 5, evidence: '' });
                    alert('Skill added successfully!');
                  } catch (error) {
                    console.error('Error adding skill:', error);
                    alert('Failed to add skill. Please try again.');
                  }
                }}
                disabled={!newSkill.skillName.trim()}
                className="modal-btn-submit"
                style={{
                  backgroundColor: newSkill.skillName.trim() ? '#10b981' : '#d1d5db'
                }}
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
