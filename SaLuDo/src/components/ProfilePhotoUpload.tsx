import React, { useState, useRef } from "react";
import { ProfilePhotoMetadata } from "../types/user";
import { usersApi } from "../utils/api";
import "./css/ProfilePhotoUpload.css";

interface ProfilePhotoUploadProps {
  userId: string;
  fullName: string;
  photoMetadata?: ProfilePhotoMetadata;
  canEdit: boolean;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  userId,
  fullName,
  photoMetadata,
  canEdit,
  onUpload,
  onDelete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoUrl = photoMetadata
    ? usersApi.getProfilePhotoUrl(userId, false)
    : null;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      await onUpload(file);
      setPreview(null);
    } catch (error) {
      console.error('Upload error:', error);
      setPreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    setIsUploading(true);
    try {
      await onDelete();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (fullName: string): string => {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="profile-photo-upload">
      <div className="photo-container">
        {preview ? (
          <img src={preview} alt="Preview" className="profile-photo preview" />
        ) : photoUrl ? (
          <img
            src={photoUrl}
            alt="Profile"
            className="profile-photo"
            onError={(e) => {
              // Fallback to initials if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="profile-photo-placeholder">
            {getInitials(fullName)}
          </div>
        )}
        
        {isUploading && (
          <div className="upload-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {canEdit && (
        <div className="photo-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <button
            className="btn btn-small btn-primary"
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            {photoUrl ? 'Change Photo' : 'Upload Photo'}
          </button>

          {photoUrl && (
            <button
              className="btn btn-small btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isUploading}
            >
              Delete
            </button>
          )}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="modal-content">
            <h3>Delete Profile Photo?</h3>
            <p>Are you sure you want to delete your profile photo?</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;
