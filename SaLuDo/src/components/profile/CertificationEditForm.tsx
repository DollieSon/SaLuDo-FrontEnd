import React from "react";
import { EditableCertification } from "./resumeEditTypes";
import "./css/ResumeEditModal.css";

interface CertificationEditFormProps {
  certification: EditableCertification;
  index: number;
  onChange: (index: number, field: keyof EditableCertification, value: any) => void;
}

export const CertificationEditForm: React.FC<CertificationEditFormProps> = ({
  certification,
  index,
  onChange
}) => {
  return (
    <>
      <div className="resume-edit-modal__field-group">
        <div className="resume-edit-modal__field">
          <label className="resume-edit-modal__label">Certification Name</label>
          <input
            type="text"
            className="resume-edit-modal__input"
            value={certification.certificationName || ''}
            onChange={(e) => onChange(index, 'certificationName', e.target.value)}
            placeholder="e.g., AWS Certified Solutions Architect"
          />
        </div>
        <div className="resume-edit-modal__field">
          <label className="resume-edit-modal__label">Issuing Organization</label>
          <input
            type="text"
            className="resume-edit-modal__input"
            value={certification.issuingOrganization || ''}
            onChange={(e) => onChange(index, 'issuingOrganization', e.target.value)}
            placeholder="e.g., Amazon Web Services"
          />
        </div>
      </div>

      <div className="resume-edit-modal__field-group">
        <div className="resume-edit-modal__field">
          <label className="resume-edit-modal__label">Issue Date</label>
          <input
            type="date"
            className="resume-edit-modal__input resume-edit-modal__input--date"
            value={certification.issueDate ? certification.issueDate.split('T')[0] : ''}
            onChange={(e) => onChange(index, 'issueDate', e.target.value)}
          />
        </div>
        <div className="resume-edit-modal__field">
          <label className="resume-edit-modal__label">Expiration Date</label>
          <input
            type="date"
            className="resume-edit-modal__input resume-edit-modal__input--date"
            value={certification.expirationDate ? certification.expirationDate.split('T')[0] : ''}
            onChange={(e) => onChange(index, 'expirationDate', e.target.value)}
          />
        </div>
      </div>

      <div className="resume-edit-modal__field">
        <label className="resume-edit-modal__label">Description *</label>
        <textarea
          className="resume-edit-modal__textarea"
          value={certification.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          placeholder="Details about this certification..."
        />
      </div>

      <div className="resume-edit-modal__field">
        <label className="resume-edit-modal__label">Source</label>
        <select
          className="resume-edit-modal__input"
          value={certification.source}
          onChange={(e) => onChange(index, 'source', e.target.value as 'ai' | 'manual')}
        >
          <option value="ai">AI</option>
          <option value="manual">Human</option>
        </select>
      </div>
    </>
  );
};
