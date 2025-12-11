import "./css/UserProfile.css";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usersApi } from "../utils/api";
import { UserProfile as UserProfileType, ProfileStats, ProfileActivity } from "../types/user";
import ProfilePhotoUpload from "./ProfilePhotoUpload.tsx";
import ProfileEditForm from "./ProfileEditForm.tsx";
import ProfileStatsWidget from "./ProfileStatsWidget.tsx";
import ProfileActivityTimeline from "./ProfileActivityTimeline.tsx";
import ProfileSettings from "./ProfileSettings.tsx";

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [activity, setActivity] = useState<ProfileActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'activity' | 'settings'>('profile');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const accessToken = localStorage.getItem("accessToken") || "";
  const currentUserId = currentUser?.userId || "";
  const targetUserId = userId || currentUserId;
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, [targetUserId]);

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch user profile
      const userResponse = await usersApi.getUserById(accessToken, targetUserId);
      if (userResponse.success) {
        setUser(userResponse.data);
      }

      // Fetch stats
      const statsResponse = await usersApi.getUserStats(accessToken, targetUserId);
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Fetch activity
      const activityResponse = await usersApi.getProfileActivity(accessToken, targetUserId, 10);
      if (activityResponse.success) {
        setActivity(activityResponse.data);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (updates: any) => {
    try {
      const response = await usersApi.updateUserProfile(accessToken, targetUserId, updates);
      if (response.success) {
        showToast("Profile updated successfully", "success");
        await fetchUserData(); // Refresh data
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast("Failed to update profile", "error");
    }
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      const response = await usersApi.uploadProfilePhoto(accessToken, targetUserId, file);
      if (response.success) {
        showToast("Profile photo uploaded successfully", "success");
        await fetchUserData(); // Refresh data
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
      showToast("Failed to upload photo", "error");
    }
  };

  const handlePhotoDelete = async () => {
    try {
      const response = await usersApi.deleteProfilePhoto(accessToken, targetUserId);
      if (response.success) {
        showToast("Profile photo deleted successfully", "success");
        await fetchUserData(); // Refresh data
      }
    } catch (err) {
      console.error("Error deleting photo:", err);
      showToast("Failed to delete photo", "error");
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const canEdit = currentUserId === targetUserId || currentUser?.role === 'admin';

  if (isLoading) {
    return null;
  }

  if (error || !user) {
    return (
      <div className="user-profile-page">
        <div className="error-message">
          <p>{error || "User not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="profile">
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="profile-header">
        <div
          className="back-label"
        >
          <div className="left-section">
            <img src="/images/back.png" alt="Back" onClick={handleGoBack} />
            <h2>{user.fullName}</h2>
            <span className="profile-role">{user.role.replace('_', ' ')}</span>
          </div>
          {canEdit && (
            <div className="profile-actions">
              <button
                className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <ProfilePhotoUpload
          userId={targetUserId}
          fullName={user.fullName}
          photoMetadata={user.photoMetadata}
          canEdit={canEdit}
          onUpload={handlePhotoUpload}
          onDelete={handlePhotoDelete}
        />
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
        {canEdit && (
          <button
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        )}
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          isEditing ? (
            <ProfileEditForm
              user={user}
              onSave={handleProfileUpdate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="profile-view">
              <section className="profile-section">
                <h2>Contact Information</h2>
                <div className="profile-info-grid">
                  <div className="info-item">
                    <label>Email</label>
                    <p>{user.email}</p>
                  </div>
                  {user.phoneNumber && (
                    <div className="info-item">
                      <label>Phone</label>
                      <p>{user.phoneNumber}</p>
                    </div>
                  )}
                  {user.timezone && (
                    <div className="info-item">
                      <label>Timezone</label>
                      <p>{user.timezone}</p>
                    </div>
                  )}
                  {user.linkedInUrl && (
                    <div className="info-item">
                      <label>LinkedIn</label>
                      <a href={user.linkedInUrl} target="_blank" rel="noopener noreferrer">
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
              </section>

              {user.bio && (
                <section className="profile-section">
                  <h2>About</h2>
                  <p className="bio">{user.bio}</p>
                </section>
              )}

              {user.availability && (
                <section className="profile-section">
                  <h2>Availability</h2>
                  <div className="availability">
                    <p className={`availability-status status-${user.availability.status}`}>
                      {user.availability.status.toUpperCase()}
                    </p>
                    {user.availability.daysAvailable && user.availability.daysAvailable.length > 0 && (
                      <div>
                        <label>Available Days:</label>
                        <p>{user.availability.daysAvailable.join(', ')}</p>
                      </div>
                    )}
                    {user.availability.preferredTimeSlots && user.availability.preferredTimeSlots.length > 0 && (
                      <div>
                        <label>Preferred Time Slots:</label>
                        <p>{user.availability.preferredTimeSlots.join(', ')}</p>
                      </div>
                    )}
                    {user.availability.notes && (
                      <div>
                        <label>Notes:</label>
                        <p>{user.availability.notes}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {user.roleSpecificData && (
                <section className="profile-section">
                  <h2>Role Details</h2>
                  <div className="role-specific">
                    {user.roleSpecificData.expertiseAreas && (
                      <div>
                        <label>Expertise Areas:</label>
                        <div className="tags">
                          {user.roleSpecificData.expertiseAreas.map((area, idx) => (
                            <span key={idx} className="tag">{area}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {user.roleSpecificData.specializations && (
                      <div>
                        <label>Specializations:</label>
                        <div className="tags">
                          {user.roleSpecificData.specializations.map((spec, idx) => (
                            <span key={idx} className="tag">{spec}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section className="profile-section">
                <h2>Account Information</h2>
                <div className="profile-info-grid">
                  <div className="info-item">
                    <label>Account Created</label>
                    <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  {user.lastLogin && (
                    <div className="info-item">
                      <label>Last Login</label>
                      <p>{new Date(user.lastLogin).toLocaleString()}</p>
                    </div>
                  )}
                  <div className="info-item">
                    <label>Status</label>
                    <p className={user.isActive ? 'status-active' : 'status-inactive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )
        )}

        {activeTab === 'stats' && stats && (
          <ProfileStatsWidget stats={stats} />
        )}

        {activeTab === 'activity' && (
          <ProfileActivityTimeline activities={activity} />
        )}

        {activeTab === 'settings' && canEdit && (
          <ProfileSettings userId={targetUserId} accessToken={accessToken} />
        )}
      </div>
    </main>
  );
};

export default UserProfile;
