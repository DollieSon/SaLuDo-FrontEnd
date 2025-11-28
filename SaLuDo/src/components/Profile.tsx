import "./css/Profile.css";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { candidatesApi, skillsApi } from "../utils/api";
import Comments from "./Comments";
import { CommentEntityType } from "../types/comment";
import { CandidateProfile, PersonalityData, ProfileItem } from "../types/profile";
import { transformToProfileItems, createRadarData, formatDate } from "./profile/profileUtils";
import { CandidateInfoSection } from "./profile/CandidateInfoSection";
import { ResumeParsedSection } from "./profile/ResumeParsedSection";
import { PersonalitySection } from "./profile/PersonalitySection";
import { ProfileDetailModal } from "./profile/ProfileDetailModal";

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
  const [uploadingIntroductionVideo, setUploadingIntroductionVideo] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    data: ProfileItem;
    section: string;
    type: 'skill' | 'experience' | 'education' | 'certification' | 'strength' | 'weakness';
  } | null>(null);

  const openDetailModal = (
    item: ProfileItem,
    section: string,
    type: 'skill' | 'experience' | 'education' | 'certification' | 'strength' | 'weakness'
  ) => {
    setSelectedItem({ data: item, section, type });
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const enrichSkillsWithNames = async (candidateData: CandidateProfile): Promise<CandidateProfile> => {
    try {
      const skillResponse = await skillsApi.getAllMasterSkills();
      console.log("🎨 SkillMaster API Response:", skillResponse);

      let masterSkills: any[] = [];

      if (skillResponse.success && skillResponse.data) {
        masterSkills = skillResponse.data;
        console.log("🎯 Master Skills Data:", masterSkills);
        console.log("🔢 Total Master Skills Found:", masterSkills.length);
      }

      const enrichedSkills = candidateData.skills.map((skill: any, index: number) => {
        console.log(`🔍 Processing skill ${index + 1}:`, skill);

        if (skill.skillId && (!skill.skillName || skill.skillName === skill.skillId)) {
          const masterSkill = masterSkills.find(
            (ms: any) => ms.skillId === skill.skillId || ms._id === skill.skillId
          );

          if (masterSkill) {
            console.log(`✅ Found master skill for ${skill.skillId}:`, masterSkill);
            return {
              ...skill,
              skillName: masterSkill.skillName,
              isAccepted: masterSkill.isAccepted,
            };
          } else {
            const readableName = skill.skillId
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str: string) => str.toUpperCase())
              .trim();
            console.warn(`⚠️ Could not find skill name for ID: ${skill.skillId}, using fallback: ${readableName}`);
            return {
              ...skill,
              skillName: readableName,
            };
          }
        }
        console.log(`✨ Skill already has name, keeping as-is:`, skill);
        return skill;
      });

      console.log("🎉 Final enriched skills:", enrichedSkills);

      return {
        ...candidateData,
        skills: enrichedSkills,
      };
    } catch (err) {
      console.error("💥 Error enriching skills with names:", err);
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

  const fetchCandidateData = async () => {
    if (!id) {
      setError("No candidate ID provided");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const candidateResponse = await candidatesApi.getCandidateById(id);
      console.log("🔍 Candidate API Response:", candidateResponse);

      if (candidateResponse.success) {
        let candidateData = candidateResponse.data;
        console.log("📊 Raw Candidate Data:", candidateData);
        console.log("🎯 Candidate Skills (before enrichment):", candidateData.skills);

        if (candidateData.skills && candidateData.skills.length > 0) {
          candidateData = await enrichSkillsWithNames(candidateData);
          console.log("✨ Candidate Skills (after enrichment):", candidateData.skills);
        }

        setCandidate(candidateData);
        setEditedStatus(candidateData.status);
      } else {
        console.error("❌ Failed to fetch candidate data:", candidateResponse);
        throw new Error("Failed to fetch candidate data");
      }

      try {
        const personalityResponse = await candidatesApi.getCandidatePersonality(id);
        console.log("🧠 Personality API Response:", personalityResponse);

        if (personalityResponse.success) {
          console.log("🎭 Personality Data:", personalityResponse.data);
          setPersonality(personalityResponse.data);
        }
      } catch (personalityError) {
        console.log("⚠️ Personality data not available:", personalityError);
      }
    } catch (err) {
      console.error("Error fetching candidate data:", err);
      setError(err instanceof Error ? err.message : "Failed to load candidate profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateData();
  }, [id]);

  const handleDownload = (
    filename: string,
    type: "resume" | "transcript" | "interview-video" | "introduction-video"
  ) => {
    console.log(`Downloading ${type}: ${filename}`);
    setToastMessage(`Downloading ${filename}...`);
    setTimeout(() => setToastMessage(null), 3000);
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

  const handleTranscriptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    setUploadingTranscript(true);

    try {
      const formData = new FormData();
      formData.append("transcript", file);

      await candidatesApi.uploadTranscript(id, formData);
      setToastMessage("Transcript uploaded successfully");
      await fetchCandidateData();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error uploading transcript:", error);
      setToastMessage("Failed to upload transcript");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setUploadingTranscript(false);
      event.target.value = "";
    }
  };

  const handleInterviewVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    setUploadingInterviewVideo(true);

    try {
      const formData = new FormData();
      formData.append("video", file);

      await candidatesApi.uploadInterviewVideo(id, formData);
      setToastMessage("Interview video uploaded successfully");
      await fetchCandidateData();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error uploading interview video:", error);
      setToastMessage("Failed to upload interview video");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setUploadingInterviewVideo(false);
      event.target.value = "";
    }
  };

  const handleIntroductionVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    setUploadingIntroductionVideo(true);

    try {
      const formData = new FormData();
      formData.append("video", file);

      await candidatesApi.uploadIntroductionVideo(id, formData);
      setToastMessage("Introduction video uploaded successfully");
      await fetchCandidateData();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error uploading introduction video:", error);
      setToastMessage("Failed to upload introduction video");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setUploadingIntroductionVideo(false);
      event.target.value = "";
    }
  };

  const handleEditToggle = async () => {
    if (isEditing && editedStatus && editedStatus !== candidate?.status) {
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

  const radarData = createRadarData(personality);
  const resumeParsed = {
    skills: transformToProfileItems(candidate.skills || [], "skillName", "skill"),
    experience: transformToProfileItems(candidate.experience || [], "description", "experience"),
    education: transformToProfileItems(candidate.education || [], "description", "education"),
    certification: transformToProfileItems(candidate.certification || [], "description", "certification"),
    strength: transformToProfileItems(candidate.strengths || [], "description", "strength"),
    weaknesses: transformToProfileItems(candidate.weaknesses || [], "description", "weakness"),
  };

  return (
    <main className="profile">
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
        <CandidateInfoSection
          candidate={candidate}
          isEditing={isEditing}
          editedStatus={editedStatus}
          uploadingTranscript={uploadingTranscript}
          uploadingInterviewVideo={uploadingInterviewVideo}
          uploadingIntroductionVideo={uploadingIntroductionVideo}
          onEditToggle={handleEditToggle}
          onStatusChange={setEditedStatus}
          onTranscriptUpload={handleTranscriptUpload}
          onInterviewVideoUpload={handleInterviewVideoUpload}
          onIntroductionVideoUpload={handleIntroductionVideoUpload}
          onDownload={handleDownload}
        />
      </div>

      <div className="parsed-sections-container">
        <ResumeParsedSection
          skills={resumeParsed.skills}
          experience={resumeParsed.experience}
          education={resumeParsed.education}
          certification={resumeParsed.certification}
          strength={resumeParsed.strength}
          weaknesses={resumeParsed.weaknesses}
          isEditing={isEditing}
          onEditToggle={handleEditToggle}
          onItemClick={openDetailModal}
        />

        <PersonalitySection
          personality={personality}
          radarData={radarData}
          isEditing={isEditing}
          onEditToggle={handleEditToggle}
        />

        <Comments entityType={CommentEntityType.CANDIDATE} entityId={id!} />
      </div>

      {showDetailModal && (
        <ProfileDetailModal
          selectedItem={selectedItem}
          onClose={closeDetailModal}
        />
      )}
    </main>
  );
};

export default Profile;
