import React from "react";
import { ProfileItem } from "../../types/profile";

interface ProfileItemCardProps {
  item: ProfileItem;
  index: number;
  section: string;
  type: 'skill' | 'experience' | 'education' | 'certification' | 'strength' | 'weakness';
  onClick: (item: ProfileItem, section: string, type: 'skill' | 'experience' | 'education' | 'certification' | 'strength' | 'weakness') => void;
}

export const ProfileItemCard: React.FC<ProfileItemCardProps> = ({
  item,
  section,
  type,
  onClick
}) => {
  const isAICreated = item.addedBy === 'AI';

  const getDisplayName = () => {
    switch (type) {
      case 'skill':
        return item.skillName || item.text;
      case 'experience':
        return item.title || item.skillName || "Experience";
      case 'education':
        return item.institution || item.skillName || "Education";
      case 'certification':
        return item.name || item.skillName || "Certification";
      case 'strength':
      case 'weakness':
        return item.skillName || type.charAt(0).toUpperCase() + type.slice(1);
      default:
        return item.skillName || item.text;
    }
  };

  const getSubtitle = () => {
    if (type === 'experience' && item.role) {
      return item.role;
    }
    if (type === 'certification' && item.issuingOrganization) {
      return item.issuingOrganization;
    }
    return null;
  };

  return (
    <div
      className="skill-card"
      style={{
        backgroundColor: isAICreated ? '#eff6ff' : '#f0fdf4',
        border: isAICreated ? '1px solid #bfdbfe' : '1px solid #bbf7d0',
        cursor: 'pointer'
      }}
      onClick={() => onClick(item, section, type)}
    >
      <div className="skill-content">
        <div className="skill-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="skill-name">
              {getDisplayName()}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: isAICreated ? '#3b82f6' : '#10b981',
              color: 'white'
            }}>
              {isAICreated ? 'AI' : 'Human'}
            </span>
          </div>

          {getSubtitle() && (
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>
              {getSubtitle()}
            </p>
          )}

          {item.score && (
            <div className="skill-score">
              <span className="score-label">{type === 'skill' ? 'Score:' : 'Rating:'}</span>
              <span className="score-value">{item.score}/10</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
