import { NavLink } from 'react-router-dom';
import './css/Sidebar.css';
import React from 'react';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/images/logo 2.png" alt="Alliance Logo" />
      </div>

      <div className="section-title">Main Menu</div>
      
      <NavLink 
        to="/" 
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <div className="nav-link-content">
          <img src="/images/list.png" alt="Candidate List" />
          Candidate List
        </div>
        {/* <span className="nav-link-badge">248</span> */}
      </NavLink>
      
      <NavLink 
        to="/candidate-form" 
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <div className="nav-link-content">
          <img src="/images/add.png" alt="Add Candidate" />
          Add Candidate
        </div>
      </NavLink>
      
      <NavLink 
        to="/skills-management" 
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <div className="nav-link-content">
          <img src="/images/analytics.png" alt="Analytics" />
          Skills Management
        </div>
      </NavLink>
      
      <NavLink 
        to="/job-list" 
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <div className="nav-link-content">
          <img src="/images/job.png" alt="Job List" />
          Job List
        </div>
        {/* <span className="nav-link-badge">12</span> */}
      </NavLink>

      {/* User Profile Section */}
      <div className="user-profile">
        <div className="user-profile-card">
          <div className="user-avatar">JD</div>
          <div className="user-info">
            <h4>John Doe</h4>
            <p>HR Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;