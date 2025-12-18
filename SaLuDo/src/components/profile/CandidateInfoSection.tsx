import React from "react";
import { CandidateProfile } from "../../types/profile";
import {
  formatDate,
  getFileDownloadUrl,
  getTranscriptDownloadUrl,
  getInterviewVideoDownloadUrl,
  getIntroductionVideoDownloadUrl,
} from "./profileUtils";

interface CandidateInfoSectionProps {
  candidate: CandidateProfile;
  isEditing: boolean;
  editedData: {
    name: string;
    email: string[];
    birthdate: string;
    roleApplied: string;
    status: string;
    socialLinks: { url: string }[];
  };
  uploadingTranscript: boolean;
  uploadingInterviewVideo: boolean;
  uploadingIntroductionVideo: boolean;
  processingVideo: string | null;
  deletingFile: string | null;
  onEditToggle: () => void;
  onCancelEdit: () => void;
  onEditedDataChange: (data: any) => void;
  onTranscriptUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInterviewVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onIntroductionVideoUpload: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onProcessVideo: (videoId: string, type: "interview" | "introduction") => void;
  onDeleteVideo: (videoId: string, type: "interview" | "introduction") => void;
  onDeleteResume: () => void;
  onDownload: (
    filename: string,
    type: "resume" | "transcript" | "interview-video" | "introduction-video"
  ) => void;
  onStatusChangeClick?: () => void;
}

export const CandidateInfoSection: React.FC<CandidateInfoSectionProps> = ({
  candidate,
  isEditing,
  editedData,
  uploadingTranscript,
  uploadingInterviewVideo,
  uploadingIntroductionVideo,
  processingVideo,
  deletingFile,
  onEditToggle,
  onCancelEdit,
  onEditedDataChange,
  onTranscriptUpload,
  onInterviewVideoUpload,
  onIntroductionVideoUpload,
  onProcessVideo,
  onDeleteVideo,
  onDeleteResume,
  onDownload,
  onStatusChangeClick,
}) => {
  return (
    <div className="info-box">
      <div className="box-header">
        <h3>Candidate Information</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          {isEditing && (
            <button
              className="edit-btn"
              onClick={onCancelEdit}
              style={{ backgroundColor: "#6b7280" }}
            >
              Cancel
            </button>
          )}
          <button className="edit-btn" onClick={onEditToggle}>
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>
      </div>
      <div className="box-content">
        <div className="info-item">
          <div className="info-label">Full Name</div>
          <div className="info-value">
            {isEditing ? (
              <input
                type="text"
                value={editedData.name}
                onChange={(e) =>
                  onEditedDataChange({ ...editedData, name: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            ) : (
              candidate.name
            )}
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">Email Address</div>
          <div className="info-value">
            {isEditing ? (
              <input
                type="email"
                value={editedData.email.join(", ")}
                onChange={(e) => {
                  const emails = e.target.value
                    .split(",")
                    .map((email) => email.trim());
                  onEditedDataChange({ ...editedData, email: emails });
                }}
                placeholder="email1@example.com, email2@example.com"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            ) : (
              candidate.email.join(", ")
            )}
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">Birth Date</div>
          <div className="info-value">
            {isEditing ? (
              <input
                type="date"
                value={editedData.birthdate.split("T")[0]}
                onChange={(e) =>
                  onEditedDataChange({
                    ...editedData,
                    birthdate: e.target.value,
                  })
                }
                style={{
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            ) : (
              formatDate(candidate.birthdate)
            )}
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">Application Date</div>
          <div className="info-value">{formatDate(candidate.dateCreated)}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Last Updated</div>
          <div className="info-value">{formatDate(candidate.dateUpdated)}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Role Applied</div>
          <div className="info-value">
            {isEditing ? (
              <input
                type="text"
                value={editedData.roleApplied}
                onChange={(e) =>
                  onEditedDataChange({
                    ...editedData,
                    roleApplied: e.target.value,
                  })
                }
                placeholder="e.g., Software Engineer, Data Analyst"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            ) : (
              candidate.roleApplied || "Not specified"
            )}
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">Social Links</div>
          <div className="info-value">
            {isEditing ? (
              <div>
                {editedData.socialLinks.map((link, index) => (
                  <div
                    key={index}
                    style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                  >
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...editedData.socialLinks];
                        newLinks[index] = { url: e.target.value };
                        onEditedDataChange({
                          ...editedData,
                          socialLinks: newLinks,
                        });
                      }}
                      placeholder="https://linkedin.com/in/yourname"
                      style={{
                        flex: 1,
                        padding: "8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newLinks = editedData.socialLinks.filter(
                          (_, i) => i !== index
                        );
                        onEditedDataChange({
                          ...editedData,
                          socialLinks: newLinks,
                        });
                      }}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    onEditedDataChange({
                      ...editedData,
                      socialLinks: [...editedData.socialLinks, { url: "" }],
                    });
                  }}
                  style={{
                    marginTop: "8px",
                    padding: "8px 12px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Add Social Link
                </button>
              </div>
            ) : candidate.socialLinks && candidate.socialLinks.length > 0 ? (
              candidate.socialLinks.map((link: any, index: number) => {
                const getPlatformFromUrl = (url: string) => {
                  try {
                    const hostname = new URL(url).hostname.toLowerCase();
                    if (hostname.includes("linkedin")) return "LinkedIn";
                    if (hostname.includes("github")) return "GitHub";
                    if (hostname.includes("twitter")) return "Twitter";
                    if (hostname.includes("instagram")) return "Instagram";
                    if (hostname.includes("behance")) return "Behance";
                    if (hostname.includes("dribbble")) return "Dribbble";
                    if (hostname.includes("youtube")) return "YouTube";
                    if (hostname.includes("medium")) return "Medium";
                    return "Website";
                  } catch {
                    return "Link";
                  }
                };

                const platform = link.platform || getPlatformFromUrl(link.url);

                return (
                  <div key={index} style={{ marginBottom: "5px" }}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#3b82f6",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <strong>{platform}:</strong> {link.url}
                    </a>
                  </div>
                );
              })
            ) : (
              <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                No social links provided
              </span>
            )}
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">Resume</div>
          <div className="info-value">
            {candidate.resumeMetadata || candidate.resume ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href={getFileDownloadUrl(
                    (candidate.resumeMetadata || candidate.resume)!.fileId
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="download-link"
                  onClick={(e) => {
                    e.preventDefault();
                    const resumeData =
                      candidate.resumeMetadata || candidate.resume;
                    window.open(
                      getFileDownloadUrl(resumeData!.fileId),
                      "_blank"
                    );
                    onDownload(resumeData!.filename, "resume");
                  }}
                >
                  {(candidate.resumeMetadata || candidate.resume)!.filename} ↓
                </a>
                {isEditing && (
                  <button
                    onClick={onDeleteResume}
                    disabled={deletingFile === "resume"}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      opacity: deletingFile === "resume" ? 0.5 : 1,
                    }}
                  >
                    {deletingFile === "resume" ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
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
                {candidate.transcripts.map((transcript: any, idx: number) => (
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
                        onDownload(transcript.filename, "transcript");
                      }}
                    >
                      {transcript.filename} ↓
                    </a>
                    {idx < candidate.transcripts!.length - 1 && ", "}
                  </span>
                ))}
              </p>
            ) : (
              <div>
                <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                  No transcripts uploaded
                </span>
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
                    {uploadingTranscript ? "Uploading..." : "Upload Transcript"}
                  </label>
                  <input
                    id="transcript-upload"
                    type="file"
                    accept=".txt,.pdf,.mp3,.wav,.m4a,.ogg,.docx"
                    onChange={onTranscriptUpload}
                    disabled={uploadingTranscript}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="info-item">
          <div className="info-label">Interview Video</div>
          <div className="info-value">
            {candidate.interviewVideos &&
            candidate.interviewVideos.length > 0 ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {candidate.interviewVideos.map((video: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      padding: "8px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "4px",
                    }}
                  >
                    <a
                      href={getInterviewVideoDownloadUrl(
                        candidate.candidateId,
                        video.fileId
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="download-link"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(
                          getInterviewVideoDownloadUrl(
                            candidate.candidateId,
                            video.fileId
                          ),
                          "_blank"
                        );
                        onDownload(video.filename, "interview-video");
                      }}
                    >
                      {video.filename} ↓
                    </a>
                    {video.videoAnalysis && (
                      <span style={{ color: "#16a34a", fontSize: "12px" }}>
                        ✓ Analyzed
                      </span>
                    )}
                    {!video.videoAnalysis && (
                      <button
                        onClick={() =>
                          onProcessVideo(video.fileId, "interview")
                        }
                        disabled={processingVideo === video.fileId}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#2563eb",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          opacity: processingVideo === video.fileId ? 0.5 : 1,
                        }}
                      >
                        {processingVideo === video.fileId
                          ? "Processing..."
                          : "Analyze Video"}
                      </button>
                    )}
                    {isEditing && (
                      <button
                        onClick={() => onDeleteVideo(video.fileId, "interview")}
                        disabled={deletingFile === video.fileId}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          opacity: deletingFile === video.fileId ? 0.5 : 1,
                        }}
                      >
                        {deletingFile === video.fileId
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                  No interview videos uploaded
                </span>
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
                    onChange={onInterviewVideoUpload}
                    disabled={uploadingInterviewVideo}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="info-item">
          <div className="info-label">Introduction Video</div>
          <div className="info-value">
            {candidate.introductionVideos &&
            candidate.introductionVideos.length > 0 ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {candidate.introductionVideos.map((video: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      padding: "8px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "4px",
                    }}
                  >
                    <a
                      href={getIntroductionVideoDownloadUrl(
                        candidate.candidateId,
                        video.fileId
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="download-link"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(
                          getIntroductionVideoDownloadUrl(
                            candidate.candidateId,
                            video.fileId
                          ),
                          "_blank"
                        );
                        onDownload(video.filename, "introduction-video");
                      }}
                    >
                      {video.filename} ↓
                    </a>
                    {video.videoAnalysis && (
                      <span style={{ color: "#16a34a", fontSize: "12px" }}>
                        ✓ Analyzed
                      </span>
                    )}
                    {!video.videoAnalysis && (
                      <button
                        onClick={() =>
                          onProcessVideo(video.fileId, "introduction")
                        }
                        disabled={processingVideo === video.fileId}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#2563eb",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          opacity: processingVideo === video.fileId ? 0.5 : 1,
                        }}
                      >
                        {processingVideo === video.fileId
                          ? "Processing..."
                          : "Analyze Video"}
                      </button>
                    )}
                    {isEditing && (
                      <button
                        onClick={() =>
                          onDeleteVideo(video.fileId, "introduction")
                        }
                        disabled={deletingFile === video.fileId}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          opacity: deletingFile === video.fileId ? 0.5 : 1,
                        }}
                      >
                        {deletingFile === video.fileId
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                  No introduction videos uploaded
                </span>
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
                    onChange={onIntroductionVideoUpload}
                    disabled={uploadingIntroductionVideo}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="info-item">
          <div className="info-label">Current Status</div>
          <div className="info-value">
            {isEditing ? (
              <select
                value={editedData.status}
                onChange={(e) =>
                  onEditedDataChange({ ...editedData, status: e.target.value })
                }
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                <option value="For Review">For Review</option>
                <option value="Paper Screening">Paper Screening</option>
                <option value="Exam">Exam</option>
                <option value="HR Interview">HR Interview</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="Final Interview">Final Interview</option>
                <option value="For Job Offer">For Job Offer</option>
                <option value="Offer Extended">Offer Extended</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
                <option value="On Hold">On Hold</option>
              </select>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  className={`status-badge ${
                    candidate.status?.toLowerCase().replace(/ /g, '-') || "for-review"
                  }`}
                >
                  {candidate.status || "No Status"}
                </span>
                {onStatusChangeClick && (
                  <button
                    onClick={() => {
                      console.log('Change Status button clicked');
                      console.log('onStatusChangeClick:', onStatusChangeClick);
                      onStatusChangeClick();
                    }}
                    style={{
                      padding: "0.4rem 0.8rem",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "0.375rem",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
                  >
                    Change Status
                  </button>
                )}
              </div>
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
  );
};
