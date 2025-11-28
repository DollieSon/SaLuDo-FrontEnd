import React from "react";
import { EditableEducation } from "./resumeEditTypes";
import "./css/ResumeEditModal.css";

interface EducationEditFormProps {
  education: EditableEducation;
  index: number;
  onChange: (index: number, field: keyof EditableEducation, value: any) => void;
}

export const EducationEditForm: React.FC<EducationEditFormProps> = ({
  education,
  index,
  onChange
}) => {
  return (
    <>
      <div className="resume-edit-modal__field-group">
        <div className="resume-edit-modal__field">
          <label className="resume-edit-modal__label">Institution</label>
          <input
            type="text"
            className="resume-edit-modal__input"
            value={education.institution || ''}
            onChange={(e) => onChange(index, 'institution', e.target.value)}
            placeholder="e.g., Harvard University"
          />
        </div>
        <div className="resume-edit-modal__field">
          <label className="resume-edit-modal__label">Degree</label>
          <input
            type="text"
            className="resume-edit-modal__input"
            value={education.degree || ''}
            onChange={(e) => onChange(index, 'degree', e.target.value)}
            placeholder="e.g., Bachelor of Science"
          />
        </div>
      </div>

      <div className="resume-edit-modal__field-group">
        <div className="resume-edit-modal__field">
          <label className="resume-edit-modal__label">Field of Study</label>
          <input
            type="text"
            className="resume-edit-modal__input"
            value={education.fieldOfStudy || ''}
            onChange={(e) => onChange(index, 'fieldOfStudy', e.target.value)}
            placeholder="e.g., Computer Science"
          />
        </div>
        <div className="resume-edit-modal__field">
          <label className="resume-edit-modal__label">Graduation Date</label>
          <input
            type="date"
            className="resume-edit-modal__input resume-edit-modal__input--date"
            value={education.graduationDate ? education.graduationDate.split('T')[0] : ''}
            onChange={(e) => onChange(index, 'graduationDate', e.target.value)}
          />
        </div>
      </div>

      <div className="resume-edit-modal__field">
        <label className="resume-edit-modal__label">Description *</label>
        <textarea
          className="resume-edit-modal__textarea"
          value={education.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          placeholder="Additional details about your education..."
        />
      </div>

      <div className="resume-edit-modal__field">
        <label className="resume-edit-modal__label">Source</label>
        <select
          className="resume-edit-modal__input"
          value={education.source}
          onChange={(e) => onChange(index, 'source', e.target.value as 'ai' | 'manual')}
        >
          <option value="ai">AI</option>
          <option value="manual">Human</option>
        </select>
      </div>
    </>
  );
};
