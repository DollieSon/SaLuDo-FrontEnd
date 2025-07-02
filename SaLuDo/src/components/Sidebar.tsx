import { NavLink } from 'react-router-dom';
import './css/Sidebar.css';
import React from 'react'

const sidebar: React.FC = () =>  {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/images/logo 2.png" alt="Alliance Logo" />
      </div>

      <div className="section-title">Main Menu</div>
      <NavLink to="/" className="nav-link">
        <img src="/images/list.png" alt="Candidate List" />
        Candidate List
      </NavLink>
      <NavLink to="/candidate-form" className="nav-link">
        <img src="/images/add.png" alt="Add Candidate" />
        Add Candidate
      </NavLink>
      <NavLink to="/skills-management" className="nav-link">
        <img src="/images/analytics.png" alt="Analytics" />
        Skills Management
      </NavLink>
      <NavLink to="/job-list" className="nav-link">
        <img src="/images/job.png" alt="Job List" />
        Job List
      </NavLink>

      {/* <div className="section-title">Other</div>
      <NavLink to="/support" className="nav-link">
        <img src="/images/support.png" alt="Support" />
        Support
      </NavLink>
      <NavLink to="/settings" className="nav-link">
        <img src="/images/settings.png" alt="Settings" />
        Settings
      </NavLink> */}
    </div>
  );
}

export default sidebar