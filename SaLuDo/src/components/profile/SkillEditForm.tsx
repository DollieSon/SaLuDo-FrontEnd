import React from "react";
import { EditableSkill } from "./resumeEditTypes";
import { SKILL_SCORE } from "./resumeEditConstants";
import "./css/ResumeEditModal.css";

interface SkillEditFormProps {
  skill: EditableSkill;
  index: number;
  onChange: (index: number, field: keyof EditableSkill, value: any) => void;
}

export const SkillEditForm: React.FC<SkillEditFormProps> = ({
  skill,
  index,
  onChange
}) => {
  return (
    <>
      <div className="resume-edit-modal__field">
        <label className="resume-edit-modal__label">Skill Name *</label>
        <input
          type="text"
          className="resume-edit-modal__input"
          value={skill.skillName}
          onChange={(e) => onChange(index, 'skillName', e.target.value)}
          placeholder="e.g., JavaScript, Project Management"
        />
      </div>

      <div className="resume-edit-modal__field-group">
        <div className="resume-edit-modal__field">
          <label className="resume-edit-modal__label">
            Score ({SKILL_SCORE.MIN}-{SKILL_SCORE.MAX}) *
          </label>
          <input
            type="number"
            className="resume-edit-modal__input resume-edit-modal__input--small"
            value={skill.score}
            onChange={(e) => onChange(index, 'score', Number(e.target.value))}
            min={SKILL_SCORE.MIN}
            max={SKILL_SCORE.MAX}
          />
        </div>
      </div>

      <div className="resume-edit-modal__field">
        <label className="resume-edit-modal__label">Evidence</label>
        <textarea
          className="resume-edit-modal__textarea"
          value={skill.evidence}
          onChange={(e) => onChange(index, 'evidence', e.target.value)}
          placeholder="Provide context or evidence for this skill..."
        />
      </div>

      <div className="resume-edit-modal__field">
        <label className="resume-edit-modal__label">Source</label>
        <select
          className="resume-edit-modal__input"
          value={skill.source}
          onChange={(e) => onChange(index, 'source', e.target.value as 'ai' | 'manual')}
        >
          <option value="ai">AI</option>
          <option value="manual">Human</option>
        </select>
      </div>
    </>
  );
};
