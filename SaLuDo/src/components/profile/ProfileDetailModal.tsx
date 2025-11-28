import React from "react";
import { ProfileItem } from "../../types/profile";

interface ProfileDetailModalProps {
  selectedItem: {
    data: ProfileItem;
    section: string;
    type: 'skill' | 'experience' | 'education' | 'certification' | 'strength' | 'weakness';
  } | null;
  onClose: () => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  selectedItem,
  onClose
}) => {
  if (!selectedItem) return null;

  const { data, section, type } = selectedItem;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: '0', fontSize: '24px', color: '#1f2937' }}>
            {section} Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <h3 style={{ margin: '0', fontSize: '20px', color: '#1f2937' }}>
              {data.skillName || data.title || data.institution || data.name || 'Item'}
            </h3>
            <span style={{
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: data.addedBy === 'AI' ? '#3b82f6' : '#10b981',
              color: 'white'
            }}>
              {data.addedBy === 'AI' ? 'AI Generated' : 'Human Added'}
            </span>
          </div>

          {type === 'skill' && data.score && (
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Proficiency Score:{' '}
              </span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                {data.score}/10
              </span>
            </div>
          )}

          {type === 'experience' && (
            <>
              {data.role && (
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4b5563' }}>
                  <strong>Role:</strong> {data.role}
                </p>
              )}
              {data.title && (
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4b5563' }}>
                  <strong>Company:</strong> {data.title}
                </p>
              )}
            </>
          )}

          {type === 'education' && data.institution && (
            <p style={{ margin: '8px 0', fontSize: '16px', color: '#4b5563' }}>
              <strong>Institution:</strong> {data.institution}
            </p>
          )}

          {type === 'certification' && (
            <>
              {data.issuingOrganization && (
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4b5563' }}>
                  <strong>Issued by:</strong> {data.issuingOrganization}
                </p>
              )}
              {data.issueDate && (
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4b5563' }}>
                  <strong>Issue Date:</strong> {new Date(data.issueDate).toLocaleDateString()}
                </p>
              )}
            </>
          )}

          {(data.startDate || data.endDate) && (
            <p style={{ margin: '8px 0', fontSize: '16px', color: '#4b5563' }}>
              <strong>Duration:</strong>{' '}
              {data.startDate && new Date(data.startDate).toLocaleDateString()}
              {' - '}
              {data.endDate ? new Date(data.endDate).toLocaleDateString() : 'Present'}
            </p>
          )}
        </div>

        {data.evidence && (
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            marginTop: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#374151', fontWeight: '600' }}>
              {data.addedBy === 'AI' ? 'AI Analysis' : 'Description'}
            </h4>
            <p style={{ margin: '0', color: '#4b5563', lineHeight: '1.6', fontSize: '14px' }}>
              {data.evidence}
            </p>
          </div>
        )}

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
