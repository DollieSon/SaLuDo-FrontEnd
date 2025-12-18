import React, { useState, useEffect } from "react";
import {
  CandidateData,
  SkillData,
  ExperienceData,
  EducationData,
  CertificationData,
} from "../../CandidateApiTypes";
import {
  CandidateApiClient,
  SkillsApiClient,
  ExperienceApiClient,
  EducationApiClient,
} from "../../CandidateApiClient";
import { candidatesApi } from "../../../src/utils/api";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";

interface CandidateProfileProps {
  candidateId: string;
  onEdit?: () => void;
  onBack?: () => void;
}

const CandidateProfile: React.FC<CandidateProfileProps> = ({
  candidateId,
  onEdit,
  onBack,
}) => {
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "skills" | "experience" | "education" | "personality"
  >("overview");
  const [videos, setVideos] = useState<any[]>([]);
  const [processingVideo, setProcessingVideo] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  const candidateClient = new CandidateApiClient();
  const skillsClient = new SkillsApiClient();
  const experienceClient = new ExperienceApiClient();
  const educationClient = new EducationApiClient();

  useEffect(() => {
    loadCandidate();
    loadVideos();
  }, [candidateId]);

  const loadCandidate = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await candidateClient.getCandidate(candidateId);

      if (response.success && response.data) {
        setCandidate(response.data);
      } else {
        setError(response.message || "Failed to load candidate");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async () => {
    try {
      const response = await candidatesApi.getIntroductionVideos(candidateId);
      if (response.success && response.data) {
        setVideos(response.data);
      }
    } catch (err) {
      console.error("Failed to load videos:", err);
    }
  };

  const handleProcessVideo = async (videoId: string) => {
    if (
      !confirm(
        "Process this video with AI? This may take a few moments and will use API credits."
      )
    ) {
      return;
    }

    try {
      setProcessingVideo(videoId);
      await candidatesApi.processIntroductionVideo(candidateId, videoId);
      alert("Video processed successfully! Refresh to see results.");
      await loadVideos();
    } catch (err) {
      alert(
        "Failed to process video: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setProcessingVideo(null);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this video? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingFile(videoId);
      await candidatesApi.deleteIntroductionVideo(candidateId, videoId);
      alert("Video deleted successfully!");
      await loadVideos();
    } catch (err) {
      alert(
        "Failed to delete video: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setDeletingFile(null);
    }
  };

  const handleDeleteResume = async () => {
    if (
      !confirm(
        "Are you sure you want to delete the resume? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingFile("resume");
      await candidatesApi.deleteResume(candidateId);
      alert("Resume deleted successfully!");
      await loadCandidate();
    } catch (err) {
      alert(
        "Failed to delete resume: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setDeletingFile(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSkillLevelColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800";
    if (score >= 6) return "bg-blue-100 text-blue-800";
    if (score >= 4) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getSkillLevelText = (score: number) => {
    if (score >= 8) return "Expert";
    if (score >= 6) return "Advanced";
    if (score >= 4) return "Intermediate";
    return "Beginner";
  };

  if (loading) return <LoadingSpinner message="Loading candidate profile..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadCandidate} />;
  if (!candidate) return <ErrorMessage message="Candidate not found" />;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{candidate.name}</h1>
            <p className="text-blue-100 mt-1">{candidate.email[0]}</p>
            {candidate.roleApplied && (
              <p className="text-blue-100 mt-1">
                Applied for: {candidate.roleApplied}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
              {candidate.status}
            </span>
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors"
              >
                Edit Profile
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-md hover:bg-opacity-30 transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">
              {candidate.skills?.length || 0}
            </div>
            <div className="text-sm text-blue-100">Skills</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">
              {candidate.experience?.length || 0}
            </div>
            <div className="text-sm text-blue-100">Experience</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">
              {candidate.education?.length || 0}
            </div>
            <div className="text-sm text-blue-100">Education</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">
              {candidate.certification?.length || 0}
            </div>
            <div className="text-sm text-blue-100">Certifications</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: "overview", label: "Overview" },
            { id: "skills", label: "Skills" },
            { id: "experience", label: "Experience" },
            { id: "education", label: "Education" },
            { id: "personality", label: "Personality" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Name:
                  </span>
                  <p className="text-gray-900">{candidate.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Email:
                  </span>
                  <div className="space-y-1">
                    {candidate.email.map((email, index) => (
                      <p key={index} className="text-gray-900">
                        {email}
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Date of Birth:
                  </span>
                  <p className="text-gray-900">
                    {formatDate(candidate.birthdate)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Status:
                  </span>
                  <p className="text-gray-900">{candidate.status}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Applied:
                  </span>
                  <p className="text-gray-900">
                    {formatDate(candidate.dateCreated)}
                  </p>
                </div>
              </div>
            </div>

            {/* Resume Information */}
            {candidate.resumeMetadata && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Resume</h3>
                  <button
                    onClick={handleDeleteResume}
                    disabled={deletingFile === "resume"}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingFile === "resume"
                      ? "Deleting..."
                      : "Delete Resume"}
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      File:
                    </span>
                    <p className="text-gray-900">
                      {candidate.resumeMetadata.filename}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Size:
                    </span>
                    <p className="text-gray-900">
                      {(candidate.resumeMetadata.size / 1024 / 1024).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Uploaded:
                    </span>
                    <p className="text-gray-900">
                      {formatDate(candidate.resumeMetadata.uploadedAt)}
                    </p>
                  </div>
                  {candidate.resumeMetadata.parseStatus && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Parse Status:
                      </span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded ${
                          candidate.resumeMetadata.parseStatus === "completed"
                            ? "bg-green-100 text-green-800"
                            : candidate.resumeMetadata.parseStatus === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {candidate.resumeMetadata.parseStatus}
                      </span>
                    </div>
                  )}
                  <div>
                    <a
                      href={candidatesApi.getFileDownloadUrl(
                        candidate.resumeMetadata.fileId
                      )}
                      download
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Download Resume
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Introduction Videos */}
            {videos.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Introduction Videos
                </h3>
                <div className="space-y-4">
                  {videos.map((video) => (
                    <div
                      key={video.videoId}
                      className="bg-white p-4 rounded border"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            Video {video.videoId.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Uploaded: {formatDate(video.uploadedAt)}
                          </p>
                          {video.analysis && (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-green-700">
                                ✓ AI Analysis Complete
                              </p>
                              {video.analysis.overallImpression && (
                                <p className="text-sm text-gray-700">
                                  Score:{" "}
                                  {video.analysis.overallImpression.score}/10
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!video.analysis && (
                            <button
                              onClick={() => handleProcessVideo(video.videoId)}
                              disabled={processingVideo === video.videoId}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              {processingVideo === video.videoId
                                ? "Processing..."
                                : "Analyze Video"}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteVideo(video.videoId)}
                            disabled={deletingFile === video.videoId}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingFile === video.videoId
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                      {video.analysis?.transcribedText && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium text-gray-600">
                            Transcript:
                          </p>
                          <p className="text-sm text-gray-800 mt-1">
                            {video.analysis.transcribedText}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Skills</h3>
            {candidate.skills && candidate.skills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {candidate.skills.map((skill, index) => (
                  <div
                    key={`${skill.candidateSkillId}-${index}`}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        {skill.skillId}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getSkillLevelColor(
                          skill.score
                        )}`}
                      >
                        {getSkillLevelText(skill.score)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Score</span>
                        <span>{skill.score}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(skill.score / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    {skill.evidence && (
                      <p className="text-sm text-gray-600">{skill.evidence}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Added by: {skill.addedBy}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No skills added yet.</p>
            )}
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === "experience" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
            {candidate.experience && candidate.experience.length > 0 ? (
              <div className="space-y-6">
                {candidate.experience.map((exp, index) => (
                  <div
                    key={`${exp.experienceId}-${index}`}
                    className="bg-gray-50 rounded-lg p-6"
                  >
                    <h4 className="text-lg font-semibold text-gray-900">
                      {exp.title}
                    </h4>
                    <p className="text-blue-600 font-medium">{exp.role}</p>
                    {exp.description && (
                      <p className="text-gray-600 mt-2">{exp.description}</p>
                    )}
                    <div className="text-sm text-gray-500 mt-3">
                      Added: {formatDate(exp.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No work experience added yet.</p>
            )}
          </div>
        )}

        {/* Education Tab */}
        {activeTab === "education" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Education</h3>
            {candidate.education && candidate.education.length > 0 ? (
              <div className="space-y-6">
                {candidate.education.map((edu, index) => (
                  <div
                    key={`${edu.educationId}-${index}`}
                    className="bg-gray-50 rounded-lg p-6"
                  >
                    <h4 className="text-lg font-semibold text-gray-900">
                      {edu.institution}
                    </h4>
                    <div className="text-gray-600 mt-1">
                      {formatDate(edu.startDate)}
                      {edu.endDate && ` - ${formatDate(edu.endDate)}`}
                    </div>
                    {edu.description && (
                      <p className="text-gray-600 mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No education history added yet.</p>
            )}
          </div>
        )}

        {/* Personality Tab */}
        {activeTab === "personality" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Personality Assessment
            </h3>
            {candidate.personality ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(candidate.personality).map(([key, value]) => {
                  if (
                    key === "candidateId" ||
                    key === "dateAssessed" ||
                    key === "updatedAt" ||
                    key === "assessment"
                  )
                    return null;

                  return (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Score</span>
                          <span>{value}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">
                No personality assessment completed yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;
