import './css/CandidateList.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi, candidatesApi } from '../utils/api';
import { Job } from '../types/job';

const JobList: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs and candidates from API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch jobs and candidates in parallel
      const [jobsResponse, candidatesResponse] = await Promise.all([
        jobsApi.getAllJobs(),
        candidatesApi.getAllCandidates()
      ]);
      
      if (jobsResponse.success) {
        setJobs(jobsResponse.data);
      } else {
        throw new Error('Failed to fetch jobs');
      }
      
      if (candidatesResponse.success) {
        setCandidates(candidatesResponse.data);
      } else {
        console.warn('Failed to fetch candidates:', candidatesResponse);
        setCandidates([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.jobName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate applicant statistics
  const calculateApplicantStats = () => {
    const jobApplicantCounts = new Map<string, number>();
    
    // Count applicants per job (only those with roleApplied)
    const candidatesWithRoles = candidates.filter(candidate => candidate.roleApplied);
    
    candidatesWithRoles.forEach(candidate => {
      const currentCount = jobApplicantCounts.get(candidate.roleApplied) || 0;
      jobApplicantCounts.set(candidate.roleApplied, currentCount + 1);
    });
    
    // Find job with most applicants
    let maxApplicants = 0;
    let jobIdWithMostApplicants = '';
    
    jobApplicantCounts.forEach((count, jobId) => {
      if (count > maxApplicants) {
        maxApplicants = count;
        jobIdWithMostApplicants = jobId;
      }
    });
    
    // Find the job name for the job ID with most applicants
    const jobWithMostApplicants = jobs.find(job => job._id === jobIdWithMostApplicants);
    const jobNameWithMostApplicants = jobWithMostApplicants ? jobWithMostApplicants.jobName : jobIdWithMostApplicants;
    
    return {
      jobWithMostApplicants: jobNameWithMostApplicants,
      maxApplicants,
      totalApplicants: candidatesWithRoles.length
    };
  };
  
  const applicantStats = calculateApplicantStats();

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

  // Handle add new job button click
  const handleAddNewJob = () => {
    navigate('/jobform');
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
        <button className="add-job" onClick={handleAddNewJob}>Add New Job</button>
      </div>
      <div className="summary-cards">
        <div className="card">
          <h4>Total Jobs</h4>
          <div className="number">{jobs.length}</div>
          <div className="detail">{filteredJobs.length} Shown</div>
        </div>
        <div className="card">
          <h4>Job with Most Applicants</h4>
          <div className="number">{applicantStats.maxApplicants}</div>
          <div className="detail">{applicantStats.jobWithMostApplicants || 'No applicants yet'}</div>
        </div>
        <div className="card">
          <h4>Total Unique Skills</h4>
          <div className="number">{(() => {
            const uniqueSkills = new Set<string>();
            jobs.forEach(job => {
              job.skills.filter(skill => !skill.isDeleted).forEach(skill => {
                uniqueSkills.add(skill.skillId);
              });
            });
            return uniqueSkills.size;
          })()}</div>
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
