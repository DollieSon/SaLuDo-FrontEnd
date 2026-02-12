import "./css/Profile.css";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { candidatesApi, skillsApi } from "../utils/api";
import Comments from "./Comments";
import { CommentEntityType } from "../types/comment";
import {
  CandidateProfile,
  PersonalityData,
  ProfileItem,
} from "../types/profile";
import {
  transformToProfileItems,
  createRadarData,
  formatDate,
} from "./profile/profileUtils";
import { CandidateInfoSection } from "./profile/CandidateInfoSection";
import { ResumeParsedSection } from "./profile/ResumeParsedSection";
import { PersonalitySection } from "./profile/PersonalitySection";
import { ProfileDetailModal } from "./profile/ProfileDetailModal";
import { ResumeEditData } from "./profile/resumeEditTypes";
import { SKILL_SCORE } from "./profile/resumeEditConstants";
import { resumeEditApi } from "./profile/resumeEditApi";
import { CandidateScoreSection } from "./scoring/CandidateScoreSection";
import { VideoAnalysisSection } from "./profile/VideoAnalysisSection";
import StatusHistoryTimeline from "../../ForFrontEnd/components/candidate/StatusHistoryTimeline";
import { StatusHistoryEntry, CandidateStatus } from "../../ForFrontEnd/types/CandidateApiTypes";
import { CandidateApiClient } from "../../ForFrontEnd/clients/CandidateApiClient";
import { StatusChangeDialog } from "../../ForFrontEnd/components/common/StatusChangeDialog";

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
  const [activeTab, setActiveTab] = useState<'info' | 'score' | 'resume' | 'history' | 'comments'>('info');
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [editedData, setEditedData] = useState({
    name: "",
    email: [] as string[],
    birthdate: "",
    roleApplied: "",
    status: "",
    socialLinks: [] as { url: string }[],
  });
  const [editedResumeData, setEditedResumeData] = useState<ResumeEditData>({
    skills: [],
    experience: [],
    education: [],
    certification: [],
    strengths: [],
    weaknesses: [],
  });
  const [uploadingTranscript, setUploadingTranscript] = useState(false);
  const [uploadingInterviewVideo, setUploadingInterviewVideo] = useState(false);
  const [uploadingIntroductionVideo, setUploadingIntroductionVideo] =
    useState(false);
  const [processingVideo, setProcessingVideo] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    data: ProfileItem;
    section: string;
    type:
      | "skill"
      | "experience"
      | "education"
      | "certification"
      | "strength"
      | "weakness";
  } | null>(null);

  const openDetailModal = (
    item: ProfileItem,
    section: string,
    type:
      | "skill"
      | "experience"
      | "education"
      | "certification"
      | "strength"
      | "weakness"
  ) => {
    setSelectedItem({ data: item, section, type });
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const enrichSkillsWithNames = async (
    candidateData: CandidateProfile
  ): Promise<CandidateProfile> => {
    try {
      const skillResponse = await skillsApi.getAllMasterSkills();
      console.log("🎨 SkillMaster API Response:", skillResponse);

      let masterSkills: any[] = [];

      if (skillResponse.success && skillResponse.data) {
        masterSkills = skillResponse.data;
        console.log("🎯 Master Skills Data:", masterSkills);
        console.log("🔢 Total Master Skills Found:", masterSkills.length);
      }

      const enrichedSkills = candidateData.skills.map(
        (skill: any, index: number) => {
          console.log(`🔍 Processing skill ${index + 1}:`, skill);

          if (
            skill.skillId &&
            (!skill.skillName || skill.skillName === skill.skillId)
          ) {
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
          return skill;
        }
      );

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
        console.log(
          "🎯 Candidate Skills (before enrichment):",
          candidateData.skills
        );

        if (candidateData.skills && candidateData.skills.length > 0) {
          candidateData = await enrichSkillsWithNames(candidateData);
          console.log(
            "✨ Candidate Skills (after enrichment):",
            candidateData.skills
          );
        }

        setCandidate(candidateData);
        setEditedData({
          name: candidateData.name,
          email: candidateData.email,
          birthdate: candidateData.birthdate,
          roleApplied: candidateData.roleApplied || "",
          status: candidateData.status,
          socialLinks: candidateData.socialLinks || [],
        });
        setEditedResumeData({
          skills:
            candidateData.skills?.map((s: any) => ({
              candidateSkillId: s.candidateSkillId || s.skillId,
              skillId: s.skillId,
              skillName: s.skillName,
              score: s.score || SKILL_SCORE.DEFAULT,
              evidence: s.evidence || "",
              source:
                s.addedBy === "AI"
                  ? "ai"
                  : s.addedBy === "HUMAN"
                  ? "manual"
                  : s.source || "ai",
              isAccepted: s.isAccepted,
            })) || [],
          experience:
            candidateData.experience?.map((e: any) => ({
              experienceId: e.experienceId,
              description: e.description,
              title: e.title,
              role: e.role,
              startDate: e.startDate,
              endDate: e.endDate,
              source:
                e.addedBy === "AI"
                  ? "ai"
                  : e.addedBy === "HUMAN"
                  ? "manual"
                  : e.source || "ai",
            })) || [],
          education:
            candidateData.education?.map((e: any) => ({
              educationId: e.educationId,
              description: e.description,
              institution: e.institution,
              startDate: e.startDate,
              endDate: e.endDate,
              source:
                e.addedBy === "AI"
                  ? "ai"
                  : e.addedBy === "HUMAN"
                  ? "manual"
                  : e.source || "ai",
            })) || [],
          certification:
            candidateData.certification?.map((c: any) => ({
              certificationId: c.certificationId,
              description: c.description,
              certificationName: c.name || c.certificationName,
              issuingOrganization: c.issuingOrganization,
              issueDate: c.issueDate,
              source:
                c.addedBy === "AI"
                  ? "ai"
                  : c.addedBy === "HUMAN"
                  ? "manual"
                  : c.source || "ai",
            })) || [],
          strengths:
            candidateData.strengths?.map((s: any) => ({
              strengthWeaknessId: s.strengthWeaknessId,
              name: s.name,
              description: s.description,
              type: "strength" as const,
              source:
                s.addedBy === "AI"
                  ? "ai"
                  : s.addedBy === "HUMAN"
                  ? "manual"
                  : s.source || "ai",
            })) || [],
          weaknesses:
            candidateData.weaknesses?.map((w: any) => ({
              strengthWeaknessId: w.strengthWeaknessId,
              name: w.name,
              description: w.description,
              type: "weakness" as const,
              source:
                w.addedBy === "AI"
                  ? "ai"
                  : w.addedBy === "HUMAN"
                  ? "manual"
                  : w.source || "ai",
            })) || [],
        });
      } else {
        console.error("❌ Failed to fetch candidate data:", candidateResponse);
        throw new Error("Failed to fetch candidate data");
      }

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

  const fetchStatusHistory = async () => {
    if (!id) return;
    
    try {
      setLoadingHistory(true);
      const data = await CandidateApiClient.getStatusHistory(id);
      setStatusHistory(data.statusHistory);
    } catch (err) {
      console.error('Failed to load status history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStatusChange = async (newStatus: string, reason?: string) => {
    if (!id) return;
    
    setStatusChanging(true);
    try {
      // Optimistically update the UI immediately
      if (candidate) {
        setCandidate({ ...candidate, status: newStatus });
        setEditedData(prev => ({ ...prev, status: newStatus }));
      }
      
      await candidatesApi.updateCandidate(id, {
        status: newStatus,
        statusChangeReason: reason,
        statusChangeSource: 'manual'
      });
      
      setToastMessage("Status updated successfully");
      // Fetch fresh data to ensure consistency
      await Promise.all([fetchCandidateData(), fetchStatusHistory()]);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert optimistic update on error
      await fetchCandidateData();
      setToastMessage("Failed to update status");
      setTimeout(() => setToastMessage(null), 3000);
      throw error;
    } finally {
      setStatusChanging(false);
    }
  };

  const availableStatuses = [
    { value: CandidateStatus.FOR_REVIEW, label: 'For Review', color: '#3b82f6' },
    { value: CandidateStatus.PAPER_SCREENING, label: 'Paper Screening', color: '#6366f1' },
    { value: CandidateStatus.EXAM, label: 'Exam', color: '#8b5cf6' },
    { value: CandidateStatus.HR_INTERVIEW, label: 'HR Interview', color: '#ec4899' },
    { value: CandidateStatus.TECHNICAL_INTERVIEW, label: 'Technical Interview', color: '#f97316' },
    { value: CandidateStatus.FINAL_INTERVIEW, label: 'Final Interview', color: '#f59e0b' },
    { value: CandidateStatus.FOR_JOB_OFFER, label: 'For Job Offer', color: '#84cc16' },
    { value: CandidateStatus.OFFER_EXTENDED, label: 'Offer Extended', color: '#d946ef' },
    { value: CandidateStatus.HIRED, label: 'Hired', color: '#10b981', requiresReason: false },
    { value: CandidateStatus.REJECTED, label: 'Rejected', color: '#ef4444', requiresReason: true },
    { value: CandidateStatus.WITHDRAWN, label: 'Withdrawn', color: '#6b7280', requiresReason: true },
    { value: CandidateStatus.ON_HOLD, label: 'On Hold', color: '#eab308', requiresReason: true },
  ];

  useEffect(() => {
    fetchCandidateData();
    fetchStatusHistory();
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
      if (JSON.stringify(editedData.email) !== JSON.stringify(candidate.email))
        updateData.email = editedData.email;
      if (editedData.birthdate !== candidate.birthdate)
        updateData.birthdate = editedData.birthdate;
      if (editedData.roleApplied !== (candidate.roleApplied || ""))
        updateData.roleApplied = editedData.roleApplied;
      if (editedData.status !== candidate.status)
        updateData.status = editedData.status;
      if (
        JSON.stringify(editedData.socialLinks) !==
        JSON.stringify(candidate.socialLinks || [])
      ) {
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

  const handleProcessVideo = async (
    videoId: string,
    type: "interview" | "introduction"
  ) => {
    if (!id) return;
    if (
      !confirm(
        "Process this video with AI? This may take a few moments and will use API credits."
      )
    ) {
      return;
    }

    try {
      setProcessingVideo(videoId);
      if (type === "introduction") {
        await candidatesApi.processIntroductionVideo(id, videoId);
      } else if (type === "interview") {
        await candidatesApi.processInterviewVideo(id, videoId);
      }
      setToastMessage("Video processed successfully!");
      await fetchCandidateData();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error processing video:", error);
      setToastMessage("Failed to process video");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setProcessingVideo(null);
    }
  };

  const handleDeleteVideo = async (
    videoId: string,
    type: "interview" | "introduction"
  ) => {
    if (!id) return;
    if (
      !confirm(
        "Are you sure you want to delete this video? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingFile(videoId);
      if (type === "introduction") {
        await candidatesApi.deleteIntroductionVideo(id, videoId);
      }
      // Add interview video deletion when needed
      setToastMessage("Video deleted successfully!");
      await fetchCandidateData();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error deleting video:", error);
      setToastMessage("Failed to delete video");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setDeletingFile(null);
    }
  };

  const handleDeleteResume = async () => {
    if (!id) return;
    if (
      !confirm(
        "Are you sure you want to delete the resume? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingFile("resume");
      await candidatesApi.deleteResume(id);
      setToastMessage("Resume deleted successfully!");
      await fetchCandidateData();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error deleting resume:", error);
      setToastMessage("Failed to delete resume");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setDeletingFile(null);
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
          socialLinks: candidate.socialLinks || [],
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
        socialLinks: candidate.socialLinks || [],
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
        skills:
          candidate.skills?.map((s) => ({
            candidateSkillId: s.skillId,
            skillId: s.skillId,
            skillName: s.skillName,
            score: s.score || SKILL_SCORE.DEFAULT,
            evidence: s.evidence || "",
            source:
              s.addedBy === "AI"
                ? "ai"
                : s.addedBy === "HUMAN"
                ? "manual"
                : s.source || "ai",
            isAccepted: s.isAccepted,
          })) || [],
        experience:
          candidate.experience?.map((e) => ({
            experienceId: e.experienceId,
            description: e.description,
            title: e.title,
            role: e.role,
            startDate: e.startDate,
            endDate: e.endDate,
            source:
              e.addedBy === "AI"
                ? "ai"
                : e.addedBy === "HUMAN"
                ? "manual"
                : e.source || "ai",
          })) || [],
        education:
          candidate.education?.map((e) => ({
            educationId: e.educationId,
            description: e.description,
            institution: e.institution,
            startDate: e.startDate,
            endDate: e.endDate,
            source:
              e.addedBy === "AI"
                ? "ai"
                : e.addedBy === "HUMAN"
                ? "manual"
                : e.source || "ai",
          })) || [],
        certification:
          candidate.certification?.map((c) => ({
            certificationId: c.certificationId,
            description: c.description,
            certificationName: c.name || c.certificationName,
            issuingOrganization: c.issuingOrganization,
            issueDate: c.issueDate,
            source:
              c.addedBy === "AI"
                ? "ai"
                : c.addedBy === "HUMAN"
                ? "manual"
                : c.source || "ai",
          })) || [],
        strengths:
          candidate.strengths?.map((s) => ({
            strengthWeaknessId: s.strengthWeaknessId,
            name: s.name,
            description: s.description,
            type: "strength" as const,
            source:
              s.addedBy === "AI"
                ? "ai"
                : s.addedBy === "HUMAN"
                ? "manual"
                : s.source || "ai",
          })) || [],
        weaknesses:
          candidate.weaknesses?.map((w) => ({
            strengthWeaknessId: w.strengthWeaknessId,
            name: w.name,
            description: w.description,
            type: "weakness" as const,
            source:
              w.addedBy === "AI"
                ? "ai"
                : w.addedBy === "HUMAN"
                ? "manual"
                : w.source || "ai",
          })) || [],
      });
    }
  };

  const handleSaveResumeChanges = async () => {
    if (!id || !candidate) return;

    try {
      const promises: Promise<void>[] = [];

      // Process skills
      editedResumeData.skills.forEach((skill) => {
        if (skill.candidateSkillId) {
          const original = candidate.skills?.find(
            (s: any) => (s.candidateSkillId || s.skillId) === skill.candidateSkillId
          );
          if (
            original &&
            (original.skillName !== skill.skillName ||
              original.score !== skill.score ||
              original.evidence !== skill.evidence)
          ) {
            promises.push(resumeEditApi.updateSkill(id, skill));
          }
        } else if (skill.skillName.trim()) {
          promises.push(resumeEditApi.createSkill(id, skill));
        }
      });

      candidate.skills?.forEach((original: any) => {
        const candidateSkillId = original.candidateSkillId || original.skillId;
        const exists = editedResumeData.skills.find(
          (s) => s.candidateSkillId === candidateSkillId
        );
        if (!exists && candidateSkillId) {
          promises.push(resumeEditApi.deleteSkill(id, candidateSkillId));
        }
      });

      // Process experience
      editedResumeData.experience.forEach((exp) => {
        if (exp.experienceId) {
          const original = candidate.experience?.find(
            (e) => e.experienceId === exp.experienceId
          );
          if (original) {
            promises.push(resumeEditApi.updateExperience(id, exp));
          }
        } else if (exp.description.trim()) {
          promises.push(resumeEditApi.createExperience(id, exp));
        }
      });

      candidate.experience?.forEach((original) => {
        const exists = editedResumeData.experience.find(
          (e) => e.experienceId === original.experienceId
        );
        if (!exists && original.experienceId) {
          promises.push(
            resumeEditApi.deleteExperience(id, original.experienceId)
          );
        }
      });

      // Process education
      editedResumeData.education.forEach((edu) => {
        if (edu.educationId) {
          const original = candidate.education?.find(
            (e) => e.educationId === edu.educationId
          );
          if (original) {
            promises.push(resumeEditApi.updateEducation(id, edu));
          }
        } else if (edu.description.trim()) {
          promises.push(resumeEditApi.createEducation(id, edu));
        }
      });

      candidate.education?.forEach((original) => {
        const exists = editedResumeData.education.find(
          (e) => e.educationId === original.educationId
        );
        if (!exists && original.educationId) {
          promises.push(
            resumeEditApi.deleteEducation(id, original.educationId)
          );
        }
      });

      // Process certifications
      editedResumeData.certification.forEach((cert) => {
        if (cert.certificationId) {
          const original = candidate.certification?.find(
            (c) => c.certificationId === cert.certificationId
          );
          if (original) {
            promises.push(resumeEditApi.updateCertification(id, cert));
          }
        } else if (cert.description.trim()) {
          promises.push(resumeEditApi.createCertification(id, cert));
        }
      });

      candidate.certification?.forEach((original) => {
        const exists = editedResumeData.certification.find(
          (c) => c.certificationId === original.certificationId
        );
        if (!exists && original.certificationId) {
          promises.push(
            resumeEditApi.deleteCertification(id, original.certificationId)
          );
        }
      });

      // Process strengths
      editedResumeData.strengths.forEach((item) => {
        if (item.strengthWeaknessId) {
          const original = candidate.strengths?.find(
            (s) => s.strengthWeaknessId === item.strengthWeaknessId
          );
          if (original) {
            promises.push(resumeEditApi.updateStrengthWeakness(id, item));
          }
        } else if (item.description.trim()) {
          promises.push(resumeEditApi.createStrengthWeakness(id, item));
        }
      });

      candidate.strengths?.forEach((original) => {
        const exists = editedResumeData.strengths.find(
          (s) => s.strengthWeaknessId === original.strengthWeaknessId
        );
        if (!exists && original.strengthWeaknessId) {
          promises.push(
            resumeEditApi.deleteStrengthWeakness(
              id,
              original.strengthWeaknessId,
              "strength"
            )
          );
        }
      });

      // Process weaknesses
      editedResumeData.weaknesses.forEach((item) => {
        if (item.strengthWeaknessId) {
          const original = candidate.weaknesses?.find(
            (w) => w.strengthWeaknessId === item.strengthWeaknessId
          );
          if (original) {
            promises.push(resumeEditApi.updateStrengthWeakness(id, item));
          }
        } else if (item.description.trim()) {
          promises.push(resumeEditApi.createStrengthWeakness(id, item));
        }
      });

      candidate.weaknesses?.forEach((original) => {
        const exists = editedResumeData.weaknesses.find(
          (w) => w.strengthWeaknessId === original.strengthWeaknessId
        );
        if (!exists && original.strengthWeaknessId) {
          promises.push(
            resumeEditApi.deleteStrengthWeakness(
              id,
              original.strengthWeaknessId,
              "weakness"
            )
          );
        }
      });

      await Promise.all(promises);

      setToastMessage("Resume information updated successfully");
      setTimeout(() => setToastMessage(null), 3000);

      await fetchCandidateData();
    } catch (error) {
      console.error("Error saving resume changes:", error);
      
      // Check if it's a 404/500 error indicating missing endpoints
      const axiosError = error as any;
      if (axiosError?.response?.status === 500 || axiosError?.response?.status === 404) {
        setToastMessage("Resume editing is currently unavailable. The backend endpoints for individual skill/experience editing have not been implemented yet.");
      } else {
        setToastMessage("Failed to save resume changes");
      }
      setTimeout(() => setToastMessage(null), 5000);
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
    skills: transformToProfileItems(
      candidate.skills || [],
      "skillName",
      "skill"
    ),
    experience: transformToProfileItems(
      candidate.experience || [],
      "description",
      "experience"
    ),
    education: transformToProfileItems(
      candidate.education || [],
      "description",
      "education"
    ),
    certification: transformToProfileItems(
      candidate.certification || [],
      "description",
      "certification"
    ),
    strength: transformToProfileItems(
      candidate.strengths || [],
      "description",
      "strength"
    ),
    weaknesses: transformToProfileItems(
      candidate.weaknesses || [],
      "description",
      "weakness"
    ),
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

      {/* Tab Navigation */}
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Candidate Information
        </button>
        <button 
          className={`tab-button ${activeTab === 'score' ? 'active' : ''}`}
          onClick={() => setActiveTab('score')}
        >
          Predictive Success Score
        </button>
        <button 
          className={`tab-button ${activeTab === 'resume' ? 'active' : ''}`}
          onClick={() => setActiveTab('resume')}
        >
          Resume & Interview Analysis
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Status History
        </button>
        <button 
          className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="profile-content">
            <CandidateInfoSection
              candidate={candidate}
              isEditing={isEditing}
              editedData={editedData}
              uploadingTranscript={uploadingTranscript}
              uploadingInterviewVideo={uploadingInterviewVideo}
              uploadingIntroductionVideo={uploadingIntroductionVideo}
              processingVideo={processingVideo}
              deletingFile={deletingFile}
              onEditToggle={handleEditToggle}
              onCancelEdit={handleCancelEdit}
              onEditedDataChange={setEditedData}
              onTranscriptUpload={handleTranscriptUpload}
              onInterviewVideoUpload={handleInterviewVideoUpload}
              onIntroductionVideoUpload={handleIntroductionVideoUpload}
              onProcessVideo={handleProcessVideo}
              onDeleteVideo={handleDeleteVideo}
              onDeleteResume={handleDeleteResume}
              onDownload={handleDownload}
              onStatusChangeClick={() => {
                console.log('onStatusChangeClick called from Profile');
                console.log('showStatusDialog before:', showStatusDialog);
                setShowStatusDialog(true);
                console.log('setShowStatusDialog(true) called');
              }}
            />
          </div>
        )}

        {activeTab === 'score' && (
          <CandidateScoreSection candidateId={id!} candidateName={candidate.name} />
        )}

        {activeTab === 'resume' && (
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

            {/* Introduction Video Analysis */}
            {candidate.introductionVideos &&
              candidate.introductionVideos.length > 0 && (
                <VideoAnalysisSection
                  videos={candidate.introductionVideos}
                  videoType="introduction"
                />
              )}

            {/* Interview Video Analysis */}
            {candidate.interviewVideos && candidate.interviewVideos.length > 0 && (
              <VideoAnalysisSection
                videos={candidate.interviewVideos}
                videoType="interview"
              />
            )}

            <PersonalitySection
              personality={personality}
              radarData={radarData}
              isEditing={isEditing}
              onEditToggle={handleEditToggle}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="status-history-container">
            <div className="status-history-header">
              <div>
                <h2 className="status-history-title">Recruitment Journey Timeline</h2>
                <p className="status-history-subtitle">
                  Track the candidate's progression through the hiring pipeline
                </p>
              </div>
              {statusHistory.length > 0 && (
                <div className="status-history-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Changes</span>
                    <span className="stat-value">{statusHistory.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Current Status</span>
                    <span className="stat-value status-badge">{candidate.status}</span>
                  </div>
                </div>
              )}
            </div>
            {loadingHistory ? (
              <div className="loading-history">
                <p>Loading status history...</p>
              </div>
            ) : (
              <StatusHistoryTimeline statusHistory={statusHistory} />
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <Comments entityType={CommentEntityType.CANDIDATE} entityId={id!} />
        )}
      </div>

      {showDetailModal && (
        <ProfileDetailModal
          selectedItem={selectedItem}
          onClose={closeDetailModal}
        />
      )}

      {showStatusDialog && candidate && (
        <StatusChangeDialog
          isOpen={showStatusDialog}
          onClose={() => setShowStatusDialog(false)}
          onStatusChange={handleStatusChange}
          currentStatus={candidate.status}
          candidateName={candidate.name}
          availableStatuses={availableStatuses}
          loading={statusChanging}
        />
      )}
    </main>
  );
};

export default Profile;
