import React from 'react';

interface Interview {
  _id: string;
  candidateId: string;
  jobId?: string;
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'behavioral';
  title: string;
  description?: string;
  scheduledDate: Date;
  duration: number;
  location?: string;
  meetingUrl?: string;
  interviewers: string[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  feedback?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface InterviewHistoryProps {
  candidateId: string;
  interviews: Interview[];
  onView?: (interview: Interview) => void;
  onEdit?: (interview: Interview) => void;
  onCancel?: (interview: Interview) => void;
  loading?: boolean;
  className?: string;
}

export const InterviewHistory: React.FC<InterviewHistoryProps> = ({
  candidateId,
  interviews,
  onView,
  onEdit,
  onCancel,
  loading = false,
  className = ''
}) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      phone: '📞',
      video: '📹',
      'in-person': '🏢',
      technical: '💻',
      behavioral: '🎭'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };

  const isUpcoming = (date: Date | string) => {
    return new Date(date) > new Date();
  };

  const isPast = (date: Date | string) => {
    return new Date(date) < new Date();
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  // Sort interviews by date (most recent first)
  const sortedInterviews = [...interviews].sort((a, b) => {
    return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
  });

  // Group interviews by status
  const upcomingInterviews = sortedInterviews.filter(i => 
    i.status === 'scheduled' && isUpcoming(i.scheduledDate)
  );
  const pastInterviews = sortedInterviews.filter(i => 
    i.status !== 'scheduled' || isPast(i.scheduledDate)
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Interview History ({interviews.length})
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{upcomingInterviews.length} Upcoming</span>
          <span>{pastInterviews.length} Past</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-24"></div>
            </div>
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No interviews scheduled</h3>
          <p className="mt-1 text-sm text-gray-500">
            Interviews that are scheduled will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Upcoming Interviews ({upcomingInterviews.length})
              </h4>
              <div className="space-y-3">
                {upcomingInterviews.map((interview) => (
                  <div
                    key={interview._id}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getTypeIcon(interview.type)}</span>
                          <h5 className="font-medium text-gray-900">{interview.title}</h5>
                          {getStatusBadge(interview.status)}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span>📅 {formatDate(interview.scheduledDate)}</span>
                            <span>🕐 {formatTime(interview.scheduledDate)}</span>
                            <span>⏱️ {formatDuration(interview.duration)}</span>
                          </div>
                          
                          {interview.interviewers.length > 0 && (
                            <div>
                              👥 {interview.interviewers.join(', ')}
                            </div>
                          )}
                          
                          {interview.location && (
                            <div>📍 {interview.location}</div>
                          )}
                          
                          {interview.meetingUrl && (
                            <div>
                              🔗 <a href={interview.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Join Meeting
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {onView && (
                          <button
                            onClick={() => onView(interview)}
                            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                            title="View details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(interview)}
                            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                            title="Edit interview"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {onCancel && interview.status === 'scheduled' && (
                          <button
                            onClick={() => onCancel(interview)}
                            className="p-2 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md"
                            title="Cancel interview"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Interviews */}
          {pastInterviews.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Past Interviews ({pastInterviews.length})
              </h4>
              <div className="space-y-3">
                {pastInterviews.map((interview) => (
                  <div
                    key={interview._id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getTypeIcon(interview.type)}</span>
                          <h5 className="font-medium text-gray-900">{interview.title}</h5>
                          {getStatusBadge(interview.status)}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span>📅 {formatDate(interview.scheduledDate)}</span>
                            <span>🕐 {formatTime(interview.scheduledDate)}</span>
                            <span>⏱️ {formatDuration(interview.duration)}</span>
                          </div>
                          
                          {interview.interviewers.length > 0 && (
                            <div>
                              👥 {interview.interviewers.join(', ')}
                            </div>
                          )}
                          
                          {interview.rating && (
                            <div className="flex items-center space-x-2">
                              <span>⭐</span>
                              {getRatingStars(interview.rating)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {onView && (
                          <button
                            onClick={() => onView(interview)}
                            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                            title="View details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
