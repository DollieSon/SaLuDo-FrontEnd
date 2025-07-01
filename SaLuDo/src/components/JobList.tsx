import './css/CandidateList.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JobList: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');

  const jobs = [
    { id: 1, title: 'Front-End Developer', department: 'Engineering', openings: 2, postedDate: '31 Aug 2025', status: 'Open' },
    { id: 2, title: 'HR Officer', department: 'Human Resources', openings: 1, postedDate: '28 Aug 2025', status: 'Open' },
    { id: 3, title: 'Social Media Manager', department: 'Marketing', openings: 1, postedDate: '25 Aug 2025', status: 'Closed' },
    { id: 4, title: 'Technical Specialist', department: 'IT Support', openings: 3, postedDate: '22 Aug 2025', status: 'Open' },
    { id: 5, title: 'UI/UX Designer', department: 'Design', openings: 1, postedDate: '20 Aug 2025', status: 'Open' },
    { id: 6, title: 'Front-End Developer', department: 'Engineering', openings: 2, postedDate: '31 Aug 2025', status: 'Open' },
    { id: 7, title: 'HR Officer', department: 'Human Resources', openings: 1, postedDate: '28 Aug 2025', status: 'Open' },
    { id: 8, title: 'Social Media Manager', department: 'Marketing', openings: 1, postedDate: '25 Aug 2025', status: 'Closed' },
    { id: 9, title: 'Technical Specialist', department: 'IT Support', openings: 3, postedDate: '22 Aug 2025', status: 'Open' },
    { id: 10, title: 'UI/UX Designer', department: 'Design', openings: 1, postedDate: '20 Aug 2025', status: 'Open' },
  ];

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h4>Available Position</h4>
          <div className="number">24</div>
          <div className="detail">4 Urgently needed</div>
        </div>
        <div className="card">
          <h4>Job Open</h4>
          <div className="number">10</div>
          <div className="detail">4 Active hiring</div>
        </div>
        <div className="card">
          <h4>New Applicants</h4>
          <div className="number">24</div>
          <div className="detail">4 Department</div>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th><img src="/images/sort.png" alt="Sort" /></th>
              <th>Job Title</th>
              <th>Department</th>
              <th>Openings</th>
              <th>Posted Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((c, idx) => (
              <tr key={c.id}>
                <td>{idx + 1}</td>
                <td><a href="#">{c.title}</a></td>
                <td>{c.department}</td>
                <td>{c.openings}</td>
                <td>{c.postedDate}</td>
                <td>{c.status}</td>
                <td>
                  <button
                    className="open-profile"
                    onClick={() => navigate(`/profile/${c.id}`)}
                  >
                    Details
                  </button>
                  <button className="remove">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default JobList;
