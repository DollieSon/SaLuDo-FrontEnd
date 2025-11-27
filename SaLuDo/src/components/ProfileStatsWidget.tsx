import React from "react";
import { ProfileStats } from "../types/user";
import "./css/ProfileStatsWidget.css";

interface ProfileStatsWidgetProps {
  stats: ProfileStats;
}

const ProfileStatsWidget: React.FC<ProfileStatsWidgetProps> = ({ stats }) => {
  const formatDuration = (days: number): string => {
    if (days < 30) {
      return `${days} day${days === 1 ? "" : "s"}`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months === 1 ? "" : "s"}`;
    } else {
      const years = Math.floor(days / 365);
      const remainingMonths = Math.floor((days % 365) / 30);
      if (remainingMonths === 0) {
        return `${years} year${years === 1 ? "" : "s"}`;
      }
      return `${years}y ${remainingMonths}m`;
    }
  };

  const calculateSuccessRate = (): number => {
    const total = stats.candidatesHired + stats.candidatesRejected;
    if (total === 0) return 0;
    return Math.round((stats.candidatesHired / total) * 100);
  };

  const stats_data = [
    {
      label: "Total Candidates",
      value: stats.totalCandidatesAssigned,
      icon: "👥",
      color: "#3b82f6",
    },
    {
      label: "Active",
      value: stats.activeCandidatesCount,
      icon: "🟢",
      color: "#10b981",
    },
    {
      label: "Hired",
      value: stats.candidatesHired,
      icon: "✅",
      color: "#22c55e",
    },
    {
      label: "Rejected",
      value: stats.candidatesRejected,
      icon: "❌",
      color: "#ef4444",
    },
  ];

  const successRate = calculateSuccessRate();

  return (
    <div className="profile-stats-widget">
      <div className="stats-header">
        <h3>Performance Overview</h3>
        <div className="account-age">
          Account active for {formatDuration(stats.accountAge)}
        </div>
      </div>

      <div className="stats-grid">
        {stats_data.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{ borderLeftColor: stat.color }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {(stats.candidatesHired > 0 || stats.candidatesRejected > 0) && (
        <div className="success-rate-section">
          <h4>Success Rate</h4>
          <div className="success-rate-bar">
            <div
              className="success-rate-fill"
              style={{ width: `${successRate}%` }}
            >
              <span className="success-rate-text">{successRate}%</span>
            </div>
          </div>
          <div className="success-rate-details">
            <span>
              {stats.candidatesHired} hired out of{" "}
              {stats.candidatesHired + stats.candidatesRejected} completed
            </span>
          </div>
        </div>
      )}

      {stats.totalCandidatesAssigned === 0 && (
        <div className="no-stats-message">
          <p>No candidate activity yet. Start managing candidates to see your statistics.</p>
        </div>
      )}
    </div>
  );
};

export default ProfileStatsWidget;
