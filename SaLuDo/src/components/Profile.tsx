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
import { ResumeEditData } from "./profile/resumeEditTypes";
import { SKILL_SCORE } from "./profile/resumeEditConstants";
import { resumeEditApi } from "./profile/resumeEditApi";

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [personality, setPersonality] = useState<PersonalityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editedData, setEditedData] = useState({
    name: "",
    email: [] as string[],
    birthdate: "",
    roleApplied: "",
    status: "",
    socialLinks: [] as { url: string }[]
  });
  const [editedResumeData, setEditedResumeData] = useState<ResumeEditData>({
    skills: [],
    experience: [],
    education: [],
    certification: [],
    strengths: [],
    weaknesses: []
  });
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
        setEditedData({
          name: candidateData.name,
          email: candidateData.email,
          birthdate: candidateData.birthdate,
          roleApplied: candidateData.roleApplied || "",
          status: candidateData.status,
          socialLinks: candidateData.socialLinks || []
        });
        setEditedResumeData({
          skills: candidateData.skills?.map((s: any) => ({
            candidateSkillId: s.skillId,
            skillId: s.skillId,
            skillName: s.skillName,
            score: s.score || SKILL_SCORE.DEFAULT,
            evidence: s.evidence || '',
            source: s.addedBy === 'AI' ? 'ai' : s.addedBy === 'HUMAN' ? 'manual' : s.source || 'ai',
            isAccepted: s.isAccepted
          })) || [],
          experience: candidateData.experience?.map((e: any) => ({
            experienceId: e.experienceId,
            description: e.description,
            title: e.title,
            role: e.role,
            startDate: e.startDate,
            endDate: e.endDate,
            source: e.addedBy === 'AI' ? 'ai' : e.addedBy === 'HUMAN' ? 'manual' : e.source || 'ai'
          })) || [],
          education: candidateData.education?.map((e: any) => ({
            educationId: e.educationId,
            description: e.description,
            institution: e.institution,
            startDate: e.startDate,
            endDate: e.endDate,
            source: e.addedBy === 'AI' ? 'ai' : e.addedBy === 'HUMAN' ? 'manual' : e.source || 'ai'
          })) || [],
          certification: candidateData.certification?.map((c: any) => ({
            certificationId: c.certificationId,
            description: c.description,
            certificationName: c.name || c.certificationName,
            issuingOrganization: c.issuingOrganization,
            issueDate: c.issueDate,
            source: c.addedBy === 'AI' ? 'ai' : c.addedBy === 'HUMAN' ? 'manual' : c.source || 'ai'
          })) || [],
          strengths: candidateData.strengths?.map((s: any) => ({
            strengthWeaknessId: s.strengthWeaknessId,
            name: s.name,
            description: s.description,
            type: 'strength' as const,
            source: s.addedBy === 'AI' ? 'ai' : s.addedBy === 'HUMAN' ? 'manual' : s.source || 'ai'
          })) || [],
          weaknesses: candidateData.weaknesses?.map((w: any) => ({
            strengthWeaknessId: w.strengthWeaknessId,
            name: w.name,
            description: w.description,
            type: 'weakness' as const,
            source: w.addedBy === 'AI' ? 'ai' : w.addedBy === 'HUMAN' ? 'manual' : w.source || 'ai'
          })) || []
        });
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

  const handleSaveChanges = async () => {
    if (!id || !candidate) return;

    try {
      const updateData: any = {};
      
      if (editedData.name !== candidate.name) updateData.name = editedData.name;
      if (JSON.stringify(editedData.email) !== JSON.stringify(candidate.email)) updateData.email = editedData.email;
      if (editedData.birthdate !== candidate.birthdate) updateData.birthdate = editedData.birthdate;
      if (editedData.roleApplied !== (candidate.roleApplied || "")) updateData.roleApplied = editedData.roleApplied;
      if (editedData.status !== candidate.status) updateData.status = editedData.status;
      if (JSON.stringify(editedData.socialLinks) !== JSON.stringify(candidate.socialLinks || [])) {
        updateData.socialLinks = editedData.socialLinks;
      }

      if (Object.keys(updateData).length === 0) {
        setToastMessage("No changes to save");
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      await candidatesApi.updateCandidate(id, updateData);
      setToastMessage("Candidate information updated successfully");
      await fetchCandidateData();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error updating candidate:", error);
      setToastMessage("Failed to update candidate information");
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
    if (isEditing) {
      await handleSaveChanges();
      setIsEditing(false);
    } else {
      if (candidate) {
        setEditedData({
          name: candidate.name,
          email: candidate.email,
          birthdate: candidate.birthdate,
          roleApplied: candidate.roleApplied || "",
          status: candidate.status,
          socialLinks: candidate.socialLinks || []
        });
      }
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (candidate) {
      setEditedData({
        name: candidate.name,
        email: candidate.email,
        birthdate: candidate.birthdate,
        roleApplied: candidate.roleApplied || "",
        status: candidate.status,
        socialLinks: candidate.socialLinks || []
      });
    }
  };

  const handleResumeEditToggle = async () => {
    if (isEditingResume) {
      await handleSaveResumeChanges();
      setIsEditingResume(false);
    } else {
      setIsEditingResume(true);
    }
  };

  const handleCancelResumeEdit = () => {
    setIsEditingResume(false);
    if (candidate) {
      setEditedResumeData({
        skills: candidate.skills?.map(s => ({
          candidateSkillId: s.skillId,
          skillId: s.skillId,
          skillName: s.skillName,
          score: s.score || SKILL_SCORE.DEFAULT,
          evidence: s.evidence || '',
          source: s.addedBy === 'AI' ? 'ai' : s.addedBy === 'HUMAN' ? 'manual' : s.source || 'ai',
          isAccepted: s.isAccepted
        })) || [],
        experience: candidate.experience?.map(e => ({
          experienceId: e.experienceId,
          description: e.description,
          title: e.title,
          role: e.role,
          startDate: e.startDate,
          endDate: e.endDate,
          source: e.addedBy === 'AI' ? 'ai' : e.addedBy === 'HUMAN' ? 'manual' : e.source || 'ai'
        })) || [],
        education: candidate.education?.map(e => ({
          educationId: e.educationId,
          description: e.description,
          institution: e.institution,
          startDate: e.startDate,
          endDate: e.endDate,
          source: e.addedBy === 'AI' ? 'ai' : e.addedBy === 'HUMAN' ? 'manual' : e.source || 'ai'
        })) || [],
        certification: candidate.certification?.map(c => ({
          certificationId: c.certificationId,
          description: c.description,
          certificationName: c.name || c.certificationName,
          issuingOrganization: c.issuingOrganization,
          issueDate: c.issueDate,
          source: c.addedBy === 'AI' ? 'ai' : c.addedBy === 'HUMAN' ? 'manual' : c.source || 'ai'
        })) || [],
        strengths: candidate.strengths?.map(s => ({
          strengthWeaknessId: s.strengthWeaknessId,
          name: s.name,
          description: s.description,
          type: 'strength' as const,
          source: s.addedBy === 'AI' ? 'ai' : s.addedBy === 'HUMAN' ? 'manual' : s.source || 'ai'
        })) || [],
        weaknesses: candidate.weaknesses?.map(w => ({
          strengthWeaknessId: w.strengthWeaknessId,
          name: w.name,
          description: w.description,
          type: 'weakness' as const,
          source: w.addedBy === 'AI' ? 'ai' : w.addedBy === 'HUMAN' ? 'manual' : w.source || 'ai'
        })) || []
      });
    }
  };

  const handleSaveResumeChanges = async () => {
    if (!id || !candidate) return;

    try {
      const promises: Promise<void>[] = [];

      // Process skills
      editedResumeData.skills.forEach(skill => {
        if (skill.candidateSkillId) {
          const original = candidate.skills?.find(s => s.skillId === skill.candidateSkillId);
          if (original && (
            original.skillName !== skill.skillName ||
            original.score !== skill.score ||
            original.evidence !== skill.evidence
          )) {
            promises.push(resumeEditApi.updateSkill(id, skill));
          }
        } else if (skill.skillName.trim()) {
          promises.push(resumeEditApi.createSkill(id, skill));
        }
      });

      candidate.skills?.forEach(original => {
        const exists = editedResumeData.skills.find(s => s.candidateSkillId === original.skillId);
        if (!exists && original.skillId) {
          promises.push(resumeEditApi.deleteSkill(id, original.skillId));
        }
      });

      // Process experience
      editedResumeData.experience.forEach(exp => {
        if (exp.experienceId) {
          const original = candidate.experience?.find(e => e.experienceId === exp.experienceId);
          if (original) {
            promises.push(resumeEditApi.updateExperience(id, exp));
          }
        } else if (exp.description.trim()) {
          promises.push(resumeEditApi.createExperience(id, exp));
        }
      });

      candidate.experience?.forEach(original => {
        const exists = editedResumeData.experience.find(e => e.experienceId === original.experienceId);
        if (!exists && original.experienceId) {
          promises.push(resumeEditApi.deleteExperience(id, original.experienceId));
        }
      });

      // Process education
      editedResumeData.education.forEach(edu => {
        if (edu.educationId) {
          const original = candidate.education?.find(e => e.educationId === edu.educationId);
          if (original) {
            promises.push(resumeEditApi.updateEducation(id, edu));
          }
        } else if (edu.description.trim()) {
          promises.push(resumeEditApi.createEducation(id, edu));
        }
      });

      candidate.education?.forEach(original => {
        const exists = editedResumeData.education.find(e => e.educationId === original.educationId);
        if (!exists && original.educationId) {
          promises.push(resumeEditApi.deleteEducation(id, original.educationId));
        }
      });

      // Process certifications
      editedResumeData.certification.forEach(cert => {
        if (cert.certificationId) {
          const original = candidate.certification?.find(c => c.certificationId === cert.certificationId);
          if (original) {
            promises.push(resumeEditApi.updateCertification(id, cert));
          }
        } else if (cert.description.trim()) {
          promises.push(resumeEditApi.createCertification(id, cert));
        }
      });

      candidate.certification?.forEach(original => {
        const exists = editedResumeData.certification.find(c => c.certificationId === original.certificationId);
        if (!exists && original.certificationId) {
          promises.push(resumeEditApi.deleteCertification(id, original.certificationId));
        }
      });

      // Process strengths
      editedResumeData.strengths.forEach(item => {
        if (item.strengthWeaknessId) {
          const original = candidate.strengths?.find(s => s.strengthWeaknessId === item.strengthWeaknessId);
          if (original) {
            promises.push(resumeEditApi.updateStrengthWeakness(id, item));
          }
        } else if (item.description.trim()) {
          promises.push(resumeEditApi.createStrengthWeakness(id, item));
        }
      });

      candidate.strengths?.forEach(original => {
        const exists = editedResumeData.strengths.find(s => s.strengthWeaknessId === original.strengthWeaknessId);
        if (!exists && original.strengthWeaknessId) {
          promises.push(resumeEditApi.deleteStrengthWeakness(id, original.strengthWeaknessId, 'strength'));
        }
      });

      // Process weaknesses
      editedResumeData.weaknesses.forEach(item => {
        if (item.strengthWeaknessId) {
          const original = candidate.weaknesses?.find(w => w.strengthWeaknessId === item.strengthWeaknessId);
          if (original) {
            promises.push(resumeEditApi.updateStrengthWeakness(id, item));
          }
        } else if (item.description.trim()) {
          promises.push(resumeEditApi.createStrengthWeakness(id, item));
        }
      });

      candidate.weaknesses?.forEach(original => {
        const exists = editedResumeData.weaknesses.find(w => w.strengthWeaknessId === original.strengthWeaknessId);
        if (!exists && original.strengthWeaknessId) {
          promises.push(resumeEditApi.deleteStrengthWeakness(id, original.strengthWeaknessId, 'weakness'));
        }
      });

      await Promise.all(promises);
      
      setToastMessage("Resume information updated successfully");
      setTimeout(() => setToastMessage(null), 3000);
      
      await fetchCandidateData();
    } catch (error) {
      console.error("Error saving resume changes:", error);
      setToastMessage("Failed to save resume changes");
      setTimeout(() => setToastMessage(null), 3000);
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
          editedData={editedData}
          uploadingTranscript={uploadingTranscript}
          uploadingInterviewVideo={uploadingInterviewVideo}
          uploadingIntroductionVideo={uploadingIntroductionVideo}
          onEditToggle={handleEditToggle}
          onCancelEdit={handleCancelEdit}
          onEditedDataChange={setEditedData}
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
          isEditing={isEditingResume}
          editedResumeData={editedResumeData}
          onEditToggle={handleResumeEditToggle}
          onCancelEdit={handleCancelResumeEdit}
          onResumeDataChange={setEditedResumeData}
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
