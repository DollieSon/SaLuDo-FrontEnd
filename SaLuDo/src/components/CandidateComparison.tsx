import "./css/CandidateComparison.css";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { candidatesApi } from "../utils/api";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

interface CandidateComparisonData {
  candidate1: any;
  candidate2: any;
  comparison: {
    personalInfo: {
      ageComparison: {
        candidate1Age: number;
        candidate2Age: number;
        ageDifference: number;
      };
      experienceComparison: {
        candidate1Experience: number;
        candidate2Experience: number;
        experienceDifference: number;
      };
      certificationComparison: {
        candidate1Certification: number;
        candidate2Certification: number;
        certificationDifference: number;
      };
    };
    skills: {
      commonSkills: any[];
      uniqueToCandidate1: any[];
      uniqueToCandidate2: any[];
      skillScoreComparison: {
        skillName: string;
        candidate1Score: number;
        candidate2Score: number;
        scoreDifference: number;
      }[];
    };
    personality: {
      candidate1PersonalityScore: number;
      candidate2PersonalityScore: number;
      personalityDifference: number;
      categoryComparisons: {
        category: string;
        candidate1Score: number;
        candidate2Score: number;
        difference: number;
      }[];
    };
    overallComparison: {
      totalSkillsComparison: {
        candidate1Total: number;
        candidate2Total: number;
        difference: number;
      };
      averageSkillScoreComparison: {
        candidate1Average: number;
        candidate2Average: number;
        difference: number;
      };
      recommendedCandidate: "candidate1" | "candidate2" | "tie";
      recommendation: string;
    };
  };
}

const CandidateComparison: React.FC = () => {
  const { candidateId1, candidateId2 } = useParams<{
    candidateId1: string;
    candidateId2: string;
  }>();
  const navigate = useNavigate();

  const [comparisonData, setComparisonData] =
    useState<CandidateComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (candidateId1 && candidateId2) {
      fetchComparisonData();
    }
  }, [candidateId1, candidateId2]);

  const fetchComparisonData = async () => {
    if (!candidateId1 || !candidateId2) {
      setError("Invalid candidate IDs");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await candidatesApi.compareCandidates(
        candidateId1,
        candidateId2
      );

      if (response.success) {
        setComparisonData(response.data);
      } else {
        throw new Error("Failed to fetch comparison data");
      }
    } catch (err) {
      console.error("Error fetching comparison data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load comparison data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleViewProfile = (candidateId: string) => {
    navigate(`/profile/${candidateId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getScoreDifferenceColor = (difference: number) => {
    if (difference > 0) return "#10b981";
    if (difference < 0) return "#ef4444";
    return "#6b7280";
  };

  const getRecommendationBadgeStyle = (
    candidate: "candidate1" | "candidate2" | "tie",
    recommended: string
  ) => {
    if (candidate === recommended) {
      return { backgroundColor: "#10b981", color: "white" };
    }
    return { backgroundColor: "#f3f4f6", color: "#6b7280" };
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="candidate-comparison">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading candidate comparison...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !comparisonData) {
    return (
      <main className="candidate-comparison">
        <div className="error-container">
          <p className="error-message">
            {error || "Comparison data not found"}
          </p>
          <button onClick={handleGoBack} className="back-button">
            Go Back
          </button>
        </div>
      </main>
    );
  }

  // Prepare data for charts
  const personalityRadarData =
    comparisonData.comparison.personality.categoryComparisons.map((cat) => ({
      category: cat.category.replace(" & ", " &\n"),
      candidate1: cat.candidate1Score,
      candidate2: cat.candidate2Score,
    }));

  const skillScoreBarData =
    comparisonData.comparison.skills.skillScoreComparison
      .slice(0, 10) // Show top 10 common skills
      .map((skill) => ({
        skill:
          skill.skillName.length > 25
            ? skill.skillName.substring(0, 22) + "..."
            : skill.skillName,
        candidate1: skill.candidate1Score,
        candidate2: skill.candidate2Score,
      }));

  return (
    <main className="candidate-comparison">
      {/* Header */}
      <div className="comparison-header">
        <div className="back-navigation">
          <img
            src="/images/back.png"
            alt="Back"
            onClick={handleGoBack}
            className="back-icon"
          />
          <h2>Candidate Comparison</h2>
        </div>
        <div className="recommendation-banner">
          <div
            className={`recommendation-badge ${comparisonData.comparison.overallComparison.recommendedCandidate}`}
          >
            {comparisonData.comparison.overallComparison
              .recommendedCandidate === "tie"
              ? "Equal Match"
              : comparisonData.comparison.overallComparison
                  .recommendedCandidate === "candidate1"
              ? `${comparisonData.candidate1.name} Recommended`
              : `${comparisonData.candidate2.name} Recommended`}
          </div>
          <p className="recommendation-text">
            {comparisonData.comparison.overallComparison.recommendation}
          </p>
        </div>
      </div>

      {/* Candidate Info Cards */}
      <div className="candidates-overview">
        <div className="candidate-card">
          <div className="candidate-header">
            <h3>{comparisonData.candidate1.name}</h3>
            <button
              onClick={() =>
                handleViewProfile(comparisonData.candidate1.candidateId)
              }
              className="view-profile-btn"
            >
              View Profile
            </button>
          </div>
          <div className="candidate-details">
            <p>
              <strong>Email:</strong>{" "}
              {comparisonData.candidate1.email.join(", ")}
            </p>
            <p>
              <strong>Age:</strong>{" "}
              {
                comparisonData.comparison.personalInfo.ageComparison
                  .candidate1Age
              }{" "}
              years
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`status ${comparisonData.candidate1.status.toLowerCase()}`}
              >
                {comparisonData.candidate1.status}
              </span>
            </p>
            <p>
              <strong>Role Applied:</strong>{" "}
              {comparisonData.candidate1.roleApplied || "Not specified"}
            </p>
            <p>
              <strong>Date Created:</strong>{" "}
              {formatDate(comparisonData.candidate1.dateCreated)}
            </p>
          </div>
        </div>

        <div className="vs-divider">VS</div>

        <div className="candidate-card">
          <div className="candidate-header">
            <h3>{comparisonData.candidate2.name}</h3>
            <button
              onClick={() =>
                handleViewProfile(comparisonData.candidate2.candidateId)
              }
              className="view-profile-btn"
            >
              View Profile
            </button>
          </div>
          <div className="candidate-details">
            <p>
              <strong>Email:</strong>{" "}
              {comparisonData.candidate2.email.join(", ")}
            </p>
            <p>
              <strong>Age:</strong>{" "}
              {
                comparisonData.comparison.personalInfo.ageComparison
                  .candidate2Age
              }{" "}
              years
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`status ${comparisonData.candidate2.status.toLowerCase()}`}
              >
                {comparisonData.candidate2.status}
              </span>
            </p>
            <p>
              <strong>Role Applied:</strong>{" "}
              {comparisonData.candidate2.roleApplied || "Not specified"}
            </p>
            <p>
              <strong>Date Created:</strong>{" "}
              {formatDate(comparisonData.candidate2.dateCreated)}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Metrics */}
      <div className="comparison-metrics">
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Skills Count</h4>
            <div className="metric-comparison">
              <div className="candidate-metric">
                <span className="candidate-name">
                  {comparisonData.candidate1.name}
                </span>
                <span className="metric-value">
                  {
                    comparisonData.comparison.overallComparison
                      .totalSkillsComparison.candidate1Total
                  }
                </span>
              </div>
              <div className="candidate-metric">
                <span className="candidate-name">
                  {comparisonData.candidate2.name}
                </span>
                <span className="metric-value">
                  {
                    comparisonData.comparison.overallComparison
                      .totalSkillsComparison.candidate2Total
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <h4>Average Skill Score</h4>
            <div className="metric-comparison">
              <div className="candidate-metric">
                <span className="candidate-name">
                  {comparisonData.candidate1.name}
                </span>
                <span className="metric-value">
                  {
                    comparisonData.comparison.overallComparison
                      .averageSkillScoreComparison.candidate1Average
                  }
                  /10
                </span>
              </div>
              <div className="candidate-metric">
                <span className="candidate-name">
                  {comparisonData.candidate2.name}
                </span>
                <span className="metric-value">
                  {
                    comparisonData.comparison.overallComparison
                      .averageSkillScoreComparison.candidate2Average
                  }
                  /10
                </span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <h4>Experience Count</h4>
            <div className="metric-comparison">
              <div className="candidate-metric">
                <span className="candidate-name">
                  {comparisonData.candidate1.name}
                </span>
                <span className="metric-value">
                  {
                    comparisonData.comparison.personalInfo.experienceComparison
                      .candidate1Experience
                  }
                </span>
              </div>
              <div className="candidate-metric">
                <span className="candidate-name">
                  {comparisonData.candidate2.name}
                </span>
                <span className="metric-value">
                  {
                    comparisonData.comparison.personalInfo.experienceComparison
                      .candidate2Experience
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <h4>Certification Count</h4>
            <div className="metric-comparison">
              <div className="candidate-metric">
                <span className="candidate-name">
                  {comparisonData.candidate1.name}
                </span>
                <span className="metric-value">
                  {
                    comparisonData.comparison.personalInfo
                      .certificationComparison.candidate1Certification
                  }
                </span>
              </div>
              <div className="candidate-metric">
                <span className="candidate-name">
                  {comparisonData.candidate2.name}
                </span>
                <span className="metric-value">
                  {
                    comparisonData.comparison.personalInfo
                      .certificationComparison.candidate2Certification
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <h4>Personality Score</h4>
            <div className="metric-comparison">
              <div className="candidate-metric">
                <span className="candidate-name">
                  {comparisonData.candidate1.name}
                </span>
                <span className="metric-value">
                  {
                    comparisonData.comparison.personality
                      .candidate1PersonalityScore
                  }
                  /10
                </span>
              </div>
              <div className="candidate-metric">
                <span className="candidate-name">
                  {comparisonData.candidate2.name}
                </span>
                <span className="metric-value">
                  {
                    comparisonData.comparison.personality
                      .candidate2PersonalityScore
                  }
                  /10
                </span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <h4>Common Skills</h4>
            <div className="metric-value single">
              {comparisonData.comparison.skills.commonSkills.length}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Personality Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={personalityRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar
                name={comparisonData.candidate1.name}
                dataKey="candidate1"
                stroke="#E30022"
                fill="#E30022"
                fillOpacity={0.6}
              />
              <Radar
                name={comparisonData.candidate2.name}
                dataKey="candidate2"
                stroke="#007bff"
                fill="#007bff"
                fillOpacity={0.6}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {skillScoreBarData.length > 0 && (
          <div className="chart-container">
            <h3>Common Skills Comparison</h3>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={skillScoreBarData} margin={{ bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="skill"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="candidate1"
                  fill="#E30022"
                  name={comparisonData.candidate1.name}
                />
                <Bar
                  dataKey="candidate2"
                  fill="#007bff"
                  name={comparisonData.candidate2.name}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Skills Analysis */}
      <div className="skills-analysis">
        <div className="skills-section">
          <h3>Skills Analysis</h3>
          <div className="skills-grid">
            <div className="skills-category">
              <h4>
                Common Skills (
                {comparisonData.comparison.skills.commonSkills.length})
              </h4>
              <div className="skills-list">
                {comparisonData.comparison.skills.commonSkills.length > 0 ? (
                  comparisonData.comparison.skills.commonSkills
                    .slice(0, 10)
                    .map((skill: any, idx: number) => (
                      <div key={idx} className="skill-item common">
                        <span className="skill-name">
                          {skill.skillName || skill.skillId}
                        </span>
                        <span className="skill-evidence">{skill.evidence}</span>
                      </div>
                    ))
                ) : (
                  <p className="no-skills">No common skills found</p>
                )}
              </div>
            </div>

            <div className="skills-category">
              <h4>
                {comparisonData.candidate1.name} Unique Skills (
                {comparisonData.comparison.skills.uniqueToCandidate1.length})
              </h4>
              <div className="skills-list">
                {comparisonData.comparison.skills.uniqueToCandidate1.length >
                0 ? (
                  comparisonData.comparison.skills.uniqueToCandidate1
                    .slice(0, 10)
                    .map((skill: any, idx: number) => (
                      <div key={idx} className="skill-item unique-1">
                        <span className="skill-name">
                          {skill.skillName || skill.skillId}
                        </span>
                        <span className="skill-score">{skill.score}/10</span>
                      </div>
                    ))
                ) : (
                  <p className="no-skills">No unique skills found</p>
                )}
              </div>
            </div>

            <div className="skills-category">
              <h4>
                {comparisonData.candidate2.name} Unique Skills (
                {comparisonData.comparison.skills.uniqueToCandidate2.length})
              </h4>
              <div className="skills-list">
                {comparisonData.comparison.skills.uniqueToCandidate2.length >
                0 ? (
                  comparisonData.comparison.skills.uniqueToCandidate2
                    .slice(0, 10)
                    .map((skill: any, idx: number) => (
                      <div key={idx} className="skill-item unique-2">
                        <span className="skill-name">
                          {skill.skillName || skill.skillId}
                        </span>
                        <span className="skill-score">{skill.score}/10</span>
                      </div>
                    ))
                ) : (
                  <p className="no-skills">No unique skills found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CandidateComparison;
