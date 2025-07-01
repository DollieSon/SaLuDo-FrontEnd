import './css/Profile.css';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, TooltipProps, Tooltip} from 'recharts';

const Profile: React.FC = () => {
  const { id } = useParams();

  const candidate = {
    name: 'Vicky Jang',
    emails: ['vicky@example.com', 'vicky.jang@gmail.com'],
    birthdate: '1997-02-14',
    dateCreated: '2025-06-20',
    dateUpdated: '2025-06-30',
    roleApplied: 'Front-End Developer',
    resume: '/files/vicky_resume.pdf',
    transcripts: '/files/vicky_transcript.txt',
    status: 'Approved',
    isDeleted: false,
    resumeParsed: {
      skills: [
        { source: 'ai', text: 'React' },
        { source: 'ai', text: 'TypeScript' },
        { source: 'manual', text: 'Tailwind CSS' },
      ],
      experience: [
        { source: 'manual', text: '3 years at ABC Corp' },
        { source: 'manual', text: '2 years at XYZ Ltd' },
      ],
      education: [
        { source: 'ai', text: 'B.Sc. in Computer Science, ABC University' },
      ],
      certification: [
        { source: 'manual', text: 'Certified Scrum Master' },
      ],
      strength: [
        { source: 'ai', text: 'Problem-solving' },
        { source: 'ai', text: 'Team collaboration' },
      ],
      weaknesses: [
        { source: 'manual', text: 'Needs to improve time management' },
      ],
      assessment: [
        { source: 'ai', text: 'Resume matches job requirements with 92% relevance.' },
      ],
    },
  };

  const radarData = [
    {
      trait: 'Cognitive & Problem-Solving Traits',
      value: 8.5,
      breakdown: [
        { sub: 'Analytical Thinking', score: 8.5 },
        { sub: 'Curiosity', score: 9.0 },
        { sub: 'Creativity', score: 8.0 },
        { sub: 'Attention to Detail', score: 8.7 },
        { sub: 'Critical Thinking', score: 8.3 },
        { sub: 'Resourcefulness', score: 8.0 },
      ],
    },
    {
      trait: 'Communication & Teamwork Traits',
      value: 9.0,
      breakdown: [
        { sub: 'Clear Communication', score: 9.2 },
        { sub: 'Active Listening', score: 8.8 },
        { sub: 'Collaboration', score: 9.0 },
        { sub: 'Empathy', score: 9.1 },
        { sub: 'Conflict Resolution', score: 8.7 },
      ],
    },
    {
      trait: 'Work Ethic & Reliability Traits',
      value: 8.3,
      breakdown: [
        { sub: 'Dependability', score: 8.5 },
        { sub: 'Accountability', score: 8.0 },
        { sub: 'Persistence', score: 8.2 },
        { sub: 'Time Management', score: 8.1 },
        { sub: 'Organization', score: 8.6 },
      ],
    },
    {
      trait: 'Growth & Leadership Traits',
      value: 8.8,
      breakdown: [
        { sub: 'Initiative', score: 8.7 },
        { sub: 'Self-Motivation', score: 9.0 },
        { sub: 'Leadership', score: 8.5 },
        { sub: 'Adaptability', score: 8.9 },
        { sub: 'Coachability', score: 9.0 },
      ],
    },
    {
      trait: 'Culture & Personality Fit Traits',
      value: 9.1,
      breakdown: [
        { sub: 'Positive Attitude', score: 9.2 },
        { sub: 'Humility', score: 8.8 },
        { sub: 'Confidence', score: 9.0 },
        { sub: 'Integrity', score: 9.3 },
        { sub: 'Professionalism', score: 9.1 },
        { sub: 'Open-Mindedness', score: 8.9 },
        { sub: 'Enthusiasm', score: 9.4 },
      ],
    },
    {
      trait: 'Bonus Traits',
      value: 8.6,
      breakdown: [
        { sub: 'Customer Focus', score: 8.7 },
        { sub: 'Visionary Thinking', score: 8.8 },
        { sub: 'Cultural Awareness', score: 8.5 },
        { sub: 'Sense of Humor', score: 8.6 },
        { sub: 'Grit', score: 8.4 },
      ],
    },
  ];
  
  const interview = {
    assessment: 'Candidate demonstrates strong communication skills and problem-solving abilities.',
    personalityScore: 8.8,
    radarData: radarData,
  };  

  const CustomRadarTooltip = ({ active, payload, label }: TooltipProps) => {
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

  return (
    <main className="profile">
      <div className='back-label'>
        <img src="/images/back.png" alt="Back" />
        <h2>{candidate.name}</h2>
      </div>

      <div className="info-box">
        <div className="box-header">
          <h3>Candidate Information</h3>
          <button className="edit-btn">Edit</button>
        </div>
        <div className="box-content">
          <p><strong>Name:</strong> {candidate.name}</p>
          <p><strong>Email:</strong> {candidate.emails.join(', ')}</p>
          <p><strong>Birthdate:</strong> {candidate.birthdate}</p>
          <p><strong>Date Created:</strong> {candidate.dateCreated}</p>
          <p><strong>Date Updated:</strong> {candidate.dateUpdated}</p>
          <p><strong>Role Applied:</strong> {candidate.roleApplied}</p>
          <p>
            <strong>Resume:</strong>{' '}
            <a href={candidate.resume} target="_blank" rel="noreferrer">
              View Resume
            </a>
          </p>
          <p>
            <strong>Transcripts:</strong>{' '}
            <a href={candidate.transcripts} target="_blank" rel="noreferrer">
              View Transcript
            </a>
          </p>
          <p><strong>Status:</strong> {candidate.status}</p>
          <p><strong>Is Deleted:</strong> {candidate.isDeleted ? 'Yes' : 'No'}</p>
        </div>
      </div>

      <div className="info-box">
        <div className="box-header">
            <div className='legend'>
              <h3>Resume Parsed Information</h3>
              <img src="/images/redbox.png" alt="AI" />
              <p> - AI</p>
              <img src="/images/blackbox.png" alt="Manual" />
              <p> - Manual</p>
            </div>
          
          <button className="edit-btn">Edit</button>
        </div>
        <div className="box-content">
          <div className="section">
            <strong>Skills:</strong>
            <ul>
              {candidate.resumeParsed.skills.map((item, idx) => (
                <li key={idx} className={item.source === 'ai' ? 'ai' : 'manual'}>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="section">
            <strong>Experience:</strong>
            <ul>
              {candidate.resumeParsed.experience.map((item, idx) => (
                <li key={idx} className={item.source === 'ai' ? 'ai' : 'manual'}>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="section">
            <strong>Education:</strong>
            <ul>
              {candidate.resumeParsed.education.map((item, idx) => (
                <li key={idx} className={item.source === 'ai' ? 'ai' : 'manual'}>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="section">
            <strong>Certification:</strong>
            <ul>
              {candidate.resumeParsed.certification.map((item, idx) => (
                <li key={idx} className={item.source === 'ai' ? 'ai' : 'manual'}>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="section">
            <strong>Strength:</strong>
            <ul>
              {candidate.resumeParsed.strength.map((item, idx) => (
                <li key={idx} className={item.source === 'ai' ? 'ai' : 'manual'}>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="section">
            <strong>Weaknesses:</strong>
            <ul>
              {candidate.resumeParsed.weaknesses.map((item, idx) => (
                <li key={idx} className={item.source === 'ai' ? 'ai' : 'manual'}>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="section">
            <strong>Resume Assessment:</strong>
            <ul>
              {candidate.resumeParsed.assessment.map((item, idx) => (
                <li key={idx} className={item.source === 'ai' ? 'ai' : 'manual'}>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="info-box">
        <div className="box-header">
            <h3>Interview Transcript Information</h3>
            <button className="edit-btn">Edit</button>
        </div>
        <div className="box-content">
            <div className="section">
                <strong>Interview Assessment:</strong>
                <p>{interview.assessment}</p>
            </div>
            <div className="section">
                <strong>Personality Score:</strong>
                <p>{interview.personalityScore} / 10</p>
            </div>
            <div className="section radar-chart">
                <strong>Personality Traits Radar:</strong>
                <ResponsiveContainer width="100%" height={400}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={interview.radarData}>
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
    </main>
  );
};

export default Profile;
