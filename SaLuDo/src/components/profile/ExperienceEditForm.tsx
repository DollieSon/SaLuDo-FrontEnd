import React from "react";
import { EditableExperience } from "./resumeEditTypes";
import "./css/ResumeEditModal.css";

interface ExperienceEditFormProps {
  experience: EditableExperience;
  index: number;
  onChange: (index: number, field: keyof EditableExperience, value: any) => void;
}

export const ExperienceEditForm: React.FC<ExperienceEditFormProps> = ({
  experience,
  index,
  onChange
}) => {
  return (
    <>
      <div className="resume-edit-modal__field-group">
        <div className="resume-edit-modal__field">
          <label className="resume-edit-modal__label">Title</label>
          <input
            type="text"
            className="resume-edit-modal__input"
            value={experience.title || ''}
            onChange={(e) => onChange(index, 'title', e.target.value)}
            placeholder="e.g., Senior Software Engineer"
          />
        </div>
        <div className="resume-edit-modal__field">
          <label className="resume-edit-modal__label">Role</label>
          <input
            type="text"
            className="resume-edit-modal__input"
            value={experience.role || ''}
            onChange={(e) => onChange(index, 'role', e.target.value)}
            placeholder="e.g., Google, Full Stack Developer"
          />
        </div>
      </div>

      <div className="resume-edit-modal__field-group">
        <div className="resume-edit-modal__field">
          <label className="resume-edit-modal__label">Start Date</label>
          <input
            type="date"
            className="resume-edit-modal__input resume-edit-modal__input--date"
            value={experience.startDate ? experience.startDate.split('T')[0] : ''}
            onChange={(e) => onChange(index, 'startDate', e.target.value)}
          />
        </div>
        <div className="resume-edit-modal__field">
          <label className="resume-edit-modal__label">End Date</label>
          <input
            type="date"
            className="resume-edit-modal__input resume-edit-modal__input--date"
            value={experience.endDate ? experience.endDate.split('T')[0] : ''}
            onChange={(e) => onChange(index, 'endDate', e.target.value)}
          />
        </div>
      </div>

      <div className="resume-edit-modal__field">
        <label className="resume-edit-modal__label">Description *</label>
        <textarea
          className="resume-edit-modal__textarea"
          value={experience.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          placeholder="Describe your responsibilities and achievements..."
        />
      </div>

      <div className="resume-edit-modal__field">
        <label className="resume-edit-modal__label">Source</label>
        <select
          className="resume-edit-modal__input"
          value={experience.source}
          onChange={(e) => onChange(index, 'source', e.target.value as 'ai' | 'manual')}
        >
          <option value="ai">AI</option>
          <option value="manual">Human</option>
        </select>
      </div>
    </>
  );
};
