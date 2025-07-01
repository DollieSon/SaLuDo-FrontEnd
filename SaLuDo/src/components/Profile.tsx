import './css/Profile.css';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip} from 'recharts';
import { candidatesApi } from '../utils/api';
import { CandidateProfile, PersonalityData, ProfileItem, PersonalityTrait } from '../types/profile';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [personality, setPersonality] = useState<PersonalityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data fetching functions
  const fetchCandidateData = async () => {
    if (!id) {
      setError('No candidate ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch candidate data
      const candidateResponse = await candidatesApi.getCandidateById(id);
      if (candidateResponse.success) {
        setCandidate(candidateResponse.data);
      } else {
        throw new Error('Failed to fetch candidate data');
      }

      // Fetch personality data (optional)
      try {
        const personalityResponse = await candidatesApi.getCandidatePersonality(id);
        if (personalityResponse.success) {
          setPersonality(personalityResponse.data);
        }
      } catch (personalityError) {
        console.log('Personality data not available:', personalityError);
        // Don't fail the whole component if personality data is missing
      }

    } catch (err) {
      console.error('Error fetching candidate data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load candidate profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateData();
  }, [id]);

  // Data transformation functions
  const transformToProfileItems = (items: any[], textField: string = 'description'): ProfileItem[] => {
    if (!items || !Array.isArray(items)) {
      return [];
    }
    
    return items
      .filter(item => item) // Filter out null/undefined items
      .map(item => ({
        source: (item.addedBy === 'AI' ? 'ai' : 'manual') as 'ai' | 'manual',
        text: item[textField] || item.skillName || item.evidence || item.certificationName || 'No description available',
        score: item.score || undefined, // Include score if available
        skillName: item.skillName || undefined, // Include skill name if available
        evidence: item.evidence || undefined // Include evidence if available
      }));
  };

  const createRadarData = (personalityData: any): PersonalityTrait[] => {
    if (!personalityData) {
      // Return mock data as fallback
      return [
        {
          trait: 'Cognitive & Problem-Solving',
          value: 7.5,
          breakdown: [
            { sub: 'Analytical Thinking', score: 7.5 },
            { sub: 'Problem Solving', score: 8.0 },
            { sub: 'Critical Thinking', score: 7.0 },
          ],
        },
        {
          trait: 'Communication & Teamwork',
          value: 8.0,
          breakdown: [
            { sub: 'Communication', score: 8.2 },
            { sub: 'Teamwork', score: 7.8 },
            { sub: 'Leadership', score: 8.0 },
          ],
        },
      ];
    }

    // Transform backend personality data structure to radar chart format
    const radarData: PersonalityTrait[] = [];
    
    if (personalityData.cognitiveAndProblemSolving) {
      const category = personalityData.cognitiveAndProblemSolving;
      const breakdown = Object.keys(category).map(key => ({
        sub: category[key].traitName || key,
        score: category[key].score || 0
      }));
      const avgScore = breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;
      
      radarData.push({
        trait: 'Cognitive & Problem-Solving',
        value: avgScore,
        breakdown
      });
    }

    if (personalityData.communicationAndTeamwork) {
      const category = personalityData.communicationAndTeamwork;
      const breakdown = Object.keys(category).map(key => ({
        sub: category[key].traitName || key,
        score: category[key].score || 0
      }));
      const avgScore = breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;
      
      radarData.push({
        trait: 'Communication & Teamwork',
        value: avgScore,
        breakdown
      });
    }

    if (personalityData.workEthicAndReliability) {
      const category = personalityData.workEthicAndReliability;
      const breakdown = Object.keys(category).map(key => ({
        sub: category[key].traitName || key,
        score: category[key].score || 0
      }));
      const avgScore = breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;
      
      radarData.push({
        trait: 'Work Ethic & Reliability',
        value: avgScore,
        breakdown
      });
    }

    if (personalityData.growthAndLeadership) {
      const category = personalityData.growthAndLeadership;
      const breakdown = Object.keys(category).map(key => ({
        sub: category[key].traitName || key,
        score: category[key].score || 0
      }));
      const avgScore = breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;
      
      radarData.push({
        trait: 'Growth & Leadership',
        value: avgScore,
        breakdown
      });
    }

    if (personalityData.cultureAndPersonalityFit) {
      const category = personalityData.cultureAndPersonalityFit;
      const breakdown = Object.keys(category).map(key => ({
        sub: category[key].traitName || key,
        score: category[key].score || 0
      }));
      const avgScore = breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;
      
      radarData.push({
        trait: 'Culture & Personality Fit',
        value: avgScore,
        breakdown
      });
    }

    if (personalityData.bonusTraits) {
      const category = personalityData.bonusTraits;
      const breakdown = Object.keys(category).map(key => ({
        sub: category[key].traitName || key,
        score: category[key].score || 0
      }));
      const avgScore = breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;
      
      radarData.push({
        trait: 'Bonus Traits',
        value: avgScore,
        breakdown
      });
    }

    return radarData.length > 0 ? radarData : [
      {
        trait: 'No Data Available',
        value: 0,
        breakdown: [{ sub: 'No traits found', score: 0 }]
      }
    ];
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFileDownloadUrl = (fileId: string) => {
    return candidatesApi.getFileDownloadUrl(fileId);
  };

  const getTranscriptDownloadUrl = (fileId: string) => {
    return candidatesApi.getTranscriptDownloadUrl(fileId);
  };

  const handleDownload = (filename: string, type: 'resume' | 'transcript') => {
    console.log(`Downloading ${type}: ${filename}`);
    setToastMessage(`Downloading ${filename}...`);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleGoBack = () => {
    navigate(-1);
  };  

  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="tooltip-box">
          <strong>{data.trait}: {data.value.toFixed(1)}</strong>
          <ul>
            {data.breakdown.map((b: any, idx: number) => (
              <li key={idx}>
                {b.sub}: {b.score.toFixed(1)}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="profile">
        <div className="loading-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontSize: '18px',
          color: '#6b7280'
        }}>
          Loading candidate profile...
        </div>
      </main>
    );
  }

  // Error state
  if (error || !candidate) {
    return (
      <main className="profile">
        <div className="error-container" style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontSize: '18px',
          color: '#ef4444'
        }}>
          <p>{error || 'Candidate not found'}</p>
          <button 
            onClick={handleGoBack}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  // Prepare data for display
  const radarData = createRadarData(personality);
  const resumeParsed = {
    skills: transformToProfileItems(candidate.skills || [], 'skillName'),
    experience: transformToProfileItems(candidate.experience || [], 'description'),
    education: transformToProfileItems(candidate.education || [], 'description'),
    certification: transformToProfileItems(candidate.certification || [], 'description'),
    strength: transformToProfileItems(candidate.strengths || [], 'description'),
    weaknesses: transformToProfileItems(candidate.weaknesses || [], 'description'),
    assessment: candidate.resumeAssessment ? [{ source: 'ai' as const, text: candidate.resumeAssessment }] : []
  };

  return (
    <main className="profile">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}

      <div className='back-label'>
        <img 
          src="/images/back.png" 
          alt="Back" 
          onClick={handleGoBack}
          style={{ cursor: 'pointer' }}
        />
        <h2>{candidate.name}</h2>
      </div>

      <div className="info-box">
        <div className="box-header">
          <h3>Candidate Information</h3>
          <button className="edit-btn" onClick={handleEditToggle}>
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>
        <div className="box-content">
          <p><strong>Name:</strong> {candidate.name}</p>
          <p><strong>Email:</strong> {candidate.email.join(', ')}</p>
          <p><strong>Birthdate:</strong> {formatDate(candidate.birthdate)}</p>
          <p><strong>Date Created:</strong> {formatDate(candidate.dateCreated)}</p>
          <p><strong>Date Updated:</strong> {formatDate(candidate.dateUpdated)}</p>
          <p><strong>Role Applied:</strong> {candidate.roleApplied || 'Not specified'}</p>
          {candidate.resume ? (
            <p>
              <strong>Resume:</strong>{' '}
              <a 
                href={getFileDownloadUrl(candidate.resume.fileId)} 
                rel="noreferrer"
                download={candidate.resume.filename}
                className="download-link"
                onClick={() => handleDownload(candidate.resume!.filename, 'resume')}
              >
                📄 {candidate.resume.filename} ↓
              </a>
            </p>
          ) : (
            <p>
              <strong>Resume:</strong>{' '}
              <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No resume uploaded</span>
            </p>
          )}
          {candidate.transcripts && candidate.transcripts.length > 0 ? (
            <p>
              <strong>Transcripts:</strong>{' '}
              {candidate.transcripts.map((transcript, idx) => (
                <span key={idx}>
                  <a 
                    href={getTranscriptDownloadUrl(transcript.fileId)} 
                    rel="noreferrer"
                    download={transcript.filename}
                    className="download-link"
                    onClick={() => handleDownload(transcript.filename, 'transcript')}
                  >
                    📄 {transcript.filename} ↓
                  </a>
                  {idx < candidate.transcripts!.length - 1 && ', '}
                </span>
              ))}
            </p>
          ) : (
            <p>
              <strong>Transcripts:</strong>{' '}
              <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No transcripts uploaded</span>
            </p>
          )}
          <p><strong>Status:</strong> 
            <span style={{ 
              color: candidate.status === 'Approved' ? '#10b981' : 
                     candidate.status === 'Rejected' ? '#ef4444' : '#f59e0b',
              fontWeight: 'bold',
              marginLeft: '8px'
            }}>
              {candidate.status}
            </span>
          </p>
          <p><strong>Active:</strong> {candidate.isDeleted ? 'No' : 'Yes'}</p>
        </div>
      </div>

      {/* Two-column layout for parsed sections */}
      <div className="parsed-sections-container">
        {/* Resume Parsed Information */}
        <div className="parsed-section">
          <div className="box-header">
              <div className='legend'>
                <h3>Resume Parsed Information</h3>
                <img src="/images/redbox.png" alt="AI" />
                <p> - AI</p>
                <img src="/images/blackbox.png" alt="Manual" />
                <p> - Manual</p>
              </div>
            
            <button className="edit-btn" onClick={handleEditToggle}>
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
          <div className="box-content">
            <div className="section">
              <strong>Skills:</strong>
              {resumeParsed.skills.length > 0 ? (
                <div className="skills-grid">
                  {resumeParsed.skills.map((item: ProfileItem, idx: number) => (
                    <div key={idx} className={`skill-card ${item.source}`}>
                      <div className="skill-content">
                        <div className="skill-info">
                          <span className="skill-name">
                            {item.skillName || item.text}
                          </span>
                          {item.evidence && item.evidence !== item.skillName && (
                            <p className="skill-evidence">
                              {item.evidence}
                            </p>
                          )}
                          {item.score && (
                            <div className="skill-score">
                              <span className="score-label">Score:</span>
                              <span className="score-value">{item.score}/10</span>
                            </div>
                          )}
                        </div>
                        <span className={`skill-badge ${item.source}`}>
                          {item.source === 'ai' ? 'AI' : 'Manual'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No skills data available</p>
              )}
            </div>
            <div className="section">
              <strong>Experience:</strong>
              {resumeParsed.experience.length > 0 ? (
                <ul>
                  {resumeParsed.experience.map((item: ProfileItem, idx: number) => (
                    <li key={idx} className={item.source === 'ai' ? 'ai' : 'manual'}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No experience data available</p>
              )}
            </div>
            <div className="section">
              <strong>Education:</strong>
              {resumeParsed.education.length > 0 ? (
                <ul>
                  {resumeParsed.education.map((item: ProfileItem, idx: number) => (
                    <li key={idx} className={item.source === 'ai' ? 'ai' : 'manual'}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No education data available</p>
              )}
            </div>
            <div className="section">
              <strong>Certification:</strong>
              {resumeParsed.certification.length > 0 ? (
                <ul>
                  {resumeParsed.certification.map((item: ProfileItem, idx: number) => (
                    <li key={idx} className={item.source === 'ai' ? 'ai' : 'manual'}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No certification data available</p>
              )}
            </div>
            <div className="section">
              <strong>Strength:</strong>
              {resumeParsed.strength.length > 0 ? (
                <ul>
                  {resumeParsed.strength.map((item: ProfileItem, idx: number) => (
                    <li key={idx} className={item.source === 'ai' ? 'ai' : 'manual'}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No strengths data available</p>
              )}
            </div>
            <div className="section">
              <strong>Weaknesses:</strong>
              {resumeParsed.weaknesses.length > 0 ? (
                <ul>
                  {resumeParsed.weaknesses.map((item: ProfileItem, idx: number) => (
                    <li key={idx} className={item.source === 'ai' ? 'ai' : 'manual'}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No weaknesses data available</p>
              )}
            </div>
            <div className="section">
              <strong>Resume Assessment:</strong>
              {resumeParsed.assessment.length > 0 ? (
                <ul>
                  {resumeParsed.assessment.map((item: ProfileItem, idx: number) => (
                    <li key={idx} className={item.source === 'ai' ? 'ai' : 'manual'}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No resume assessment available</p>
              )}
            </div>
          </div>
        </div>

        {/* Interview Transcript Information */}
        <div className="parsed-section">
          <div className="box-header">
              <h3>Interview Transcript Information</h3>
              <button className="edit-btn" onClick={handleEditToggle}>
                {isEditing ? 'Save' : 'Edit'}
              </button>
          </div>
          <div className="box-content">
              <div className="section">
                  <strong>Interview Assessment:</strong>
                  <p>{candidate.interviewAssessment || 'No assessment available'}</p>
              </div>
              <div className="section">
                  <strong>Personality Analysis:</strong>
                  <p>{personality ? 'Personality data available' : 'No personality data available'}</p>
              </div>
              <div className="section radar-chart">
                  <strong>Personality Traits Radar:</strong>
                  <ResponsiveContainer width="100%" height={400}>
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="trait" />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} tickFormatter={(tick) => tick.toFixed(1)} />
                          <Radar name="Score" dataKey="value" stroke="#E30022" fill="#E30022" fillOpacity={0.6} />
                          <Tooltip content={<CustomRadarTooltip />} />
                      </RadarChart>
                  </ResponsiveContainer>
              </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
