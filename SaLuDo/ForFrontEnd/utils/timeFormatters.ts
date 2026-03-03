/**
 * Time formatting utilities for time-in-stage analytics
 */

/**
 * Format milliseconds into human-readable duration
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "2d 5h", "3h 45m", "45m")
 */
export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return '0m';

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  
  return `${minutes}m`;
}

/**
 * Format time in stage with more detail for display in cards
 * @param ms - Duration in milliseconds
 * @returns Detailed formatted string
 */
export function formatTimeInStage(ms: number): string {
  if (!ms || ms < 0) return 'Just now';

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return minutes > 0 ? `${minutes} min${minutes > 1 ? 's' : ''}` : 'Just now';
}

/**
 * Get color class for time duration based on thresholds
 * @param ms - Duration in milliseconds
 * @param normalThreshold - Normal time threshold in days (default 3)
 * @param warningThreshold - Warning time threshold in days (default 7)
 * @returns Color classification: 'success' | 'warning' | 'danger'
 */
export function getTimeColor(
  ms: number,
  normalThreshold: number = 3,
  warningThreshold: number = 7
): 'success' | 'warning' | 'danger' {
  const days = ms / (1000 * 60 * 60 * 24);
  
  if (days <= normalThreshold) return 'success';
  if (days <= warningThreshold) return 'warning';
  return 'danger';
}

/**
 * Get color hex code for time duration
 * @param ms - Duration in milliseconds
 * @param normalThreshold - Normal time threshold in days
 * @param warningThreshold - Warning time threshold in days
 * @returns Hex color code
 */
export function getTimeColorHex(
  ms: number,
  normalThreshold: number = 3,
  warningThreshold: number = 7
): string {
  const colorClass = getTimeColor(ms, normalThreshold, warningThreshold);
  
  const colorMap: Record<string, string> = {
    success: '#10b981', // green-500
    warning: '#f59e0b', // amber-500
    danger: '#ef4444'   // red-500
  };
  
  return colorMap[colorClass];
}

/**
 * Format date for display in timeline
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatTimelineDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Today at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  if (diffDays === 1) {
    return `Yesterday at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
}

/**
 * Calculate average from array of time durations
 * @param durations - Array of durations in milliseconds
 * @returns Average duration in milliseconds
 */
export function calculateAverageDuration(durations: number[]): number {
  if (!durations || durations.length === 0) return 0;
  
  const sum = durations.reduce((acc, val) => acc + val, 0);
  return sum / durations.length;
}

/**
 * Get relative time description for stages
 * @param ms - Duration in milliseconds
 * @returns Relative description (e.g., "Fast", "Normal", "Slow")
 */
export function getRelativeSpeed(ms: number): string {
  const days = ms / (1000 * 60 * 60 * 24);
  
  if (days < 2) return 'Fast';
  if (days < 5) return 'Normal';
  if (days < 10) return 'Slow';
  return 'Very Slow';
}
