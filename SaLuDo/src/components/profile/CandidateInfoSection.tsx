import React from "react";
import { CandidateProfile } from "../../types/profile";
import { formatDate, getFileDownloadUrl, getTranscriptDownloadUrl, getInterviewVideoDownloadUrl, getIntroductionVideoDownloadUrl } from "./profileUtils";

interface CandidateInfoSectionProps {
  candidate: CandidateProfile;
  isEditing: boolean;
  editedStatus: string;
  uploadingTranscript: boolean;
  uploadingInterviewVideo: boolean;
  uploadingIntroductionVideo: boolean;
  onEditToggle: () => void;
  onStatusChange: (status: string) => void;
  onTranscriptUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInterviewVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onIntroductionVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownload: (filename: string, type: "resume" | "transcript" | "interview-video" | "introduction-video") => void;
}

export const CandidateInfoSection: React.FC<CandidateInfoSectionProps> = ({
  candidate,
  isEditing,
  editedStatus,
  uploadingTranscript,
  uploadingInterviewVideo,
  uploadingIntroductionVideo,
  onEditToggle,
  onStatusChange,
  onTranscriptUpload,
  onInterviewVideoUpload,
  onIntroductionVideoUpload,
  onDownload
}) => {
  return (
    <div className="info-box">
      <div className="box-header">
        <h3>Candidate Information</h3>
        <button className="edit-btn" onClick={onEditToggle}>
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
        {candidate.socialLinks && candidate.socialLinks.length > 0 && (
          <div className="info-item">
            <div className="info-label">Social Links</div>
            <div className="info-value">
              {candidate.socialLinks.map((link: any, index: number) => (
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
                    <strong>{link.platform}:</strong> {link.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
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
                  onDownload(
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
                          onDownload(transcript.filename, "transcript");
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
                      onChange={onTranscriptUpload}
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
                {((!candidate.transcripts || candidate.transcripts.length === 0) || isEditing) && (
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
                      onChange={onTranscriptUpload}
                      disabled={uploadingTranscript}
                      style={{ display: "none" }}
                    />
                  </div>
                )}
              </p>
            )}
          </div>
        </div>

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
                        href={getInterviewVideoDownloadUrl(candidate.candidateId, video.fileId)}
                        target="_blank"
                        rel="noreferrer"
                        className="download-link"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(
                            getInterviewVideoDownloadUrl(candidate.candidateId, video.fileId),
                            "_blank"
                          );
                          onDownload(video.filename, "interview-video");
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
                      onChange={onInterviewVideoUpload}
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
                {((!candidate.interviewVideos || candidate.interviewVideos.length === 0) || isEditing) && (
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
                )}
              </p>
            )}
          </div>
        </div>

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
                        href={getIntroductionVideoDownloadUrl(candidate.candidateId, video.fileId)}
                        target="_blank"
                        rel="noreferrer"
                        className="download-link"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(
                            getIntroductionVideoDownloadUrl(candidate.candidateId, video.fileId),
                            "_blank"
                          );
                          onDownload(
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
                      onChange={onIntroductionVideoUpload}
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
                {((!candidate.introductionVideos || candidate.introductionVideos.length === 0) || isEditing) && (
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
                onChange={(e) => onStatusChange(e.target.value)}
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
  );
};
