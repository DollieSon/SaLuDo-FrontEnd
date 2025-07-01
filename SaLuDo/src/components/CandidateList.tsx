import './css/CandidateList.css';
import React from 'react'

const candidateList: React.FC = () =>  {
  const candidates = [
    { id: 1, dp: '/images/wony.jpg', name: 'Vicky Jang', score: 98, position: 'Front-End Developer', date: '31 Aug 2025', status: 'Approved' },
    { id: 2, dp: '/images/wony.jpg', name: 'Autumn Kim', score: 97, position: 'HR Officer', date: '31 Aug 2025', status: 'Approved' },
    { id: 3, dp: '/images/wony.jpg', name: 'Katarina Yu', score: 92, position: 'Social Media Manager', date: '31 Aug 2025', status: 'Pending' },
    { id: 4, dp: '/images/wony.jpg', name: 'Winter Kim', score: 86, position: 'Technical Specialist', date: '31 Aug 2025', status: 'Approved' },
  ];

  return (
    <main className="candidate-list">
      <div className="candidate-list-header">
        <h2>Candidate List</h2>
        <div className="search-candidate">
            <input type="text" placeholder="Search" />
            <img src="/images/search.png" alt="Search" />
        </div>
        <img src="/images/filter.png" alt="Filter" />
      </div>

      <div className="summary-cards">
        <div className="card">Available Positions: 24</div>
        <div className="card">Job Open: 10</div>
        <div className="card">New Applicants: 24</div>
        <div className="card">Applicant Rate: 16</div>
      </div>

      <table>
        <thead>
          <tr>
            <th><img src="/images/sort.png" alt="Sort" /></th>
            <th>Name</th>
            <th>Score</th>
            <th>Job</th>
            <th>Date Added</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c, idx) => (
            <tr key={c.id}>
              <td>{idx + 1}</td>
              <td><a href='/'>{c.name}</a></td>
              <td>{c.score}</td>
              <td>{c.position}</td>
              <td>{c.date}</td>
              <td>{c.status}</td>
              <td><button className="open-profile">Open Profile</button><button className="remove">Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default candidateList