import React, { useState, useEffect } from 'react';
import { 
  NotificationPreferences, 
  NotificationCategory, 
  NotificationChannel,
  NotificationPriority,
  DigestFrequency,
  EventOverride,
  NotificationType
} from '../types/notification';
import { notificationsApi } from '../utils/api';
import './css/ProfileSettings.css';

interface ProfileSettingsProps {
  userId: string;
  accessToken: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userId, accessToken }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getPreferences(accessToken);
      setPreferences(response.preferences);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      setToast({ message: 'Failed to load preferences', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      
      // Only send updatable fields, not userId, createdAt, updatedAt
      const updateData = {
        enabled: preferences.enabled,
        defaultChannels: preferences.defaultChannels,
        categories: preferences.categories,
        emailDigest: preferences.emailDigest,
        quietHours: preferences.quietHours,
        batchNotifications: preferences.batchNotifications,
        soundEnabled: preferences.soundEnabled,
        desktopNotifications: preferences.desktopNotifications
      };
      
      console.log('Saving preferences:', updateData);
      
      const response = await notificationsApi.updatePreferences(accessToken, updateData);
      
      console.log('Save response:', response);
      
      // Update local state with response
      if (response.preferences) {
        setPreferences(response.preferences);
      }
      
      setToast({ message: 'Settings saved successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      
      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const updateGlobalEnabled = (enabled: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, enabled });
  };

  const updateDefaultChannel = (channel: keyof NotificationPreferences['defaultChannels'], value: boolean) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      defaultChannels: {
        ...preferences.defaultChannels,
        [channel]: value
      }
    });
  };

  const updateCategoryEnabled = (category: NotificationCategory, enabled: boolean) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: {
          ...preferences.categories[category],
          enabled
        }
      }
    });
  };

  const updateCategoryChannels = (category: NotificationCategory, channel: NotificationChannel, add: boolean) => {
    if (!preferences) return;
    const currentChannels = preferences.categories[category].channels;
    const newChannels = add
      ? [...currentChannels, channel]
      : currentChannels.filter(c => c !== channel);

    setPreferences({
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: {
          ...preferences.categories[category],
          channels: newChannels
        }
      }
    });
  };

  const updateCategoryMinPriority = (category: NotificationCategory, minPriority: NotificationPriority) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: {
          ...preferences.categories[category],
          minPriority
        }
      }
    });
  };

  const updateEmailDigest = (field: keyof NotificationPreferences['emailDigest'], value: any) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      emailDigest: {
        ...preferences.emailDigest,
        [field]: value
      }
    });
  };

  const toggleDigestIncludeCategory = (category: NotificationCategory) => {
    if (!preferences) return;
    const current = preferences.emailDigest.includeCategories || [];
    const exists = current.includes(category);
    const next = exists ? current.filter(c => c !== category) : [...current, category];
    updateEmailDigest('includeCategories', next);
  };

  const updateDigestMinPriority = (priority: NotificationPriority) => {
    updateEmailDigest('minPriority', priority);
  };

  const updateDigestDayOfWeek = (day: number) => {
    updateEmailDigest('dayOfWeek', day);
  };

  const getPriorityLabel = (priority: NotificationPriority): string => {
    const labels: Record<NotificationPriority, string> = {
      [NotificationPriority.LOW]: 'Low',
      [NotificationPriority.MEDIUM]: 'Medium',
      [NotificationPriority.HIGH]: 'High',
      [NotificationPriority.CRITICAL]: 'Critical'
    };
    return labels[priority];
  };

  // Event Overrides helpers
  const upsertEventOverride = (override: EventOverride) => {
    if (!preferences) return;
    const existing = preferences.eventOverrides || [];
    const idx = existing.findIndex(o => o.type === override.type);
    const next = idx >= 0 ? [...existing.slice(0, idx), override, ...existing.slice(idx + 1)] : [...existing, override];
    setPreferences({ ...preferences, eventOverrides: next });
  };

  const removeEventOverride = (type: NotificationType) => {
    if (!preferences) return;
    const existing = preferences.eventOverrides || [];
    const next = existing.filter(o => o.type !== type);
    setPreferences({ ...preferences, eventOverrides: next });
  };

  const getEventOverride = (type: NotificationType): EventOverride | undefined => {
    return preferences?.eventOverrides?.find(o => o.type === type);
  };

  const updateQuietHours = (field: keyof NotificationPreferences['quietHours'], value: any) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      quietHours: {
        ...preferences.quietHours,
        [field]: value
      }
    });
  };

  const toggleQuietHoursDay = (day: number) => {
    if (!preferences) return;
    const currentDays = preferences.quietHours.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];

    updateQuietHours('daysOfWeek', newDays);
  };

  const getCategoryLabel = (category: NotificationCategory): string => {
    const labels: Record<NotificationCategory, string> = {
      [NotificationCategory.HR_ACTIVITIES]: 'HR Activities',
      [NotificationCategory.SECURITY_ALERTS]: 'Security Alerts',
      [NotificationCategory.SYSTEM_UPDATES]: 'System Updates',
      [NotificationCategory.COMMENTS]: 'Comments',
      [NotificationCategory.INTERVIEWS]: 'Interviews',
      [NotificationCategory.ADMIN]: 'Admin Notifications'
    };
    return labels[category];
  };

  const getChannelLabel = (channel: NotificationChannel): string => {
    const labels: Record<NotificationChannel, string> = {
      [NotificationChannel.IN_APP]: 'In-App',
      [NotificationChannel.EMAIL]: 'Email',
      [NotificationChannel.PUSH]: 'Push',
      [NotificationChannel.SMS]: 'SMS'
    };
    return labels[channel];
  };

  const getDayLabel = (day: number): string => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
  };

  if (loading || !preferences) {
    return null;
  }

  return (
    <div className="profile-settings">
      {toast && (
        <div className={`settings-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Global Settings */}
      <div className="settings-section">
        <h3>Notification Settings</h3>
        <div className="setting-item">
          <div className="setting-header">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={preferences.enabled}
                onChange={(e) => updateGlobalEnabled(e.target.checked)}
              />
              <span>Enable all notifications</span>
            </label>
            <p className="setting-description">
              Master switch to enable or disable all notifications
            </p>
          </div>
        </div>
      </div>

      {/* Default Channels */}
      <div className="settings-section">
        <h3>Default Delivery Channels</h3>
        <div className="setting-item">
          <div className="channels-grid">
            {Object.entries(preferences.defaultChannels).map(([channel, enabled]) => (
              <label key={channel} className="channel-checkbox">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => updateDefaultChannel(channel as keyof typeof preferences.defaultChannels, e.target.checked)}
                  disabled={!preferences.enabled}
                />
                <span>{getChannelLabel(channel.toUpperCase().replace('APP', 'APP') as NotificationChannel)}</span>
              </label>
            ))}
          </div>
          <p className="setting-description">
            Choose which channels to use for notifications by default
          </p>
        </div>
      </div>

      {/* Category Settings */}
      <div className="settings-section">
        <h3>Notification Categories</h3>
        <div className="categories-list">
          {Object.entries(preferences.categories).map(([category, prefs]) => (
            <div key={category} className="category-item">
              <div className="category-header">
                <label className="category-toggle">
                  <input
                    type="checkbox"
                    checked={prefs.enabled}
                    onChange={(e) => updateCategoryEnabled(category as NotificationCategory, e.target.checked)}
                    disabled={!preferences.enabled}
                  />
                  <span className="category-name">{getCategoryLabel(category as NotificationCategory)}</span>
                </label>
              </div>
              {prefs.enabled && (
                <div className="category-channels">
                  {[NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.SMS].map(channel => (
                    <label key={channel} className="channel-option">
                      <input
                        type="checkbox"
                        checked={prefs.channels.includes(channel)}
                        onChange={(e) => updateCategoryChannels(category as NotificationCategory, channel, e.target.checked)}
                        disabled={!preferences.enabled}
                      />
                      <span>{getChannelLabel(channel)}</span>
                    </label>
                  ))}
                  <div className="setting-row">
                    <label>Minimum Priority</label>
                    <select
                      value={prefs.minPriority || NotificationPriority.LOW}
                      onChange={(e) => updateCategoryMinPriority(category as NotificationCategory, e.target.value as NotificationPriority)}
                      disabled={!preferences.enabled}
                    >
                      {[NotificationPriority.LOW, NotificationPriority.MEDIUM, NotificationPriority.HIGH, NotificationPriority.CRITICAL].map(p => (
                        <option key={p} value={p}>{getPriorityLabel(p)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Email Digest */}
      <div className="settings-section">
        <h3>Email Digest</h3>
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={preferences.emailDigest.enabled}
              onChange={(e) => updateEmailDigest('enabled', e.target.checked)}
              disabled={!preferences.enabled}
            />
            <span>Enable email digest</span>
          </label>
          <p className="setting-description">
            Group notifications and send them as periodic emails
          </p>
        </div>

        {preferences.emailDigest.enabled && (
          <div className="digest-settings">
            <div className="setting-row">
              <label>Frequency</label>
              <select
                value={preferences.emailDigest.frequency}
                onChange={(e) => updateEmailDigest('frequency', e.target.value)}
                disabled={!preferences.enabled}
              >
                <option value={DigestFrequency.IMMEDIATE}>Immediate</option>
                <option value={DigestFrequency.HOURLY}>Hourly</option>
                <option value={DigestFrequency.DAILY}>Daily</option>
                <option value={DigestFrequency.WEEKLY}>Weekly</option>
              </select>
            </div>

            {preferences.emailDigest.frequency !== DigestFrequency.IMMEDIATE && (
              <div className="setting-row">
                <label>Delivery Time</label>
                <input
                  type="time"
                  value={preferences.emailDigest.time || '09:00'}
                  onChange={(e) => updateEmailDigest('time', e.target.value)}
                  disabled={!preferences.enabled}
                />
              </div>
            )}

            <div className="setting-row">
              <label>Timezone</label>
              <select
                value={preferences.emailDigest.timezone || 'UTC'}
                onChange={(e) => updateEmailDigest('timezone', e.target.value)}
                disabled={!preferences.enabled}
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Asia/Shanghai">Shanghai</option>
              </select>
            </div>

            {/* Weekly specific: day of week */}
            {preferences.emailDigest.frequency === DigestFrequency.WEEKLY && (
              <div className="setting-row">
                <label>Day of Week</label>
                <select
                  value={(preferences.emailDigest.dayOfWeek ?? 1).toString()}
                  onChange={(e) => updateDigestDayOfWeek(parseInt(e.target.value, 10))}
                  disabled={!preferences.enabled}
                >
                  {[0,1,2,3,4,5,6].map(d => (
                    <option key={d} value={d}>{getDayLabel(d)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Digest filters */}
            <div className="setting-row">
              <label>Include Categories</label>
              <div className="categories-list inline">
                {[NotificationCategory.HR_ACTIVITIES, NotificationCategory.SECURITY_ALERTS, NotificationCategory.SYSTEM_UPDATES, NotificationCategory.COMMENTS, NotificationCategory.INTERVIEWS, NotificationCategory.ADMIN].map(cat => (
                  <label key={cat} className="channel-option">
                    <input
                      type="checkbox"
                      checked={(preferences.emailDigest.includeCategories || []).includes(cat)}
                      onChange={() => toggleDigestIncludeCategory(cat)}
                      disabled={!preferences.enabled}
                    />
                    <span>{getCategoryLabel(cat)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="setting-row">
              <label>Minimum Priority</label>
              <select
                value={preferences.emailDigest.minPriority || NotificationPriority.LOW}
                onChange={(e) => updateDigestMinPriority(e.target.value as NotificationPriority)}
                disabled={!preferences.enabled}
              >
                {[NotificationPriority.LOW, NotificationPriority.MEDIUM, NotificationPriority.HIGH, NotificationPriority.CRITICAL].map(p => (
                  <option key={p} value={p}>{getPriorityLabel(p)}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Quiet Hours */}
      <div className="settings-section">
        <h3>Quiet Hours</h3>
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={preferences.quietHours.enabled}
              onChange={(e) => updateQuietHours('enabled', e.target.checked)}
              disabled={!preferences.enabled}
            />
            <span>Enable quiet hours</span>
          </label>
          <p className="setting-description">
            Pause non-critical notifications during specific hours
          </p>
        </div>

        {preferences.quietHours.enabled && (
          <div className="quiet-hours-settings">
            <div className="setting-row">
              <label>Start Time</label>
              <input
                type="time"
                value={preferences.quietHours.start}
                onChange={(e) => updateQuietHours('start', e.target.value)}
                disabled={!preferences.enabled}
              />
            </div>

            <div className="setting-row">
              <label>End Time</label>
              <input
                type="time"
                value={preferences.quietHours.end}
                onChange={(e) => updateQuietHours('end', e.target.value)}
                disabled={!preferences.enabled}
              />
            </div>

            <div className="setting-row">
              <label>Timezone</label>
              <select
                value={preferences.quietHours.timezone}
                onChange={(e) => updateQuietHours('timezone', e.target.value)}
                disabled={!preferences.enabled}
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Asia/Shanghai">Shanghai</option>
              </select>
            </div>

            <div className="setting-row">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={preferences.quietHours.allowCritical}
                  onChange={(e) => updateQuietHours('allowCritical', e.target.checked)}
                  disabled={!preferences.enabled}
                />
                <span>Allow critical notifications</span>
              </label>
            </div>

            <div className="setting-row">
              <label>Active Days</label>
              <div className="days-selector">
                {[0, 1, 2, 3, 4, 5, 6].map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`day-button ${(preferences.quietHours.daysOfWeek || []).includes(day) ? 'selected' : ''}`}
                    onClick={() => toggleQuietHoursDay(day)}
                    disabled={!preferences.enabled}
                  >
                    {getDayLabel(day)}
                  </button>
                ))}
              </div>
              <p className="setting-description">
                Leave empty to apply to all days
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="settings-section">
        <h3>Advanced Settings</h3>
        
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={preferences.batchNotifications}
              onChange={(e) => setPreferences({ ...preferences, batchNotifications: e.target.checked })}
              disabled={!preferences.enabled}
            />
            <span>Batch similar notifications</span>
          </label>
          <p className="setting-description">
            Group similar notifications together to reduce clutter
          </p>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={preferences.soundEnabled}
              onChange={(e) => setPreferences({ ...preferences, soundEnabled: e.target.checked })}
              disabled={!preferences.enabled}
            />
            <span>Enable notification sounds</span>
          </label>
          <p className="setting-description">
            Play a sound when you receive in-app notifications
          </p>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={preferences.desktopNotifications}
              onChange={(e) => setPreferences({ ...preferences, desktopNotifications: e.target.checked })}
              disabled={!preferences.enabled}
            />
            <span>Desktop notifications</span>
          </label>
          <p className="setting-description">
            Show browser desktop notifications (requires browser permission)
          </p>
        </div>
      </div>

      {/* Event Overrides */}
      <div className="settings-section">
        <h3>Event Overrides</h3>
        <p className="setting-description">Customize channels and priority for specific events</p>
        <div className="event-overrides">
          {[NotificationType.INTERVIEW_REMINDER, NotificationType.INTERVIEW_SCHEDULED, NotificationType.CANDIDATE_ASSIGNED, NotificationType.JOB_UPDATED, NotificationType.SECURITY_ALERT, NotificationType.ADMIN_ANNOUNCEMENT].map(type => {
            const current = getEventOverride(type);
            const enabled = current?.enabled ?? false;
            const channels = current?.channels ?? [];
            const priority = current?.priority ?? undefined;
            return (
              <div key={type} className="event-override-item">
                <div className="setting-row">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => upsertEventOverride({ type, enabled: e.target.checked, channels, priority })}
                      disabled={!preferences.enabled}
                    />
                    <span>{type.replace(/_/g, ' ')}</span>
                  </label>
                </div>
                {enabled && (
                  <div className="setting-row">
                    <label>Channels</label>
                    <div className="channels-grid">
                      {[NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.SMS].map(ch => (
                        <label key={ch} className="channel-checkbox">
                          <input
                            type="checkbox"
                            checked={channels.includes(ch)}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...channels, ch]
                                : channels.filter(c => c !== ch);
                              upsertEventOverride({ type, enabled: true, channels: next, priority });
                            }}
                            disabled={!preferences.enabled}
                          />
                          <span>{getChannelLabel(ch)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {enabled && (
                  <div className="setting-row">
                    <label>Priority (optional)</label>
                    <select
                      value={priority || ''}
                      onChange={(e) => {
                        const val = e.target.value as NotificationPriority;
                        upsertEventOverride({ type, enabled: true, channels, priority: val });
                      }}
                      disabled={!preferences.enabled}
                    >
                      <option value="">Default</option>
                      {[NotificationPriority.LOW, NotificationPriority.MEDIUM, NotificationPriority.HIGH, NotificationPriority.CRITICAL].map(p => (
                        <option key={p} value={p}>{getPriorityLabel(p)}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => removeEventOverride(type)}
                      disabled={!preferences.enabled}
                    >
                      Remove Override
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="settings-actions">
        <button
          className="save-button"
          onClick={handleSave}
          disabled={saving || !preferences.enabled}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={async () => {
            try {
              setSaving(true);
              const response = await notificationsApi.resetPreferences(accessToken);
              if (response.preferences) {
                setPreferences(response.preferences);
              }
              setToast({ message: 'Preferences reset to defaults', type: 'success' });
            } catch (error) {
              const msg = error instanceof Error ? error.message : 'Failed to reset preferences';
              setToast({ message: msg, type: 'error' });
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
