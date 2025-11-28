import React from "react";
import { ProfileItem } from "../../types/profile";
import { ProfileItemCard } from "./ProfileItemCard";

interface ResumeParsedSectionProps {
  skills: ProfileItem[];
  experience: ProfileItem[];
  education: ProfileItem[];
  certification: ProfileItem[];
  strength: ProfileItem[];
  weaknesses: ProfileItem[];
  isEditing: boolean;
  onEditToggle: () => void;
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
  onEditToggle,
  onItemClick
}) => {
  return (
    <div className="parsed-section">
      <div className="box-header">
        <h3>Resume Parsed Information</h3>
        <button className="edit-btn" onClick={onEditToggle}>
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>
      <div className="box-content">
        <div className="section">
          <strong>Skills:</strong>
          {skills.length > 0 ? (
            <div className="skills-grid">
              {skills.map((item: ProfileItem, idx: number) => (
                <ProfileItemCard
                  key={idx}
                  item={item}
                  index={idx}
                  section="Skills"
                  type="skill"
                  onClick={onItemClick}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: "#6b7280", fontStyle: "italic" }}>
              No skills data available
            </p>
          )}
        </div>

        <div className="section">
          <strong>Experience:</strong>
          {experience.length > 0 ? (
            <div className="skills-grid">
              {experience.map((item: ProfileItem, idx: number) => (
                <ProfileItemCard
                  key={idx}
                  item={item}
                  index={idx}
                  section="Experience"
                  type="experience"
                  onClick={onItemClick}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: "#6b7280", fontStyle: "italic" }}>
              No experience data available
            </p>
          )}
        </div>

        <div className="section">
          <strong>Education:</strong>
          {education.length > 0 ? (
            <div className="skills-grid">
              {education.map((item: ProfileItem, idx: number) => (
                <ProfileItemCard
                  key={idx}
                  item={item}
                  index={idx}
                  section="Education"
                  type="education"
                  onClick={onItemClick}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: "#6b7280", fontStyle: "italic" }}>
              No education data available
            </p>
          )}
        </div>

        <div className="section">
          <strong>Certification:</strong>
          {certification.length > 0 ? (
            <div className="skills-grid">
              {certification.map((item: ProfileItem, idx: number) => (
                <ProfileItemCard
                  key={idx}
                  item={item}
                  index={idx}
                  section="Certification"
                  type="certification"
                  onClick={onItemClick}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: "#6b7280", fontStyle: "italic" }}>
              No certification data available
            </p>
          )}
        </div>

        <div className="section">
          <strong>Strength:</strong>
          {strength.length > 0 ? (
            <div className="skills-grid">
              {strength.map((item: ProfileItem, idx: number) => (
                <ProfileItemCard
                  key={idx}
                  item={item}
                  index={idx}
                  section="Strength"
                  type="strength"
                  onClick={onItemClick}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: "#6b7280", fontStyle: "italic" }}>
              No strengths data available
            </p>
          )}
        </div>

        <div className="section">
          <strong>Weaknesses:</strong>
          {weaknesses.length > 0 ? (
            <div className="skills-grid">
              {weaknesses.map((item: ProfileItem, idx: number) => (
                <ProfileItemCard
                  key={idx}
                  item={item}
                  index={idx}
                  section="Weakness"
                  type="weakness"
                  onClick={onItemClick}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: "#6b7280", fontStyle: "italic" }}>
              No weaknesses data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
