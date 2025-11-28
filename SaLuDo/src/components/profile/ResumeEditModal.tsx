import React, { useEffect } from "react";
import "./css/ResumeEditModal.css";

interface ResumeEditModalProps {
  isOpen: boolean;
  title: string;
  isAddMode?: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
}

export const ResumeEditModal: React.FC<ResumeEditModalProps> = ({
  isOpen,
  title,
  isAddMode = false,
  onClose,
  onSave,
  onDelete,
  children
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="resume-edit-modal-overlay" onClick={handleOverlayClick}>
      <div className="resume-edit-modal">
        <div className="resume-edit-modal__header">
          <h2 className="resume-edit-modal__title">{title}</h2>
          <button
            className="resume-edit-modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {isAddMode && (
          <div className="resume-edit-modal__add-mode">
            <p className="resume-edit-modal__add-mode-text">
              Adding new {title.toLowerCase()}
            </p>
          </div>
        )}

        <div className="resume-edit-modal__body">
          {children}
        </div>

        <div className="resume-edit-modal__footer">
          <button
            type="button"
            className="resume-edit-modal__button resume-edit-modal__button--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          {!isAddMode && onDelete && (
            <button
              type="button"
              className="resume-edit-modal__button resume-edit-modal__button--delete"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this item?')) {
                  onDelete();
                  onClose();
                }
              }}
            >
              Delete
            </button>
          )}
          <button
            type="button"
            className="resume-edit-modal__button resume-edit-modal__button--save"
            onClick={() => {
              onSave();
              onClose();
            }}
          >
            {isAddMode ? 'Add' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
