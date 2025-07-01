import './css/CandidateList.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../utils/api';
import { Job } from '../types/job';

const JobList: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await jobsApi.getAllJobs();
      if (response.success) {
        setJobs(response.data);
      } else {
        throw new Error('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.jobName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle job click to navigate to details
  const handleJobClick = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

  return (
    <main className="candidate-list">
      <div className="candidate-list-header">
        <h2>Job List</h2>
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
        <button className="add-job">Add New Job</button>
      </div>
      <div className="summary-cards">
        <div className="card">
          <h4>Total Jobs</h4>
          <div className="number">{jobs.length}</div>
          <div className="detail">{filteredJobs.length} Shown</div>
        </div>
        <div className="card">
          <h4>Jobs with Skills</h4>
          <div className="number">{jobs.filter(job => job.skills.filter(skill => !skill.isDeleted).length > 0).length}</div>
          <div className="detail">Skills Required</div>
        </div>
        <div className="card">
          <h4>Total Skills</h4>
          <div className="number">{jobs.reduce((total, job) => total + job.skills.filter(skill => !skill.isDeleted).length, 0)}</div>
          <div className="detail">Across All Jobs</div>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th><img src="/images/sort.png" alt="Sort" /></th>
              <th>Job Name</th>
              <th>Amount of Skills</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                  Loading jobs...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
                  {error}
                </td>
              </tr>
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  No jobs found
                </td>
              </tr>
            ) : (
              filteredJobs.map((job, idx) => (
                <tr key={job._id} onClick={() => handleJobClick(job._id)} style={{ cursor: 'pointer' }}>
                  <td>{idx + 1}</td>
                  <td>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      {job.jobName}
                    </a>
                  </td>
                  <td>{job.skills.filter(skill => !skill.isDeleted).length}</td>
                  <td>{formatDate(job.createdAt)}</td>
                  <td>
                    <button
                      className="open-profile"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobClick(job._id);
                      }}
                    >
                      Details
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

export default JobList;
