import "./css/Profile.css";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { candidatesApi, skillsApi } from "../utils/api";
import Comments from "./Comments";
import { CommentEntityType } from "../types/comment";
import {
  CandidateProfile,
  PersonalityData,
  ProfileItem,
  PersonalityTrait,
} from "../types/profile";

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [personality, setPersonality] = useState<PersonalityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editedStatus, setEditedStatus] = useState<string>("");
  const [uploadingTranscript, setUploadingTranscript] = useState(false);
  const [uploadingInterviewVideo, setUploadingInterviewVideo] = useState(false);
  const [uploadingIntroductionVideo, setUploadingIntroductionVideo] =
    useState(false);
  const [expandedIndex, setExpandedIndex] = useState<{ section: string; index: number } | null>(null);

  const toggleExpand = (section: string, index: number) => {
    if (expandedIndex && expandedIndex.section === section && expandedIndex.index === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex({ section, index });
    }
  };

  // State for collapsible personality categories
  const [collapsedCategories, setCollapsedCategories] = useState<{
    [key: string]: boolean;
  }>({});

  // Helper function to toggle category collapse
  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  // Data fetching functions
  const fetchCandidateData = async () => {
    if (!id) {
      setError("No candidate ID provided");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch candidate data
      const candidateResponse = await candidatesApi.getCandidateById(id);
      console.log("🔍 Candidate API Response:", candidateResponse);

      if (candidateResponse.success) {
        let candidateData = candidateResponse.data;
        console.log("📊 Raw Candidate Data:", candidateData);
        console.log(
          "🎯 Candidate Skills (before enrichment):",
          candidateData.skills
        );

        // Enrich skills with proper names from SkillMaster database
        if (candidateData.skills && candidateData.skills.length > 0) {
          candidateData = await enrichSkillsWithNames(candidateData);
          console.log(
            "✨ Candidate Skills (after enrichment):",
            candidateData.skills
          );
        }

        setCandidate(candidateData);
        setEditedStatus(candidateData.status); // Initialize edited status
      } else {
        console.error("❌ Failed to fetch candidate data:", candidateResponse);
        throw new Error("Failed to fetch candidate data");
      }

      // Fetch personality data (optional)
      try {
        const personalityResponse = await candidatesApi.getCandidatePersonality(
          id
        );
        console.log("🧠 Personality API Response:", personalityResponse);

        if (personalityResponse.success) {
          console.log("🎭 Personality Data:", personalityResponse.data);
          setPersonality(personalityResponse.data);
        }
      } catch (personalityError) {
        console.log("⚠️ Personality data not available:", personalityError);
        // Don't fail the whole component if personality data is missing
      }
    } catch (err) {
      console.error("Error fetching candidate data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load candidate profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Enrich skills with proper names from SkillMaster database
  const enrichSkillsWithNames = async (
    candidateData: CandidateProfile
  ): Promise<CandidateProfile> => {
    try {
      // Get all master skills to use for name resolution
      const skillResponse = await skillsApi.getAllMasterSkills();
      console.log("🎨 SkillMaster API Response:", skillResponse);

      let masterSkills: any[] = [];

      if (skillResponse.success && skillResponse.data) {
        masterSkills = skillResponse.data;
        console.log("🎯 Master Skills Data:", masterSkills);
        console.log("🔢 Total Master Skills Found:", masterSkills.length);
      }

      // Enrich each skill with the proper name from SkillMaster
      const enrichedSkills = candidateData.skills.map(
        (skill: any, index: number) => {
          console.log(`🔍 Processing skill ${index + 1}:`, skill);

          if (
            skill.skillId &&
            (!skill.skillName || skill.skillName === skill.skillId)
          ) {
            // Try to find the skill in master skills
            const masterSkill = masterSkills.find(
              (ms: any) =>
                ms.skillId === skill.skillId || ms._id === skill.skillId
            );

            if (masterSkill) {
              console.log(
                `✅ Found master skill for ${skill.skillId}:`,
                masterSkill
              );
              return {
                ...skill,
                skillName: masterSkill.skillName,
                isAccepted: masterSkill.isAccepted,
              };
            } else {
              // Fallback: create a readable name from skillId
              const readableName = skill.skillId
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str: string) => str.toUpperCase())
                .trim();
              console.warn(
                `⚠️ Could not find skill name for ID: ${skill.skillId}, using fallback: ${readableName}`
              );
              return {
                ...skill,
                skillName: readableName,
              };
            }
          }
          console.log(`✨ Skill already has name, keeping as-is:`, skill);
          return skill; // Return as-is if skillName already exists and is different from skillId
        }
      );

      console.log("🎉 Final enriched skills:", enrichedSkills);

      return {
        ...candidateData,
        skills: enrichedSkills,
      };
    } catch (err) {
      console.error("💥 Error enriching skills with names:", err);
      // Fallback: ensure all skills have at least a readable name
      const fallbackSkills = candidateData.skills.map((skill: any) => {
        if (!skill.skillName && skill.skillId) {
          const readableName = skill.skillId
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str: string) => str.toUpperCase())
            .trim();
          return {
            ...skill,
            skillName: readableName,
          };
        }
        return skill;
      });

      console.log("🔄 Using fallback skills:", fallbackSkills);

      return {
        ...candidateData,
        skills: fallbackSkills,
      };
    }
  };

  useEffect(() => {
    fetchCandidateData();
  }, [id]);

  // Data transformation functions
  const transformToProfileItems = (
    items: any[],
    textField: string = "description"
  ): ProfileItem[] => {
    if (!items || !Array.isArray(items)) {
      return [];
    }

    return items
      .filter((item) => item) // Filter out null/undefined items
      .map((item) => ({
        text:
          item[textField] ||
          item.skillName ||
          item.evidence ||
          item.certificationName ||
          item.description ||
          "No description available",
        score: item.score || undefined,
        skillName:
          item.skillName ||
          item.name ||
          item.certificationName ||
          item.institution ||
          item.company ||
          item.title ||
          undefined,
        evidence: item.evidence || item.description || undefined,
      }));
  };

  const createRadarData = (personalityData: any): PersonalityTrait[] => {
    if (!personalityData) {
      // Return mock data as fallback
      return [
        {
          trait: "Cognitive & Problem-Solving",
          value: 7.5,
          breakdown: [
            { sub: "Analytical Thinking", score: 7.5 },
            { sub: "Problem Solving", score: 8.0 },
            { sub: "Critical Thinking", score: 7.0 },
          ],
        },
        {
          trait: "Communication & Teamwork",
          value: 8.0,
          breakdown: [
            { sub: "Communication", score: 8.2 },
            { sub: "Teamwork", score: 7.8 },
            { sub: "Leadership", score: 8.0 },
          ],
        },
      ];
    }

    // Transform backend personality data structure to radar chart format
    const radarData: PersonalityTrait[] = [];

    if (personalityData.cognitiveAndProblemSolving) {
      const category = personalityData.cognitiveAndProblemSolving;
      const breakdown = Object.keys(category).map((key) => ({
        sub: category[key].traitName || key,
        score: category[key].score || 0,
      }));
      const avgScore =
        breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;

      radarData.push({
        trait: "Cognitive & Problem-Solving",
        value: avgScore,
        breakdown,
      });
    }

    if (personalityData.communicationAndTeamwork) {
      const category = personalityData.communicationAndTeamwork;
      const breakdown = Object.keys(category).map((key) => ({
        sub: category[key].traitName || key,
        score: category[key].score || 0,
      }));
      const avgScore =
        breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;

      radarData.push({
        trait: "Communication & Teamwork",
        value: avgScore,
        breakdown,
      });
    }

    if (personalityData.workEthicAndReliability) {
      const category = personalityData.workEthicAndReliability;
      const breakdown = Object.keys(category).map((key) => ({
        sub: category[key].traitName || key,
        score: category[key].score || 0,
      }));
      const avgScore =
        breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;

      radarData.push({
        trait: "Work Ethic & Reliability",
        value: avgScore,
        breakdown,
      });
    }

    if (personalityData.growthAndLeadership) {
      const category = personalityData.growthAndLeadership;
      const breakdown = Object.keys(category).map((key) => ({
        sub: category[key].traitName || key,
        score: category[key].score || 0,
      }));
      const avgScore =
        breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;

      radarData.push({
        trait: "Growth & Leadership",
        value: avgScore,
        breakdown,
      });
    }

    if (personalityData.cultureAndPersonalityFit) {
      const category = personalityData.cultureAndPersonalityFit;
      const breakdown = Object.keys(category).map((key) => ({
        sub: category[key].traitName || key,
        score: category[key].score || 0,
      }));
      const avgScore =
        breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;

      radarData.push({
        trait: "Culture & Personality Fit",
        value: avgScore,
        breakdown,
      });
    }

    if (personalityData.bonusTraits) {
      const category = personalityData.bonusTraits;
      const breakdown = Object.keys(category).map((key) => ({
        sub: category[key].traitName || key,
        score: category[key].score || 0,
      }));
      const avgScore =
        breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;

      radarData.push({
        trait: "Bonus Traits",
        value: avgScore,
        breakdown,
      });
    }

    return radarData.length > 0
      ? radarData
      : [
          {
            trait: "No Data Available",
            value: 0,
            breakdown: [{ sub: "No traits found", score: 0 }],
          },
        ];
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFileDownloadUrl = (fileId: string) => {
    return candidatesApi.getFileDownloadUrl(fileId);
  };

  const getTranscriptDownloadUrl = (fileId: string) => {
    return candidatesApi.getTranscriptDownloadUrl(fileId);
  };

  const getInterviewVideoDownloadUrl = (fileId: string) => {
    return `http://localhost:3000/api/candidates/${id}/videos/interview/${fileId}/download`;
  };

  const getIntroductionVideoDownloadUrl = (fileId: string) => {
    return `http://localhost:3000/api/candidates/${id}/videos/introduction/${fileId}/download`;
  };

  const handleDownload = (
    filename: string,
    type: "resume" | "transcript" | "interview-video" | "introduction-video"
  ) => {
    console.log(`Downloading ${type}: ${filename}`);
    setToastMessage(`Downloading ${filename}...`);

    // Hide toast after 3 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;

    try {
      await candidatesApi.updateCandidate(id, { status: newStatus });
      setCandidate((prev: CandidateProfile | null) =>
        prev ? { ...prev, status: newStatus } : null
      );
      setToastMessage(`Status updated to ${newStatus}`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error updating status:", error);
      setToastMessage("Failed to update status");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleTranscriptUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    setUploadingTranscript(true);

    try {
      const formData = new FormData();
      formData.append("transcript", file);

      await candidatesApi.uploadTranscript(id, formData);
      setToastMessage("Transcript uploaded successfully");

      // Refresh candidate data to show new transcript
      await fetchCandidateData();

      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error uploading transcript:", error);
      setToastMessage("Failed to upload transcript");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setUploadingTranscript(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleInterviewVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    setUploadingInterviewVideo(true);

    try {
      const formData = new FormData();
      formData.append("video", file);

      await candidatesApi.uploadInterviewVideo(id, formData);
      setToastMessage("Interview video uploaded successfully");

      // Refresh candidate data to show new video
      await fetchCandidateData();

      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error uploading interview video:", error);
      setToastMessage("Failed to upload interview video");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setUploadingInterviewVideo(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleIntroductionVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    setUploadingIntroductionVideo(true);

    try {
      const formData = new FormData();
      formData.append("video", file);

      await candidatesApi.uploadIntroductionVideo(id, formData);
      setToastMessage("Introduction video uploaded successfully");

      // Refresh candidate data to show new video
      await fetchCandidateData();

      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error uploading introduction video:", error);
      setToastMessage("Failed to upload introduction video");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setUploadingIntroductionVideo(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleEditToggle = async () => {
    if (isEditing && editedStatus && editedStatus !== candidate?.status) {
      // Save the status change
      await handleStatusUpdate(editedStatus);
    }
    setIsEditing(!isEditing);
    if (!isEditing && candidate) {
      setEditedStatus(candidate.status);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCompareWithOthers = () => {
    navigate("/compare-candidates");
  };

  const CustomRadarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="tooltip-box">
          <strong>{data.trait}</strong>
          <ul>
            {data.breakdown.map((b: any, idx: number) => (
              <li key={idx}>
                <span className="trait-name">{b.sub}</span>
                <span className="trait-score">{b.score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
          <div
            style={{
              marginTop: "0.75rem",
              padding: "0.5rem 0",
              borderTop: "1px solid rgba(226, 232, 240, 0.5)",
              textAlign: "center",
              fontSize: "0.75rem",
              color: "#64748b",
              fontWeight: "600",
            }}
          >
            Overall Score: {data.value.toFixed(1)}/10
          </div>
        </div>
      );
    }

    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="profile">
        <div
          className="loading-container"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
            fontSize: "18px",
            color: "#6b7280",
          }}
        >
          Loading candidate profile...
        </div>
      </main>
    );
  }

  // Error state
  if (error || !candidate) {
    return (
      <main className="profile">
        <div
          className="error-container"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
            fontSize: "18px",
            color: "#ef4444",
          }}
        >
          <p>{error || "Candidate not found"}</p>
          <button
            onClick={handleGoBack}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  // Prepare data for display
  const radarData = createRadarData(personality);
  const resumeParsed = {
    skills: transformToProfileItems(candidate.skills || [], "skillName"),
    experience: transformToProfileItems(
      candidate.experience || [],
      "description"
    ),
    education: transformToProfileItems(
      candidate.education || [],
      "description"
    ),
    certification: transformToProfileItems(
      candidate.certification || [],
      "description"
    ),
    strength: transformToProfileItems(candidate.strengths || [], "description"),
    weaknesses: transformToProfileItems(
      candidate.weaknesses || [],
      "description"
    ),
    assessment: candidate.resumeAssessment
      ? [{ text: candidate.resumeAssessment }]
      : [],
  };

  return (
    <main className="profile">
      {/* Toast Notification */}
      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      <div className="profile-header">
        <div
          className="back-label"
          data-text={`Comprehensive profile analysis powered by AI • Last updated ${formatDate(
            candidate.dateUpdated
          )}`}
        >
          <div className="left-section">
            <img src="/images/back.png" alt="Back" onClick={handleGoBack} />
            <h2>{candidate.name}</h2>
          </div>
          <button
            onClick={handleCompareWithOthers}
            className="compare-btn"
            title="Compare with other candidates"
          >
            <img src="/images/compare.png" alt="Compare" />
            Compare
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="info-box">
          <div className="box-header">
            <h3>Candidate Information</h3>
            <button className="edit-btn" onClick={handleEditToggle}>
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>
          <div className="box-content">
            <div className="info-item">
              <div className="info-label">Full Name</div>
              <div className="info-value">{candidate.name}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Email Address</div>
              <div className="info-value">{candidate.email.join(", ")}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Birth Date</div>
              <div className="info-value">
                {formatDate(candidate.birthdate)}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Application Date</div>
              <div className="info-value">
                {formatDate(candidate.dateCreated)}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Last Updated</div>
              <div className="info-value">
                {formatDate(candidate.dateUpdated)}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Role Applied</div>
              <div className="info-value">
                {candidate.roleApplied || "Not specified"}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Resume</div>
              <div className="info-value">
                {candidate.resumeMetadata ? (
                  <a
                    href={getFileDownloadUrl(candidate.resumeMetadata.fileId)}
                    target="_blank"
                    rel="noreferrer"
                    className="download-link"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        getFileDownloadUrl(candidate.resumeMetadata!.fileId),
                        "_blank"
                      );
                      handleDownload(
                        candidate.resumeMetadata!.filename,
                        "resume"
                      );
                    }}
                  >
                    {candidate.resumeMetadata.filename} ↓
                  </a>
                ) : (
                  <p>
                    <strong>Resume:</strong>{" "}
                    <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                      No resume uploaded
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Interview Transcript</div>
              <div className="info-value">
                {candidate.transcripts && candidate.transcripts.length > 0 ? (
                  <p>
                    {candidate.transcripts.map(
                      (transcript: any, idx: number) => (
                        <span key={idx}>
                          <a
                            href={getTranscriptDownloadUrl(transcript.fileId)}
                            target="_blank"
                            rel="noreferrer"
                            className="download-link"
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(
                                getTranscriptDownloadUrl(transcript.fileId),
                                "_blank"
                              );
                              handleDownload(transcript.filename, "transcript");
                            }}
                          >
                            {transcript.filename} ↓
                          </a>
                          {idx < candidate.transcripts!.length - 1 && ", "}
                        </span>
                      )
                    )}
                    {isEditing && (
                      <div style={{ marginTop: "8px" }}>
                        <label
                          htmlFor="transcript-upload"
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            backgroundColor: "#007bff",
                            color: "white",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          {uploadingTranscript
                            ? "Uploading..."
                            : "Upload New Transcript"}
                        </label>
                        <input
                          id="transcript-upload"
                          type="file"
                          accept=".txt,.pdf,.mp3,.wav,.m4a,.ogg,.docx"
                          onChange={handleTranscriptUpload}
                          disabled={uploadingTranscript}
                          style={{ display: "none" }}
                        />
                      </div>
                    )}
                  </p>
                ) : (
                  <p>
                    <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                      No transcripts uploaded
                    </span>
                    {(candidate.transcripts.length === 0 || isEditing) && (
                      <div style={{ marginTop: "8px" }}>
                        <label
                          htmlFor="transcript-upload"
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            backgroundColor: "#007bff",
                            color: "white",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          {uploadingTranscript
                            ? "Uploading..."
                            : "Upload Transcript"}
                        </label>
                        <input
                          id="transcript-upload"
                          type="file"
                          accept=".txt,.pdf,.mp3,.wav,.m4a,.ogg,.docx"
                          onChange={handleTranscriptUpload}
                          disabled={uploadingTranscript}
                          style={{ display: "none" }}
                        />
                      </div>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Interview Videos Section */}
            <div className="info-item">
              <div className="info-label">Interview Video</div>
              <div className="info-value">
                {candidate.interviewVideos &&
                candidate.interviewVideos.length > 0 ? (
                  <p>
                    {candidate.interviewVideos.map(
                      (video: any, idx: number) => (
                        <span key={idx}>
                          <a
                            href={getInterviewVideoDownloadUrl(video.fileId)}
                            target="_blank"
                            rel="noreferrer"
                            className="download-link"
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(
                                getInterviewVideoDownloadUrl(video.fileId),
                                "_blank"
                              );
                              handleDownload(video.filename, "interview-video");
                            }}
                          >
                            {video.filename} ↓
                          </a>
                          {idx < candidate.interviewVideos!.length - 1 && ", "}
                        </span>
                      )
                    )}
                    {isEditing && (
                      <div style={{ marginTop: "8px" }}>
                        <label
                          htmlFor="interview-video-upload"
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            backgroundColor: "#007bff",
                            color: "white",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          {uploadingInterviewVideo
                            ? "Uploading..."
                            : "Upload New Interview Video"}
                        </label>
                        <input
                          id="interview-video-upload"
                          type="file"
                          accept=".mp4,.webm,.avi,.mov,.wmv,.flv,.mkv"
                          onChange={handleInterviewVideoUpload}
                          disabled={uploadingInterviewVideo}
                          style={{ display: "none" }}
                        />
                      </div>
                    )}
                  </p>
                ) : (
                  <p>
                    <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                      No interview videos uploaded
                    </span>
                    {(candidate.interviewVideos.length === 0 || isEditing) && (
                      <div style={{ marginTop: "8px" }}>
                        <label
                          htmlFor="interview-video-upload"
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            backgroundColor: "#007bff",
                            color: "white",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          {uploadingInterviewVideo
                            ? "Uploading..."
                            : "Upload Interview Video"}
                        </label>
                        <input
                          id="interview-video-upload"
                          type="file"
                          accept=".mp4,.webm,.avi,.mov,.wmv,.flv,.mkv"
                          onChange={handleInterviewVideoUpload}
                          disabled={uploadingInterviewVideo}
                          style={{ display: "none" }}
                        />
                      </div>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Introduction Videos Section */}
            <div className="info-item">
              <div className="info-label">Introduction Video</div>
              <div className="info-value">
                {candidate.introductionVideos &&
                candidate.introductionVideos.length > 0 ? (
                  <p>
                    {candidate.introductionVideos.map(
                      (video: any, idx: number) => (
                        <span key={idx}>
                          <a
                            href={getIntroductionVideoDownloadUrl(video.fileId)}
                            target="_blank"
                            rel="noreferrer"
                            className="download-link"
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(
                                getIntroductionVideoDownloadUrl(video.fileId),
                                "_blank"
                              );
                              handleDownload(
                                video.filename,
                                "introduction-video"
                              );
                            }}
                          >
                            {video.filename} ↓
                          </a>
                          {idx < candidate.introductionVideos!.length - 1 &&
                            ", "}
                        </span>
                      )
                    )}
                    {isEditing && (
                      <div style={{ marginTop: "8px" }}>
                        <label
                          htmlFor="introduction-video-upload"
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            backgroundColor: "#007bff",
                            color: "white",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          {uploadingIntroductionVideo
                            ? "Uploading..."
                            : "Upload New Introduction Video"}
                        </label>
                        <input
                          id="introduction-video-upload"
                          type="file"
                          accept=".mp4,.webm,.avi,.mov,.wmv,.flv,.mkv"
                          onChange={handleIntroductionVideoUpload}
                          disabled={uploadingIntroductionVideo}
                          style={{ display: "none" }}
                        />
                      </div>
                    )}
                  </p>
                ) : (
                  <p>
                    <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                      No introduction videos uploaded
                    </span>
                    {(candidate.introductionVideos.length === 0 || isEditing) && (
                      <div style={{ marginTop: "8px" }}>
                        <label
                          htmlFor="introduction-video-upload"
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            backgroundColor: "#007bff",
                            color: "white",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          {uploadingIntroductionVideo
                            ? "Uploading..."
                            : "Upload Introduction Video"}
                        </label>
                        <input
                          id="introduction-video-upload"
                          type="file"
                          accept=".mp4,.webm,.avi,.mov,.wmv,.flv,.mkv"
                          onChange={handleIntroductionVideoUpload}
                          disabled={uploadingIntroductionVideo}
                          style={{ display: "none" }}
                        />
                      </div>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="info-item">
              <div className="info-label">Current Status</div>
              <div className="info-value">
                {isEditing ? (
                  <select
                    value={editedStatus || candidate.status}
                    onChange={(e) => setEditedStatus(e.target.value)}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="In Review">In Review</option>
                  </select>
                ) : (
                  <span
                    className={`status-badge ${candidate.status?.toLowerCase() || 'pending'}`}
                  >
                    {candidate.status === "Approved" && "Approved"}
                    {candidate.status === "Rejected" && "Rejected"}
                    {candidate.status === "Pending" && "Pending"}
                    {candidate.status === "In Review" && "In Review"}
                    {candidate.status || "No Status"}
                  </span>
                )}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Account Status</div>
              <div className="info-value">
                <span
                  className={`status-badge ${
                    candidate.isDeleted ? "rejected" : "approved"
                  }`}
                >
                  {candidate.isDeleted ? " Inactive" : " Active"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout for parsed sections */}
      <div className="parsed-sections-container">
        {/* Resume Parsed Information */}
        <div className="parsed-section">
          <div className="box-header">
            <h3>Resume Parsed Information</h3>
            <button className="edit-btn" onClick={handleEditToggle}>
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>
          <div className="box-content">
            <div className="section">
              <strong>Skills:</strong>
              {resumeParsed.skills.length > 0 ? (
                <div className="skills-grid">
                  {resumeParsed.skills.map((item: ProfileItem, idx: number) => {
                    const isExpanded =
                      expandedIndex?.section === "skills" &&
                      expandedIndex.index === idx;

                    return (
                      <div
                        key={idx}
                        className={`skill-card ${isExpanded ? "expanded" : ""}`}
                        onClick={() => toggleExpand("skills", idx)}
                      >
                        <div className="skill-content">
                          <div className="skill-info">
                            <span className="skill-name">
                              {item.skillName || item.text}
                            </span>

                            {/* Preview evidence ONLY when NOT expanded */}
                            {!isExpanded &&
                              item.evidence &&
                              item.evidence !== item.skillName && (
                                <p className="skill-evidence">
                                  {item.evidence.substring(0, 60)}...
                                </p>
                              )}

                            {item.score && (
                              <div className="skill-score">
                                <span className="score-label">Score:</span>
                                <span className="score-value">{item.score}/10</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Full AI analysis ONLY when expanded */}
                        {isExpanded && (
                          <div className="skill-expanded">
                            <strong>AI Analysis:</strong>
                            <p>{item.evidence}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#6b7280", fontStyle: "italic" }}>
                  No skills data available
                </p>
              )}
            </div>
            <div className="section">
              <strong>Experience:</strong>
              {resumeParsed.experience.length > 0 ? (
                <div className="skills-grid">
                  {resumeParsed.experience.map((item: ProfileItem, idx: number) => {
                    const isExpanded =
                      expandedIndex?.section === "experience" &&
                      expandedIndex.index === idx;

                    return (
                      <div
                        key={idx}
                        className={`skill-card ${isExpanded ? "expanded" : ""}`}
                        onClick={() => toggleExpand("experience", idx)}
                      >
                        <div className="skill-content">
                          <div className="skill-info">
                            <span className="skill-name">
                              {item.skillName || "Experience"}
                            </span>

                            {/* Preview only when collapsed */}
                            {!isExpanded && item.evidence && (
                              <p className="skill-evidence">
                                {item.evidence.substring(0, 60)}...
                              </p>
                            )}

                            {item.score && (
                              <div className="skill-score">
                                <span className="score-label">Rating:</span>
                                <span className="score-value">{item.score}/10</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Full AI analysis */}
                        {isExpanded && (
                          <div className="skill-expanded">
                            <strong>AI Analysis:</strong>
                            <p>{item.evidence}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#6b7280", fontStyle: "italic" }}>
                  No experience data available
                </p>
              )}
            </div>
                        <div className="section">
              <strong>Education:</strong>
              {resumeParsed.education.length > 0 ? (
                <div className="skills-grid">
                  {resumeParsed.education.map((item: ProfileItem, idx: number) => {
                    const isExpanded =
                      expandedIndex?.section === "education" &&
                      expandedIndex.index === idx;

                    return (
                      <div
                        key={idx}
                        className={`skill-card ${isExpanded ? "expanded" : ""}`}
                        onClick={() => toggleExpand("education", idx)}
                      >
                        <div className="skill-content">
                          <div className="skill-info">
                            <span className="skill-name">
                              {item.skillName || "Education"}
                            </span>

                            {!isExpanded && item.evidence && (
                              <p className="skill-evidence">
                                {item.evidence.substring(0, 60)}...
                              </p>
                            )}

                            {item.score && (
                              <div className="skill-score">
                                <span className="score-label">Rating:</span>
                                <span className="score-value">{item.score}/10</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="skill-expanded">
                            <strong>AI Analysis:</strong>
                            <p>{item.evidence}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#6b7280", fontStyle: "italic" }}>
                  No education data available
                </p>
              )}
            </div>
                        <div className="section">
              <strong>Certification:</strong>
              {resumeParsed.certification.length > 0 ? (
                <div className="skills-grid">
                  {resumeParsed.certification.map((item: ProfileItem, idx: number) => {
                    const isExpanded =
                      expandedIndex?.section === "certification" &&
                      expandedIndex.index === idx;

                    return (
                      <div
                        key={idx}
                        className={`skill-card ${isExpanded ? "expanded" : ""}`}
                        onClick={() => toggleExpand("certification", idx)}
                      >
                        <div className="skill-content">
                          <div className="skill-info">
                            <span className="skill-name">
                              {item.skillName || "Certification"}
                            </span>

                            {!isExpanded && item.evidence && (
                              <p className="skill-evidence">
                                {item.evidence.substring(0, 60)}...
                              </p>
                            )}

                            {item.score && (
                              <div className="skill-score">
                                <span className="score-label">Rating:</span>
                                <span className="score-value">{item.score}/10</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="skill-expanded">
                            <strong>AI Analysis:</strong>
                            <p>{item.evidence}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#6b7280", fontStyle: "italic" }}>
                  No certification data available
                </p>
              )}
            </div>
                        <div className="section">
              <strong>Strength:</strong>
              {resumeParsed.strength.length > 0 ? (
                <div className="skills-grid">
                  {resumeParsed.strength.map((item: ProfileItem, idx: number) => {
                    const isExpanded =
                      expandedIndex?.section === "strength" &&
                      expandedIndex.index === idx;

                    return (
                      <div
                        key={idx}
                        className={`skill-card ${isExpanded ? "expanded" : ""}`}
                        onClick={() => toggleExpand("strength", idx)}
                      >
                        <div className="skill-content">
                          <div className="skill-info">
                            <span className="skill-name">
                              {item.skillName || "Strength"}
                            </span>

                            {!isExpanded && item.evidence && (
                              <p className="skill-evidence">
                                {item.evidence.substring(0, 60)}...
                              </p>
                            )}

                            {item.score && (
                              <div className="skill-score">
                                <span className="score-label">Rating:</span>
                                <span className="score-value">{item.score}/10</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="skill-expanded">
                            <strong>AI Analysis:</strong>
                            <p>{item.evidence}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#6b7280", fontStyle: "italic" }}>
                  No strengths data available
                </p>
              )}
            </div>
                        <div className="section">
              <strong>Weaknesses:</strong>
              {resumeParsed.weaknesses.length > 0 ? (
                <div className="skills-grid">
                  {resumeParsed.weaknesses.map((item: ProfileItem, idx: number) => {
                    const isExpanded =
                      expandedIndex?.section === "weaknesses" &&
                      expandedIndex.index === idx;

                    return (
                      <div
                        key={idx}
                        className={`skill-card ${isExpanded ? "expanded" : ""}`}
                        onClick={() => toggleExpand("weaknesses", idx)}
                      >
                        <div className="skill-content">
                          <div className="skill-info">
                            <span className="skill-name">
                              {item.skillName || "Weakness"}
                            </span>

                            {!isExpanded && item.evidence && (
                              <p className="skill-evidence">
                                {item.evidence.substring(0, 60)}...
                              </p>
                            )}

                            {item.score && (
                              <div className="skill-score">
                                <span className="score-label">Rating:</span>
                                <span className="score-value">{item.score}/10</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="skill-expanded">
                            <strong>AI Analysis:</strong>
                            <p>{item.evidence}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#6b7280", fontStyle: "italic" }}>
                  No weaknesses data available
                </p>
              )}
            </div>
            {/* <div className="section">
              <strong>Resume Assessment:</strong>
              {resumeParsed.assessment.length > 0 ? (
                <div className="assessment-content">
                  {resumeParsed.assessment.map((item: ProfileItem, idx: number) => (
                    <p key={idx} style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                      {item.text}
                    </p>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No resume assessment available</p>
              )}
            </div> */}
          </div>
        </div>

        {/* Interview Transcript Information */}
        <div className="parsed-section">
          <div className="box-header">
            <h3>Interview Transcript Information</h3>
            <button className="edit-btn" onClick={handleEditToggle}>
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>
          <div className="radar-content">
            <div className="section radar-chart">
              <strong>Personality Traits Radar</strong>
              <div className="radar-chart-container">
                <div className="radar-chart-overlay"></div>
                <ResponsiveContainer width="100%" height={450}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                    data={radarData}
                    margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                  >
                    <PolarGrid
                      stroke="rgba(148, 163, 184, 0.3)"
                      strokeWidth={1}
                    />
                    <PolarAngleAxis
                      dataKey="trait"
                      tick={{
                        fontSize: 11,
                        fontWeight: 600,
                        fill: "#475569",
                        width: "100%",
                      }}
                      className="radar-axis-text"
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 10]}
                      tick={{
                        fontSize: 10,
                        fill: "#64748b",
                      }}
                      tickFormatter={(tick) => tick.toFixed(1)}
                      strokeOpacity={0.3}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#E30022"
                      strokeWidth={3}
                      fill="#E30022"
                      fillOpacity={0.15}
                      dot={{
                        fill: "#E30022",
                        strokeWidth: 2,
                        stroke: "#ffffff",
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#E30022",
                        stroke: "#ffffff",
                        strokeWidth: 3,
                        filter: "drop-shadow(0 2px 4px rgba(227, 0, 34, 0.4))",
                      }}
                    />
                    <Tooltip
                      content={<CustomRadarTooltip />}
                      cursor={false}
                      wrapperStyle={{
                        outline: "none",
                        filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Personality Trait Evidences - Categorized */}
            <div className="section">
              <strong>Personality Trait Evidence:</strong>
              {personality ? (
                <div className="personality-categories">
                  {/* Cognitive and Problem Solving Category */}
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

                  {/* Communication and Teamwork Category */}
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

                  {/* Work Ethic and Reliability Category */}
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

                  {/* Growth and Leadership Category */}
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

                  {/* Culture and Personality Fit Category */}
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

                  {/* Bonus Traits Category */}
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

        {/* Comments Section */}
        <Comments entityType={CommentEntityType.CANDIDATE} entityId={id!} />
      </div>
    </main>
  );
};

export default Profile;
