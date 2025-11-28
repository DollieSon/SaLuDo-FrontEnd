import React from "react";
import { ProfileActivity } from "../types/user";
import "./css/ProfileActivityTimeline.css";

interface ProfileActivityTimelineProps {
  activities: ProfileActivity[];
}

const ProfileActivityTimeline: React.FC<ProfileActivityTimelineProps> = ({
  activities,
}) => {
  const formatTimestamp = (timestamp: Date | string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getActivityIcon = (action: string): string => {
    switch (action.toLowerCase()) {
      case "profile_updated":
      case "updated":
        return "✏️";
      case "photo_uploaded":
        return "📸";
      case "photo_deleted":
        return "🗑️";
      case "created":
      case "registered":
        return "🎉";
      case "login":
        return "🔓";
      case "logout":
        return "🔒";
      default:
        return "📝";
    }
  };

  const formatFieldName = (field: string): string => {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  if (activities.length === 0) {
    return (
      <div className="profile-activity-timeline">
        <div className="no-activity-message">
          <p>No recent activity to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-activity-timeline">
      <div className="timeline-header">
        <h3>Recent Activity</h3>
      </div>
      
      <div className="timeline">
        {activities.map((activity, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-marker">
              <span className="timeline-icon">
                {getActivityIcon(activity.activityType)}
              </span>
            </div>
            
            <div className="timeline-content">
              <div className="activity-header">
                <span className="activity-action">
                  {activity.activityType.replace(/_/g, " ")}
                </span>
                <span className="activity-timestamp">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
              
              {activity.fieldChanged && (
                <div className="activity-details">
                  <span className="changes-summary">
                    Updated: {formatFieldName(activity.fieldChanged)}
                    {activity.oldValue && ` (${activity.oldValue} → ${activity.newValue})`}
                  </span>
                </div>
              )}
              
              {activity.ipAddress && (
                <div className="activity-meta">
                  <span className="ip-address">IP: {activity.ipAddress}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileActivityTimeline;
