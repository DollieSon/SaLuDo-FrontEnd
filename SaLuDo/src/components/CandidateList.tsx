import './css/CandidateList.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CandidateList: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');

  const candidates = [
    { id: 1, dp: '/images/wony.jpg', name: 'Vicky Jang', score: 98, position: 'Front-End Developer', date: '31 Aug 2025', status: 'Approved' },
    { id: 2, dp: '/images/wony.jpg', name: 'Autumn Kim', score: 97, position: 'HR Officer', date: '31 Aug 2025', status: 'Approved' },
    { id: 3, dp: '/images/wony.jpg', name: 'Katarina Yu', score: 92, position: 'Social Media Manager', date: '31 Aug 2025', status: 'Pending' },
    { id: 4, dp: '/images/wony.jpg', name: 'Winter Kim', score: 86, position: 'Technical Specialist', date: '31 Aug 2025', status: 'Approved' },
    { id: 5, dp: '/images/wony.jpg', name: 'Vicky Jang', score: 98, position: 'Front-End Developer', date: '31 Aug 2025', status: 'Approved' },
    { id: 6, dp: '/images/wony.jpg', name: 'Autumn Kim', score: 97, position: 'HR Officer', date: '31 Aug 2025', status: 'Approved' },
    { id: 7, dp: '/images/wony.jpg', name: 'Katarina Yu', score: 92, position: 'Social Media Manager', date: '31 Aug 2025', status: 'Pending' },
    { id: 8, dp: '/images/wony.jpg', name: 'Winter Kim', score: 86, position: 'Technical Specialist', date: '31 Aug 2025', status: 'Approved' },
  ];

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <th>Name</th>
              <th>Score</th>
              <th>Job Role</th>
              <th>Date Added</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((c, idx) => (
              <tr key={c.id}>
                <td>{idx + 1}</td>
                <td><a href="#">{c.name}</a></td>
                <td>{c.score}</td>
                <td>{c.position}</td>
                <td>{c.date}</td>
                <td>{c.status}</td>
                <td>
                  <button
                    className="open-profile"
                    onClick={() => navigate(`/profile/${c.id}`)}
                  >
                    Open Profile
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

export default CandidateList;