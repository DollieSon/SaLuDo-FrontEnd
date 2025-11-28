import React, { useState } from "react";
import { ProfileItem } from "../../types/profile";
import { ProfileItemCard } from "./ProfileItemCard";
import { ResumeEditModal } from "./ResumeEditModal";
import { SkillEditForm } from "./SkillEditForm";
import { ExperienceEditForm } from "./ExperienceEditForm";
import { EducationEditForm } from "./EducationEditForm";
import { CertificationEditForm } from "./CertificationEditForm";
import { StrengthWeaknessEditForm } from "./StrengthWeaknessEditForm";
import { 
  ResumeEditData 
} from "./resumeEditTypes";
import { RESUME_SECTION_LABELS, EMPTY_MESSAGES, SKILL_SCORE } from "./resumeEditConstants";
import "./css/ResumeEditForm.css";

interface ResumeParsedSectionProps {
  skills: ProfileItem[];
  experience: ProfileItem[];
  education: ProfileItem[];
  certification: ProfileItem[];
  strength: ProfileItem[];
  weaknesses: ProfileItem[];
  isEditing: boolean;
  editedResumeData: ResumeEditData;
  onEditToggle: () => void;
  onCancelEdit: () => void;
  onResumeDataChange: (data: ResumeEditData) => void;
  onItemClick: (item: ProfileItem, section: string, type: 'skill' | 'experience' | 'education' | 'certification' | 'strength' | 'weakness') => void;
}

export const ResumeParsedSection: React.FC<ResumeParsedSectionProps> = ({
  skills,
  experience,
  education,
  certification,
  strength,
  weaknesses,
  isEditing,
  editedResumeData,
  onEditToggle,
  onCancelEdit,
  onResumeDataChange,
  onItemClick
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'skill' | 'experience' | 'education' | 'certification' | 'strength' | 'weakness' | null;
    index: number;
    isAddMode: boolean;
  }>({
    isOpen: false,
    type: null,
    index: -1,
    isAddMode: false
  });

  // Helper functions to convert editedResumeData to ProfileItem for display
  const convertSkillToProfileItem = (skill: any): ProfileItem => ({
    text: skill.skillName || '',
    score: skill.score,
    skillName: skill.skillName,
    evidence: skill.evidence,
    addedBy: skill.addedBy === 'AI' ? 'AI' : skill.addedBy === 'HUMAN' ? 'Human' : skill.source === 'ai' ? 'AI' : 'Human'
  });

  const convertExperienceToProfileItem = (exp: any): ProfileItem => ({
    text: exp.description || '',
    title: exp.title || '',
    role: exp.role || '',
    startDate: exp.startDate,
    endDate: exp.endDate,
    addedBy: exp.addedBy === 'AI' ? 'AI' : exp.addedBy === 'HUMAN' ? 'Human' : exp.source === 'ai' ? 'AI' : 'Human'
  });

  const convertEducationToProfileItem = (edu: any): ProfileItem => ({
    text: edu.description || '',
    institution: edu.institution || '',
    title: edu.institution || '',
    addedBy: edu.addedBy === 'AI' ? 'AI' : edu.addedBy === 'HUMAN' ? 'Human' : edu.source === 'ai' ? 'AI' : 'Human'
  });

  const convertCertificationToProfileItem = (cert: any): ProfileItem => ({
    text: cert.description || '',
    name: cert.certificationName || cert.name || '',
    issuingOrganization: cert.issuingOrganization || '',
    issueDate: cert.issueDate,
    addedBy: cert.addedBy === 'AI' ? 'AI' : cert.addedBy === 'HUMAN' ? 'Human' : cert.source === 'ai' ? 'AI' : 'Human'
  });

  const convertStrengthWeaknessToProfileItem = (item: any): ProfileItem => ({
    text: item.description || '',
    skillName: item.name || item.description || '',
    addedBy: item.addedBy === 'AI' ? 'AI' : item.addedBy === 'HUMAN' ? 'Human' : item.source === 'ai' ? 'AI' : 'Human'
  });

  // Get display data based on edit mode
  const displaySkills = isEditing 
    ? editedResumeData.skills.map(convertSkillToProfileItem)
    : skills;
  const displayExperience = isEditing
    ? editedResumeData.experience.map(convertExperienceToProfileItem)
    : experience;
  const displayEducation = isEditing
    ? editedResumeData.education.map(convertEducationToProfileItem)
    : education;
  const displayCertification = isEditing
    ? editedResumeData.certification.map(convertCertificationToProfileItem)
    : certification;
  const displayStrengths = isEditing
    ? editedResumeData.strengths.map(convertStrengthWeaknessToProfileItem)
    : strength;
  const displayWeaknesses = isEditing
    ? editedResumeData.weaknesses.map(convertStrengthWeaknessToProfileItem)
    : weaknesses;

  const openEditModal = (type: typeof modalState.type, index: number) => {
    setModalState({ isOpen: true, type, index, isAddMode: false });
  };

  const openAddModal = (type: typeof modalState.type) => {
    // Add a new empty item
    let newIndex = -1;
    const updated = { ...editedResumeData };
    
    switch (type) {
      case 'skill':
        updated.skills = [...updated.skills, {
          skillName: '',
          score: SKILL_SCORE.DEFAULT,
          evidence: '',
          source: 'manual'
        }];
        newIndex = updated.skills.length - 1;
        break;
      case 'experience':
        updated.experience = [...updated.experience, {
          description: '',
          source: 'manual'
        }];
        newIndex = updated.experience.length - 1;
        break;
      case 'education':
        updated.education = [...updated.education, {
          description: '',
          source: 'manual'
        }];
        newIndex = updated.education.length - 1;
        break;
      case 'certification':
        updated.certification = [...updated.certification, {
          description: '',
          source: 'manual'
        }];
        newIndex = updated.certification.length - 1;
        break;
      case 'strength':
        updated.strengths = [...updated.strengths, {
          name: '',
          description: '',
          type: 'strength' as const,
          source: 'manual'
        }];
        newIndex = updated.strengths.length - 1;
        break;
      case 'weakness':
        updated.weaknesses = [...updated.weaknesses, {
          name: '',
          description: '',
          type: 'weakness' as const,
          source: 'manual'
        }];
        newIndex = updated.weaknesses.length - 1;
        break;
    }
    
    onResumeDataChange(updated);
    setModalState({ isOpen: true, type, index: newIndex, isAddMode: true });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null, index: -1, isAddMode: false });
  };

  const handleDelete = () => {
    const { type, index } = modalState;
    const updated = { ...editedResumeData };
    
    switch (type) {
      case 'skill':
        updated.skills = updated.skills.filter((_, i) => i !== index);
        break;
      case 'experience':
        updated.experience = updated.experience.filter((_, i) => i !== index);
        break;
      case 'education':
        updated.education = updated.education.filter((_, i) => i !== index);
        break;
      case 'certification':
        updated.certification = updated.certification.filter((_, i) => i !== index);
        break;
      case 'strength':
        updated.strengths = updated.strengths.filter((_, i) => i !== index);
        break;
      case 'weakness':
        updated.weaknesses = updated.weaknesses.filter((_, i) => i !== index);
        break;
    }
    
    onResumeDataChange(updated);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const { type } = modalState;
    const updated = { ...editedResumeData };
    
    switch (type) {
      case 'skill':
        updated.skills = [...updated.skills];
        updated.skills[index] = { ...updated.skills[index], [field]: value };
        break;
      case 'experience':
        updated.experience = [...updated.experience];
        updated.experience[index] = { ...updated.experience[index], [field]: value };
        break;
      case 'education':
        updated.education = [...updated.education];
        updated.education[index] = { ...updated.education[index], [field]: value };
        break;
      case 'certification':
        updated.certification = [...updated.certification];
        updated.certification[index] = { ...updated.certification[index], [field]: value };
        break;
      case 'strength':
        updated.strengths = [...updated.strengths];
        updated.strengths[index] = { ...updated.strengths[index], [field]: value };
        break;
      case 'weakness':
        updated.weaknesses = [...updated.weaknesses];
        updated.weaknesses[index] = { ...updated.weaknesses[index], [field]: value };
        break;
    }
    
    onResumeDataChange(updated);
  };

  const renderModalContent = () => {
    const { type, index } = modalState;
    
    switch (type) {
      case 'skill':
        return editedResumeData.skills[index] && (
          <SkillEditForm
            skill={editedResumeData.skills[index]}
            index={index}
            onChange={handleChange}
          />
        );
      case 'experience':
        return editedResumeData.experience[index] && (
          <ExperienceEditForm
            experience={editedResumeData.experience[index]}
            index={index}
            onChange={handleChange}
          />
        );
      case 'education':
        return editedResumeData.education[index] && (
          <EducationEditForm
            education={editedResumeData.education[index]}
            index={index}
            onChange={handleChange}
          />
        );
      case 'certification':
        return editedResumeData.certification[index] && (
          <CertificationEditForm
            certification={editedResumeData.certification[index]}
            index={index}
            onChange={handleChange}
          />
        );
      case 'strength':
        return editedResumeData.strengths[index] && (
          <StrengthWeaknessEditForm
            item={editedResumeData.strengths[index]}
            index={index}
            onChange={handleChange}
          />
        );
      case 'weakness':
        return editedResumeData.weaknesses[index] && (
          <StrengthWeaknessEditForm
            item={editedResumeData.weaknesses[index]}
            index={index}
            onChange={handleChange}
          />
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    const { type, isAddMode } = modalState;
    if (!type) return '';
    
    let label = '';
    switch (type) {
      case 'skill':
        label = RESUME_SECTION_LABELS.skills;
        break;
      case 'experience':
        label = RESUME_SECTION_LABELS.experience;
        break;
      case 'education':
        label = RESUME_SECTION_LABELS.education;
        break;
      case 'certification':
        label = RESUME_SECTION_LABELS.certification;
        break;
      case 'strength':
        label = RESUME_SECTION_LABELS.strengths;
        break;
      case 'weakness':
        label = RESUME_SECTION_LABELS.weaknesses;
        break;
    }
    
    return isAddMode ? `Add ${label}` : `Edit ${label}`;
  };
  return (
    <>
      <div className="parsed-section">
        <div className="box-header">
          <h3>Resume Parsed Information</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            {isEditing && (
              <button 
                className="edit-btn" 
                onClick={onCancelEdit}
                style={{ backgroundColor: "#6b7280" }}
              >
                Cancel
              </button>
            )}
            <button className="edit-btn" onClick={onEditToggle}>
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>
        </div>
        <div className="box-content">
          {/* Skills Section */}
          <div className="section">
            <strong>{RESUME_SECTION_LABELS.skills}:</strong>
            {displaySkills.length > 0 ? (
              <div className="skills-grid">
                {displaySkills.map((item: ProfileItem, idx: number) => (
                  <ProfileItemCard
                    key={idx}
                    item={item}
                    index={idx}
                    section={RESUME_SECTION_LABELS.skills}
                    type="skill"
                    onClick={isEditing ? () => openEditModal('skill', idx) : onItemClick}
                  />
                ))}
              </div>
            ) : (
              <p className="resume-edit-section__empty">{EMPTY_MESSAGES.skills}</p>
            )}
            {isEditing && (
              <button
                type="button"
                className="resume-edit-section__add-button"
                onClick={() => openAddModal('skill')}
              >
                + Add Skill
              </button>
            )}
          </div>

          {/* Experience Section */}
          <div className="section">
            <strong>{RESUME_SECTION_LABELS.experience}:</strong>
            {displayExperience.length > 0 ? (
              <div className="skills-grid">
                {displayExperience.map((item: ProfileItem, idx: number) => (
                  <ProfileItemCard
                    key={idx}
                    item={item}
                    index={idx}
                    section={RESUME_SECTION_LABELS.experience}
                    type="experience"
                    onClick={isEditing ? () => openEditModal('experience', idx) : onItemClick}
                  />
                ))}
              </div>
            ) : (
              <p className="resume-edit-section__empty">{EMPTY_MESSAGES.experience}</p>
            )}
            {isEditing && (
              <button
                type="button"
                className="resume-edit-section__add-button"
                onClick={() => openAddModal('experience')}
              >
                + Add Experience
              </button>
            )}
          </div>

          {/* Education Section */}
          <div className="section">
            <strong>{RESUME_SECTION_LABELS.education}:</strong>
            {displayEducation.length > 0 ? (
              <div className="skills-grid">
                {displayEducation.map((item: ProfileItem, idx: number) => (
                  <ProfileItemCard
                    key={idx}
                    item={item}
                    index={idx}
                    section={RESUME_SECTION_LABELS.education}
                    type="education"
                    onClick={isEditing ? () => openEditModal('education', idx) : onItemClick}
                  />
                ))}
              </div>
            ) : (
              <p className="resume-edit-section__empty">{EMPTY_MESSAGES.education}</p>
            )}
            {isEditing && (
              <button
                type="button"
                className="resume-edit-section__add-button"
                onClick={() => openAddModal('education')}
              >
                + Add Education
              </button>
            )}
          </div>

          {/* Certification Section */}
          <div className="section">
            <strong>{RESUME_SECTION_LABELS.certification}:</strong>
            {displayCertification.length > 0 ? (
              <div className="skills-grid">
                {displayCertification.map((item: ProfileItem, idx: number) => (
                  <ProfileItemCard
                    key={idx}
                    item={item}
                    index={idx}
                    section={RESUME_SECTION_LABELS.certification}
                    type="certification"
                    onClick={isEditing ? () => openEditModal('certification', idx) : onItemClick}
                  />
                ))}
              </div>
            ) : (
              <p className="resume-edit-section__empty">{EMPTY_MESSAGES.certification}</p>
            )}
            {isEditing && (
              <button
                type="button"
                className="resume-edit-section__add-button"
                onClick={() => openAddModal('certification')}
              >
                + Add Certification
              </button>
            )}
          </div>

          {/* Strength Section */}
          <div className="section">
            <strong>{RESUME_SECTION_LABELS.strengths}:</strong>
            {displayStrengths.length > 0 ? (
              <div className="skills-grid">
                {displayStrengths.map((item: ProfileItem, idx: number) => (
                  <ProfileItemCard
                    key={idx}
                    item={item}
                    index={idx}
                    section={RESUME_SECTION_LABELS.strengths}
                    type="strength"
                    onClick={isEditing ? () => openEditModal('strength', idx) : onItemClick}
                  />
                ))}
              </div>
            ) : (
              <p className="resume-edit-section__empty">{EMPTY_MESSAGES.strengths}</p>
            )}
            {isEditing && (
              <button
                type="button"
                className="resume-edit-section__add-button"
                onClick={() => openAddModal('strength')}
              >
                + Add Strength
              </button>
            )}
          </div>

          {/* Weaknesses Section */}
          <div className="section">
            <strong>{RESUME_SECTION_LABELS.weaknesses}:</strong>
            {displayWeaknesses.length > 0 ? (
              <div className="skills-grid">
                {displayWeaknesses.map((item: ProfileItem, idx: number) => (
                  <ProfileItemCard
                    key={idx}
                    item={item}
                    index={idx}
                    section={RESUME_SECTION_LABELS.weaknesses}
                    type="weakness"
                    onClick={isEditing ? () => openEditModal('weakness', idx) : onItemClick}
                  />
                ))}
              </div>
            ) : (
              <p className="resume-edit-section__empty">{EMPTY_MESSAGES.weaknesses}</p>
            )}
            {isEditing && (
              <button
                type="button"
                className="resume-edit-section__add-button"
                onClick={() => openAddModal('weakness')}
              >
                + Add Weakness
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ResumeEditModal
        isOpen={modalState.isOpen}
        title={getModalTitle()}
        isAddMode={modalState.isAddMode}
        onClose={closeModal}
        onSave={closeModal}
        onDelete={modalState.isAddMode ? undefined : handleDelete}
      >
        {renderModalContent()}
      </ResumeEditModal>
    </>
  );
};
