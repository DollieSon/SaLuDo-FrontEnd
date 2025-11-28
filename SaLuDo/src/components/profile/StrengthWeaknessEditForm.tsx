import React from "react";
import { EditableStrengthWeakness } from "./resumeEditTypes";
import "./css/ResumeEditModal.css";

interface StrengthWeaknessEditFormProps {
  item: EditableStrengthWeakness;
  index: number;
  onChange: (index: number, field: keyof EditableStrengthWeakness, value: any) => void;
}

export const StrengthWeaknessEditForm: React.FC<StrengthWeaknessEditFormProps> = ({
  item,
  index,
  onChange
}) => {
  return (
    <>
      <div className="resume-edit-modal__field">
        <label className="resume-edit-modal__label">Name *</label>
        <input
          type="text"
          className="resume-edit-modal__input"
          value={item.name || ''}
          onChange={(e) => onChange(index, 'name', e.target.value)}
          placeholder={`e.g., Leadership, Time Management`}
        />
      </div>

      <div className="resume-edit-modal__field">
        <label className="resume-edit-modal__label">Description *</label>
        <textarea
          className="resume-edit-modal__textarea"
          value={item.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          placeholder={`Describe this ${item.type}...`}
        />
      </div>

      <div className="resume-edit-modal__field">
        <label className="resume-edit-modal__label">Source</label>
        <select
          className="resume-edit-modal__input"
          value={item.source}
          onChange={(e) => onChange(index, 'source', e.target.value as 'ai' | 'manual')}
        >
          <option value="ai">AI</option>
          <option value="manual">Human</option>
        </select>
      </div>
    </>
  );
};
