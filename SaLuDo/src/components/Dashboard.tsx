import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./css/Dashboard.css";

interface DashboardProps {
  accessToken: string;
}

const Dashboard: React.FC<DashboardProps> = ({ accessToken }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // Mock data - replace with actual API calls
    const [stats, setStats] = useState({
        totalCandidates: 156,
        totalJobs: 12,
        totalEmployees: 8,
        pendingApplications: 23,
        approvedCandidates: 89,
        rejectedCandidates: 44,
        activeJobs: 8,
        closedJobs: 4,
        averageMatchScore: 72.5,
        recentCandidates: [
        { id: '1', name: 'John Doe', role: 'Software Engineer', score: 8.5, date: '2025-11-20' },
        { id: '2', name: 'Jane Smith', role: 'Product Manager', score: 9.2, date: '2025-11-19' },
        { id: '3', name: 'Mike Johnson', role: 'UX Designer', score: 7.8, date: '2025-11-18' },
        { id: '4', name: 'Sarah Williams', role: 'Data Scientist', score: 8.9, date: '2025-11-17' },
        ],
        topJobs: [
        { id: '1', name: 'Senior Software Engineer', applicants: 45, avgScore: 7.8 },
        { id: '2', name: 'Product Manager', applicants: 32, avgScore: 8.2 },
        { id: '3', name: 'UX/UI Designer', applicants: 28, avgScore: 7.5 },
        ],
        recentActivity: [
        { id: '1', type: 'application', message: 'New application from John Doe', time: '2 hours ago' },
        { id: '2', type: 'approval', message: 'Jane Smith approved for Product Manager', time: '4 hours ago' },
        { id: '3', type: 'job', message: 'New job posted: Senior Developer', time: '1 day ago' },
        { id: '4', type: 'rejection', message: 'Mike Brown rejected for Designer role', time: '2 days ago' },
        ]
    });

    useEffect(() => {
        // Simulate loading data
        setTimeout(() => setLoading(false), 800);
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
        });
    };

    return (
        <main className='candidate-list'>
            <div className="candidate-list-header" data-text="Overview of your recruitment system">
                <h2>Dashboard</h2>
            </div>

            <div className="stats-grid">
                <div className="stat-card" onClick={() => handleNavigation('/')}>
                <div className="stat-card-header">
                    <div className="stat-card-icon blue">👥</div>
                </div>
                <div className="stat-card-content">
                    <h4>Total Candidates</h4>
                    <div className="number">{stats.totalCandidates}</div>
                    <div className="detail">↑ 12% from last month</div>
                </div>
                </div>

                <div className="stat-card" onClick={() => handleNavigation('/job-list')}>
                <div className="stat-card-header">
                    <div className="stat-card-icon red">💼</div>
                </div>
                <div className="stat-card-content">
                    <h4>Active Jobs</h4>
                    <div className="number">{stats.activeJobs}</div>
                    <div className="detail">{stats.totalJobs} total positions</div>
                </div>
                </div>

                <div className="stat-card" onClick={() => handleNavigation('/user-management')}>
                <div className="stat-card-header">
                    <div className="stat-card-icon green">👔</div>
                </div>
                <div className="stat-card-content">
                    <h4>Team Members</h4>
                    <div className="number">{stats.totalEmployees}</div>
                    <div className="detail">Active users</div>
                </div>
                </div>

                <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon orange">⏳</div>
                </div>
                <div className="stat-card-content">
                    <h4>Pending Reviews</h4>
                    <div className="number">{stats.pendingApplications}</div>
                    <div className="detail">Awaiting action</div>
                </div>
                </div>
            </div>

            <div className="content-grid">
                <div className="content-card">
                <h3>
                    Recent Candidates
                    <span className="view-all-link" onClick={() => handleNavigation('/')}>
                    View All →
                    </span>
                </h3>
                {stats.recentCandidates.map(candidate => (
                    <div key={candidate.id} className="candidate-item" onClick={() => handleNavigation(`/profile/${candidate.id}`)}>
                    <div className="candidate-info">
                        <h4>{candidate.name}</h4>
                        <p>{candidate.role}</p>
                    </div>
                    <div className="candidate-score">
                        <div className={`score-badge ${candidate.score >= 8 ? 'high' : candidate.score >= 6 ? 'medium' : 'low'}`}>
                        {candidate.score.toFixed(1)}
                        </div>
                        <div className="candidate-date">{formatDate(candidate.date)}</div>
                    </div>
                    </div>
                ))}
                </div>

                <div className="content-card">
                <h3>Recent Activity</h3>
                {stats.recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                        {activity.type === 'application' && '📝'}
                        {activity.type === 'approval' && '✓'}
                        {activity.type === 'job' && '💼'}
                        {activity.type === 'rejection' && '✗'}
                    </div>
                    <div className="activity-content">
                        <div className="activity-message">{activity.message}</div>
                        <div className="activity-time">{activity.time}</div>
                    </div>
                    </div>
                ))}
                </div>
            </div>

            <div className="content-grid">
                <div className="content-card">
                <h3>
                    Top Job Openings
                    <span className="view-all-link" onClick={() => handleNavigation('/job-list')}>
                    View All →
                    </span>
                </h3>
                {stats.topJobs.map(job => (
                    <div key={job.id} className="job-item">
                    <div className="job-header">
                        <span className="job-name">{job.name}</span>
                        <span className="applicant-count">{job.applicants} applicants</span>
                    </div>
                    <div className="job-stats">
                        <span>Avg Score: {job.avgScore}</span>
                    </div>
                    </div>
                ))}
                </div>

                <div className="content-card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                    <button className="action-button" onClick={() => handleNavigation('/add-candidate')}>
                    <div className="action-button-icon">➕</div>
                    <div className="action-button-text">Add Candidate</div>
                    </button>
                    <button className="action-button" onClick={() => handleNavigation('/jobform')}>
                    <div className="action-button-icon">📋</div>
                    <div className="action-button-text">Post New Job</div>
                    </button>
                    <button className="action-button" onClick={() => handleNavigation('/compare-candidates')}>
                    <div className="action-button-icon">⚖️</div>
                    <div className="action-button-text">Compare Candidates</div>
                    </button>
                    <button className="action-button" onClick={() => handleNavigation('/assign-candidates')}>
                    <div className="action-button-icon">📊</div>
                    <div className="action-button-text">Assign Candidates</div>
                    </button>
                </div>
                </div>
            </div>
        </main>
    )
}

export default Dashboard;