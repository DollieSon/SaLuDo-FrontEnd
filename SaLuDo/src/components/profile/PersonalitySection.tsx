import React, { useState } from "react";
import { PersonalityData, PersonalityTrait } from "../../types/profile";
import { PersonalityRadarChart } from "./PersonalityRadarChart";

interface PersonalitySectionProps {
  personality: PersonalityData | null;
  radarData: PersonalityTrait[];
  isEditing: boolean;
  onEditToggle: () => void;
}

export const PersonalitySection: React.FC<PersonalitySectionProps> = ({
  personality,
  radarData,
  isEditing,
  onEditToggle
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  return (
    <div className="parsed-section">
      <div className="box-header">
        <h3>Interview Transcript Information</h3>
        <button className="edit-btn" onClick={onEditToggle}>
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>
      <div className="radar-content">
        <PersonalityRadarChart data={radarData} />

        <div className="section">
          <strong>Personality Trait Evidence:</strong>
          {personality ? (
            <div className="personality-categories">
              {personality.cognitiveAndProblemSolving &&
                Object.keys(personality.cognitiveAndProblemSolving).some(
                  (key) =>
                    personality.cognitiveAndProblemSolving?.[key]?.evidence
                ) && (
                  <div className="personality-category">
                    <h4
                      className="category-title"
                      onClick={() => toggleCategory("cognitive")}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="toggle-icon">
                        {collapsedCategories["cognitive"] ? "▶" : "▼"}
                      </span>
                      Cognitive & Problem-Solving
                    </h4>
                    {!collapsedCategories["cognitive"] && (
                      <div className="subcategories">
                        {Object.entries(
                          personality.cognitiveAndProblemSolving
                        ).map(
                          ([key, trait]: [string, any]) =>
                            trait.evidence && (
                              <div key={key} className="subcategory">
                                <h5 className="subcategory-title">
                                  {trait.traitName || key}
                                </h5>
                                <div className="trait-evidence-card">
                                  <p className="evidence-text">
                                    {trait.evidence}
                                  </p>
                                  {trait.score > 0 && (
                                    <div className="evidence-score">
                                      <span className="score-badge">
                                        {trait.score}/10
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                )}

              {personality.communicationAndTeamwork &&
                Object.keys(personality.communicationAndTeamwork).some(
                  (key) =>
                    personality.communicationAndTeamwork?.[key]?.evidence
                ) && (
                  <div className="personality-category">
                    <h4
                      className="category-title"
                      onClick={() => toggleCategory("communication")}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="toggle-icon">
                        {collapsedCategories["communication"] ? "▶" : "▼"}
                      </span>
                      Communication & Teamwork
                    </h4>
                    {!collapsedCategories["communication"] && (
                      <div className="subcategories">
                        {Object.entries(
                          personality.communicationAndTeamwork
                        ).map(
                          ([key, trait]: [string, any]) =>
                            trait.evidence && (
                              <div key={key} className="subcategory">
                                <h5 className="subcategory-title">
                                  {trait.traitName || key}
                                </h5>
                                <div className="trait-evidence-card">
                                  <p className="evidence-text">
                                    {trait.evidence}
                                  </p>
                                  {trait.score > 0 && (
                                    <div className="evidence-score">
                                      <span className="score-badge">
                                        {trait.score}/10
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                )}

              {personality.workEthicAndReliability &&
                Object.keys(personality.workEthicAndReliability).some(
                  (key) =>
                    personality.workEthicAndReliability?.[key]?.evidence
                ) && (
                  <div className="personality-category">
                    <h4
                      className="category-title"
                      onClick={() => toggleCategory("workEthic")}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="toggle-icon">
                        {collapsedCategories["workEthic"] ? "▶" : "▼"}
                      </span>
                      Work Ethic & Reliability
                    </h4>
                    {!collapsedCategories["workEthic"] && (
                      <div className="subcategories">
                        {Object.entries(
                          personality.workEthicAndReliability
                        ).map(
                          ([key, trait]: [string, any]) =>
                            trait.evidence && (
                              <div key={key} className="subcategory">
                                <h5 className="subcategory-title">
                                  {trait.traitName || key}
                                </h5>
                                <div className="trait-evidence-card">
                                  <p className="evidence-text">
                                    {trait.evidence}
                                  </p>
                                  {trait.score > 0 && (
                                    <div className="evidence-score">
                                      <span className="score-badge">
                                        {trait.score}/10
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                )}

              {personality.growthAndLeadership &&
                Object.keys(personality.growthAndLeadership).some(
                  (key) => personality.growthAndLeadership?.[key]?.evidence
                ) && (
                  <div className="personality-category">
                    <h4
                      className="category-title"
                      onClick={() => toggleCategory("growth")}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="toggle-icon">
                        {collapsedCategories["growth"] ? "▶" : "▼"}
                      </span>
                      Growth & Leadership
                    </h4>
                    {!collapsedCategories["growth"] && (
                      <div className="subcategories">
                        {Object.entries(
                          personality.growthAndLeadership
                        ).map(
                          ([key, trait]: [string, any]) =>
                            trait.evidence && (
                              <div key={key} className="subcategory">
                                <h5 className="subcategory-title">
                                  {trait.traitName || key}
                                </h5>
                                <div className="trait-evidence-card">
                                  <p className="evidence-text">
                                    {trait.evidence}
                                  </p>
                                  {trait.score > 0 && (
                                    <div className="evidence-score">
                                      <span className="score-badge">
                                        {trait.score}/10
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                )}

              {personality.cultureAndPersonalityFit &&
                Object.keys(personality.cultureAndPersonalityFit).some(
                  (key) =>
                    personality.cultureAndPersonalityFit?.[key]?.evidence
                ) && (
                  <div className="personality-category">
                    <h4
                      className="category-title"
                      onClick={() => toggleCategory("culture")}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="toggle-icon">
                        {collapsedCategories["culture"] ? "▶" : "▼"}
                      </span>
                      Culture & Personality Fit
                    </h4>
                    {!collapsedCategories["culture"] && (
                      <div className="subcategories">
                        {Object.entries(
                          personality.cultureAndPersonalityFit
                        ).map(
                          ([key, trait]: [string, any]) =>
                            trait.evidence && (
                              <div key={key} className="subcategory">
                                <h5 className="subcategory-title">
                                  {trait.traitName || key}
                                </h5>
                                <div className="trait-evidence-card">
                                  <p className="evidence-text">
                                    {trait.evidence}
                                  </p>
                                  {trait.score > 0 && (
                                    <div className="evidence-score">
                                      <span className="score-badge">
                                        {trait.score}/10
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                )}

              {personality.bonusTraits &&
                Object.keys(personality.bonusTraits).some(
                  (key) => personality.bonusTraits?.[key]?.evidence
                ) && (
                  <div className="personality-category">
                    <h4
                      className="category-title"
                      onClick={() => toggleCategory("bonus")}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="toggle-icon">
                        {collapsedCategories["bonus"] ? "▶" : "▼"}
                      </span>
                      Bonus Traits
                    </h4>
                    {!collapsedCategories["bonus"] && (
                      <div className="subcategories">
                        {Object.entries(personality.bonusTraits).map(
                          ([key, trait]: [string, any]) =>
                            trait.evidence && (
                              <div key={key} className="subcategory">
                                <h5 className="subcategory-title">
                                  {trait.traitName || key}
                                </h5>
                                <div className="trait-evidence-card">
                                  <p className="evidence-text">
                                    {trait.evidence}
                                  </p>
                                  {trait.score > 0 && (
                                    <div className="evidence-score">
                                      <span className="score-badge">
                                        {trait.score}/10
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                )}
            </div>
          ) : (
            <p style={{ color: "#6b7280", fontStyle: "italic" }}>
              No personality trait evidence available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
