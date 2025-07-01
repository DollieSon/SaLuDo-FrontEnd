import './css/CandidateList.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidatesApi } from '../utils/api';
import { CandidateProfile } from '../types/profile';

const CandidateList: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch candidates from API
  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await candidatesApi.getAllCandidates();
      if (response.success) {
        setCandidates(response.data);
      } else {
        throw new Error('Failed to fetch candidates');
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.roleApplied && c.roleApplied.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary statistics
  const totalCandidates = candidates.length;
  
  // Most common job role
  const roleCount = candidates.reduce((acc, candidate) => {
    const role = candidate.roleApplied || 'No Role Applied';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonRole = Object.entries(roleCount).reduce((a, b) => 
    roleCount[a[0]] > roleCount[b[0]] ? a : b, ['No Role Applied', 0]
  )[0];

  // Newest candidate
  const newestCandidate = candidates.reduce((newest, candidate) => {
    return new Date(candidate.dateCreated) > new Date(newest.dateCreated) ? candidate : newest;
  }, candidates[0]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle candidate click to navigate to profile
  const handleCandidateClick = (candidateId: string) => {
    navigate(`/profile/${candidateId}`);
  };

  return (
    <main className="candidate-list">
      <div className="candidate-list-header">
        <h2>Candidate List</h2>
        <div className="search-candidate">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <img src="/images/search.png" alt="Search" />
        </div>
        <img src="/images/filter.png" alt="Filter" />
      </div>

      <div className="summary-cards">
        <div className="card">
          <h4>Total Candidates</h4>
          <div className="number">{totalCandidates}</div>
          <div className="detail">{filteredCandidates.length} Shown</div>
        </div>
        <div className="card">
          <h4>Most Common Role</h4>
          <div className="number">{mostCommonRole.length > 15 ? `${mostCommonRole.substring(0, 15)}...` : mostCommonRole}</div>
          <div className="detail">{roleCount[mostCommonRole] || 0} Candidates</div>
        </div>
        <div className="card">
          <h4>Newest Candidate</h4>
          <div className="number">{newestCandidate ? newestCandidate.name : 'None'}</div>
          <div className="detail">{newestCandidate ? formatDate(newestCandidate.dateCreated) : 'No Data'}</div>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th><img src="/images/sort.png" alt="Sort" /></th>
              <th>Name</th>
              <th>Skills (Amount)</th>
              <th>Status</th>
              <th>Date Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  Loading candidates...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
                  {error}
                </td>
              </tr>
            ) : filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  No candidates found
                </td>
              </tr>
            ) : (
              filteredCandidates.map((c, idx) => (
                <tr key={c.candidateId} onClick={() => handleCandidateClick(c.candidateId)} style={{ cursor: 'pointer' }}>
                  <td>{idx + 1}</td>
                  <td>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      {c.name}
                    </a>
                  </td>
                  <td>{c.skills ? c.skills.length : 0}</td>
                  <td>
                    <span style={{ 
                      color: c.status === 'Approved' ? '#10b981' : 
                             c.status === 'Rejected' ? '#ef4444' : '#f59e0b',
                      fontWeight: 'bold'
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td>{formatDate(c.dateCreated)}</td>
                  <td>
                    <button
                      className="open-profile"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCandidateClick(c.candidateId);
                      }}
                    >
                      Open Profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default CandidateList;