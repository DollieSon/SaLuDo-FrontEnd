import React, { useState } from "react";
import { UserProfile, Availability, RoleSpecificData } from "../types/user";
import "./css/ProfileEditForm.css";

interface ProfileEditFormProps {
  user: UserProfile;
  onSave: (updatedProfile: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
}

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Australia/Sydney",
];

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  user,
  onSave,
  onCancel,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    location: user.location || "",
    timezone: user.timezone || "America/New_York",
    linkedInUrl: user.linkedInUrl || "",
    bio: user.bio || "",
    availability: {
      status: user.availability?.status || "available",
      daysAvailable: user.availability?.daysAvailable || [],
      preferredTimeSlots: user.availability?.preferredTimeSlots || [],
      notes: user.availability?.notes || "",
    } as Availability,
    roleSpecificData: user.roleSpecificData || ({} as RoleSpecificData),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAvailabilityChange = (field: keyof Availability, value: any) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value,
      },
    }));
  };

  const handleDayToggle = (day: string) => {
    const currentDays = formData.availability.daysAvailable || [];
    const newDays = currentDays.includes(day as any)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day as any];
    handleAvailabilityChange("daysAvailable", newDays);
  };

  const handleRoleDataChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      roleSpecificData: {
        ...prev.roleSpecificData,
        [field]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Phone validation (if provided)
    if (formData.phoneNumber) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ""))) {
        newErrors.phoneNumber = "Invalid phone number format";
      }
    }

    // LinkedIn URL validation (if provided)
    if (formData.linkedInUrl) {
      const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/?$/;
      if (!linkedInRegex.test(formData.linkedInUrl)) {
        newErrors.linkedInUrl = "Invalid LinkedIn URL format";
      }
    }

    // Bio length validation
    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = "Bio must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="profile-edit-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Basic Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled
          />
          <small>Email cannot be changed here</small>
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            maxLength={1000}
            placeholder="Tell us about yourself..."
          />
          <small>{formData.bio.length}/1000 characters</small>
          {errors.bio && <span className="error">{errors.bio}</span>}
        </div>
      </div>

      <div className="form-section">
        <h3>Contact Information</h3>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1234567890"
          />
          {errors.phoneNumber && (
            <span className="error">{errors.phoneNumber}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, State/Country"
          />
        </div>

        <div className="form-group">
          <label htmlFor="timezone">Timezone</label>
          <select
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="linkedInUrl">LinkedIn Profile</label>
          <input
            type="url"
            id="linkedInUrl"
            name="linkedInUrl"
            value={formData.linkedInUrl}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/your-profile"
          />
          {errors.linkedInUrl && (
            <span className="error">{errors.linkedInUrl}</span>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3>Availability</h3>
        <div className="form-group">
          <label htmlFor="availability-status">Status</label>
          <select
            id="availability-status"
            value={formData.availability.status}
            onChange={(e) =>
              handleAvailabilityChange(
                "status",
                e.target.value as "available" | "busy" | "away"
              )
            }
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="away">Away</option>
          </select>
        </div>

        <div className="form-group">
          <label>Available Days</label>
          <div className="days-selector">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                type="button"
                className={`day-button ${
                  formData.availability.daysAvailable?.includes(day as any)
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleDayToggle(day)}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="availabilityNotes">Availability Notes</label>
          <input
            type="text"
            id="availabilityNotes"
            value={formData.availability.notes || ""}
            onChange={(e) => handleAvailabilityChange("notes", e.target.value)}
            placeholder="e.g., Available for morning meetings only"
          />
        </div>
      </div>

      {user.role === "interviewer" && (
        <div className="form-section">
          <h3>Interviewer Settings</h3>
          <div className="form-group">
            <label htmlFor="expertiseAreas">Expertise Areas</label>
            <input
              type="text"
              id="expertiseAreas"
              value={
                formData.roleSpecificData?.expertiseAreas?.join(", ") || ""
              }
              onChange={(e) =>
                handleRoleDataChange("expertiseAreas", 
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              placeholder="technical, behavioral, leadership (comma-separated)"
            />
          </div>
        </div>
      )}

      {user.role === "recruiter" && (
        <div className="form-section">
          <h3>Recruiter Settings</h3>
          <div className="form-group">
            <label htmlFor="specializations">Specializations</label>
            <input
              type="text"
              id="specializations"
              value={
                formData.roleSpecificData?.specializations?.join(", ") || ""
              }
              onChange={(e) =>
                handleRoleDataChange("specializations",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              placeholder="software-engineering, marketing, sales (comma-separated)"
            />
          </div>
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
