import React from 'react';

interface ActivityItem {
  id: string;
  type: 'status_change' | 'interview_scheduled' | 'interview_completed' | 'note_added' | 'skill_added' | 'education_added' | 'experience_added' | 'certification_added' | 'document_uploaded';
  title: string;
  description?: string;
  timestamp: Date;
  user: string;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  className?: string;
  maxItems?: number;
  showTimestamps?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
  className = '',
  maxItems = 20,
  showTimestamps = true
}) => {
  const getActivityIcon = (type: string) => {
    const icons = {
      status_change: '🔄',
      interview_scheduled: '📅',
      interview_completed: '✅',
      note_added: '📝',
      skill_added: '⚡',
      education_added: '🎓',
      experience_added: '💼',
      certification_added: '🏆',
      document_uploaded: '📎'
    };
    return icons[type as keyof typeof icons] || '📌';
  };

  const getActivityColor = (type: string) => {
    const colors = {
      status_change: 'bg-blue-100 text-blue-800',
      interview_scheduled: 'bg-purple-100 text-purple-800',
      interview_completed: 'bg-green-100 text-green-800',
      note_added: 'bg-gray-100 text-gray-800',
      skill_added: 'bg-yellow-100 text-yellow-800',
      education_added: 'bg-indigo-100 text-indigo-800',
      experience_added: 'bg-pink-100 text-pink-800',
      certification_added: 'bg-orange-100 text-orange-800',
      document_uploaded: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: timestamp.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const displayActivities = activities.slice(0, maxItems);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Recent Activity
        </h3>
        {activities.length > maxItems && (
          <p className="text-sm text-gray-500 mt-1">
            Showing {maxItems} of {activities.length} activities
          </p>
        )}
      </div>

      {/* Activity List */}
      <div className="p-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {displayActivities.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {/* Connection Line */}
                    {index !== displayActivities.length - 1 && (
                      <span
                        className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    
                    <div className="relative flex items-start space-x-3">
                      {/* Activity Icon */}
                      <div className="relative">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          getActivityColor(activity.type)
                        }`}>
                          <span className="text-sm">
                            {getActivityIcon(activity.type)}
                          </span>
                        </div>
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              {activity.title}
                            </span>
                          </div>
                          
                          {activity.description && (
                            <p className="mt-1 text-sm text-gray-600">
                              {activity.description}
                            </p>
                          )}
                          
                          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                            <span>by {activity.user}</span>
                            {showTimestamps && (
                              <>
                                <span>•</span>
                                <time dateTime={activity.timestamp.toISOString()}>
                                  {formatTimestamp(activity.timestamp)}
                                </time>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* View More Footer */}
      {activities.length > maxItems && (
        <div className="px-4 py-3 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all {activities.length} activities
          </button>
        </div>
      )}
    </div>
  );
};
