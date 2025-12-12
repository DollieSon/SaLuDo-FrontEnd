import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import "./css/Dashboard.css";

interface DashboardStats {
    totalCandidates: number;
    totalJobs: number;
    totalEmployees: number;
    pendingApplications: number;
    approvedCandidates: number;
    rejectedCandidates: number;
    activeJobs: number;
    closedJobs: number;
    averageMatchScore: number;
    recentCandidates: RecentCandidate[];
    topJobs: TopJob[];
    recentActivity: Activity[];
}

interface RecentCandidate {
    id: string;
    name: string;
    role: string;
    score: number;
    date: string;
}

interface TopJob {
    id: string;
    name: string;
    applicants: number;
    avgScore: number;
}

interface Activity {
    id: string;
    type: 'application' | 'approval' | 'job' | 'rejection' | 'comment';
    message: string;
    time: string;
}

interface DashboardProps {
  accessToken: string;
}

const Dashboard: React.FC<DashboardProps> = ({ accessToken }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalCandidates: 0,
        totalJobs: 0,
        totalEmployees: 0,
        pendingApplications: 0,
        approvedCandidates: 0,
        rejectedCandidates: 0,
        activeJobs: 0,
        closedJobs: 0,
        averageMatchScore: 0,
        recentCandidates: [],
        topJobs: [],
        recentActivity: []
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await apiClient.get('/dashboard/stats');
            
            if (response.data.success) {
                setStats(response.data.data);
            } else {
                setError('Failed to load dashboard statistics');
            }
        } catch (err: any) {
            console.error('Error fetching dashboard stats:', err);
            setError(err.response?.data?.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
        });
    };

    if (loading) {
        return (
            <main className='candidate-list'>
                <div className="candidate-list-header">
                    <h2>Dashboard</h2>
                </div>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading dashboard...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className='candidate-list'>
                <div className="candidate-list-header">
                    <h2>Dashboard</h2>
                </div>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
                    <p>Error: {error}</p>
                    <button onClick={fetchDashboardStats} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
                        Retry
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className='candidate-list'>
            <div className="candidate-list-header" data-text="Overview of your recruitment system">
                <h2>Dashboard</h2>
            </div>

            <div className="stats-grid">
                <div className="stat-card" onClick={() => handleNavigation('/')}>
                <div className="stat-card-header">
                    <div className="stat-card-icon blue"></div>
                </div>
                <div className="stat-card-content">
                    <h4>Total Candidates</h4>
                    <div className="number">{stats.totalCandidates}</div>
                    <div className="detail">↑ 12% from last month</div>
                </div>
                </div>

                <div className="stat-card" onClick={() => handleNavigation('/job-list')}>
                <div className="stat-card-header">
                    <div className="stat-card-icon red"></div>
                </div>
                <div className="stat-card-content">
                    <h4>Active Jobs</h4>
                    <div className="number">{stats.activeJobs}</div>
                    <div className="detail">{stats.totalJobs} total positions</div>
                </div>
                </div>

                <div className="stat-card" onClick={() => handleNavigation('/user-management')}>
                <div className="stat-card-header">
                    <div className="stat-card-icon green"></div>
                </div>
                <div className="stat-card-content">
                    <h4>Team Members</h4>
                    <div className="number">{stats.totalEmployees}</div>
                    <div className="detail">Active users</div>
                </div>
                </div>

                <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon orange"></div>
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
                {stats.recentCandidates.slice(0, 5).map(candidate => (
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
                {stats.recentActivity.slice(0, 5).map(activity => (
                    <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                        {activity.type === 'application' && ''}
                        {activity.type === 'approval' && ''}
                        {activity.type === 'job' && ''}
                        {activity.type === 'rejection' && ''}
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
                {stats.topJobs.slice(0, 5).map(job => (
                    <div key={job.id} className="job-item" onClick={() => handleNavigation(`/job/${job.id}`)}>
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
                    <button className="action-button" onClick={() => handleNavigation('/candidate-form')}>
                    <div className="action-button-icon"></div>
                    <div className="action-button-text">Add Candidate</div>
                    </button>
                    <button className="action-button" onClick={() => handleNavigation('/jobform')}>
                    <div className="action-button-icon"></div>
                    <div className="action-button-text">Post New Job</div>
                    </button>
                    <button className="action-button" onClick={() => handleNavigation('/compare-candidates')}>
                    <div className="action-button-icon"></div>
                    <div className="action-button-text">Compare Candidates</div>
                    </button>
                    <button className="action-button" onClick={() => handleNavigation('/assign-candidates')}>
                    <div className="action-button-icon"></div>
                    <div className="action-button-text">Assign Candidates</div>
                    </button>
                </div>
                </div>
            </div>
        </main>
    )
}

export default Dashboard;