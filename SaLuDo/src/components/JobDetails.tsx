import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsApi, skillsApi } from '../utils/api';
import './css/CandidateForm.css'; // Using the same CSS for consistent styling

interface JobSkillRequirement {
  skillId: string;
  requiredLevel: number;
  evidence?: string;
  skillName?: string;
  isAccepted?: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeAcceptedOnly, setIncludeAcceptedOnly] = useState(false);
  const [minMatchThreshold, setMinMatchThreshold] = useState(50);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);

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
            ms.skillId === skill.skillId || ms._id === skill.skillId
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
                  skills: []
                });
              }
              
              // Enrich candidate skills with names
              const enrichedSkills = candidateData.skills.map((skill: any) => {
                if (!skill.skillName && skill.skillId) {
                  const masterSkill = masterSkills.find((ms: any) => 
                    ms.skillId === skill.skillId || ms._id === skill.skillId
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

      // Calculate match scores for each candidate
      candidateMap.forEach((candidate) => {
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
      matchScore: Math.round(matchScore * 10) / 10, // Round to 1 decimal
      matchedSkills,
      totalSkills: jobData.skills.length,
      calculation: `${totalScore.toFixed(1)} points out of ${maxPossibleScore} possible = ${matchScore.toFixed(1)}%`,
      missingSkills,
      skills: candidate.skills
    };
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
      height: 'calc(100vh - 70px)', // Account for header height
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
        {/* Header */}          <div style={{ marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <nav style={{ fontSize: '14px', color: '#6b7280' }}>
              <span onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', color: '#007bff' }}>Dashboard</span> {' > '}
              <span onClick={() => navigate('/job-list')} style={{ cursor: 'pointer', color: '#007bff' }}>Jobs</span> {' > '}
              <span>{job.jobName}</span>
            </nav>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button 
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
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
          <div style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
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
                style={{ 
                  width: '100%',
                  padding: '12px 16px', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: 'pointer',
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
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer',
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
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '24px', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            minHeight: '300px', // Fixed minimum height
            maxHeight: '600px', // Prevent it from growing too large
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: '0', fontSize: '24px', color: '#1f2937' }}>Skills Required ({job.skills.length})</h2>
              <button 
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                + Add Skill
              </button>
            </div>

            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              flex: 1 // Take remaining space
            }}>
              {job.skills.map((skill, index) => (
                <div 
                  key={index}
                  style={{ 
                    backgroundColor: 'white', 
                    padding: '16px', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e7eb',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: '0', color: '#1f2937', fontSize: '16px' }}>
                      {skill.skillName || 'Unknown Skill'}
                      {skill.skillId && skill.skillName && skill.skillName !== skill.skillId && (
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>
                          {' '}(ID: {skill.skillId})
                        </span>
                      )}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* <button style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                      <button style={{ padding: '4px 8px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button> */}
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
              ))}
            </div>
          </div>
        </div>

        {/* Candidate Matches Panel - Full Width */}
        <div style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: '0', fontSize: '24px', color: '#1f2937' }}>Candidate Matches</h2>
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
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Match Statistics */}
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

          {/* Candidates List */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
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
                            Candidate {candidate.candidateId}
                          </h3>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            Skills Match: {candidate.matchedSkills}/{candidate.totalSkills} skills
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
                      onClick={() => navigate(`/candidate/${candidate.candidateId}`)}
                      style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      View Profile
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
