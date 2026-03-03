import React, { useState, useEffect, useRef } from "react";
import { EditableSkill } from "./resumeEditTypes";
import { SKILL_SCORE } from "./resumeEditConstants";
import { skillsApi } from "../../utils/api";
import "./css/ResumeEditModal.css";

interface SkillEditFormProps {
  skill: EditableSkill;
  index: number;
  onChange: (index: number, field: keyof EditableSkill, value: any) => void;
}

interface SkillSuggestion {
  skillId: string;
  skillName: string;
  isAccepted: boolean;
}

export const SkillEditForm: React.FC<SkillEditFormProps> = ({
  skill,
  index,
  onChange
}) => {
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSkillNameChange = async (value: string) => {
    onChange(index, 'skillName', value);

    if (value.trim().length >= 2) {
      setIsSearching(true);
      try {
        const response = await skillsApi.searchSkills(value);
        console.log('Search response:', response);
        
        // API returns { success: true, data: [...] }
        if (response.success && response.data && Array.isArray(response.data)) {
          setSuggestions(response.data);
          setShowSuggestions(response.data.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Failed to search skills:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SkillSuggestion) => {
    onChange(index, 'skillName', suggestion.skillName);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <>
      <div className="resume-edit-modal__field">
        <label className="resume-edit-modal__label">Skill Name *</label>
        <div className="autocomplete-container">
          <input
            ref={inputRef}
            type="text"
            className="resume-edit-modal__input"
            value={skill.skillName}
            onChange={(e) => handleSkillNameChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="e.g., JavaScript, Project Management"
            autoComplete="off"
          />
          {isSearching && (
            <div className="autocomplete-loading">Searching...</div>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} className="autocomplete-suggestions">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.skillId}
                  className="autocomplete-suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="suggestion-name">{suggestion.skillName}</span>
                  {suggestion.isAccepted && (
                    <span className="suggestion-badge">Verified</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
