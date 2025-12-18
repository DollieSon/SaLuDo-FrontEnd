import React from "react";
import { VideoMetadata } from "../../types/profile";

interface VideoAnalysisSectionProps {
  videos: VideoMetadata[];
  videoType: "interview" | "introduction";
}

// Helper function to download transcript as .txt file
const downloadTranscript = (transcript: string, videoFilename: string) => {
  const blob = new Blob([transcript], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  // Create filename based on video filename
  const baseFilename = videoFilename.replace(/\.[^/.]+$/, ""); // Remove extension
  link.download = `${baseFilename}_transcript.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const VideoAnalysisSection: React.FC<VideoAnalysisSectionProps> = ({
  videos,
  videoType,
}) => {
  // Filter only analyzed videos
  const analyzedVideos = videos.filter((v) => v.videoAnalysis);

  if (analyzedVideos.length === 0) {
    return null; // Don't show section if no analyzed videos
  }

  const title =
    videoType === "introduction"
      ? "Introduction Video Analysis"
      : "Interview Video Analysis";

  return (
    <div className="info-box">
      <div className="box-header">
        <h3>{title}</h3>
      </div>
      <div className="box-content">
        {analyzedVideos.map((video, index) => {
          const analysis = video.videoAnalysis!;
          return (
            <div
              key={index}
              style={{
                marginBottom: index < analyzedVideos.length - 1 ? "30px" : "0",
              }}
            >
              {/* Video filename header */}
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "6px",
                  marginBottom: "15px",
                  fontWeight: "600",
                }}
              >
                {video.filename}
              </div>

              {/* Overall Score */}
              {analysis.overallImpression && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "10px", color: "#374151" }}>
                    Overall Impression
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        color: "#2563eb",
                      }}
                    >
                      {analysis.overallImpression.score}/10
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          width: "100%",
                          height: "10px",
                          backgroundColor: "#e5e7eb",
                          borderRadius: "5px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${
                              (analysis.overallImpression.score / 10) * 100
                            }%`,
                            height: "100%",
                            backgroundColor: "#2563eb",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
                    {analysis.overallImpression.summary}
                  </p>

                  {/* Strengths */}
                  {analysis.overallImpression.strengths &&
                    analysis.overallImpression.strengths.length > 0 && (
                      <div style={{ marginTop: "15px" }}>
                        <strong style={{ color: "#059669" }}>Strengths:</strong>
                        <ul
                          style={{
                            marginTop: "5px",
                            paddingLeft: "20px",
                            color: "#374151",
                          }}
                        >
                          {analysis.overallImpression.strengths.map(
                            (strength, idx) => (
                              <li key={idx}>{strength}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Areas for Improvement */}
                  {analysis.overallImpression.areasForImprovement &&
                    analysis.overallImpression.areasForImprovement.length >
                      0 && (
                      <div style={{ marginTop: "15px" }}>
                        <strong style={{ color: "#dc2626" }}>
                          Areas for Improvement:
                        </strong>
                        <ul
                          style={{
                            marginTop: "5px",
                            paddingLeft: "20px",
                            color: "#374151",
                          }}
                        >
                          {analysis.overallImpression.areasForImprovement.map(
                            (area, idx) => (
                              <li key={idx}>{area}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              )}

              {/* Communication Skills */}
              {analysis.communicationSkills && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "10px", color: "#374151" }}>
                    Communication Skills
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <MetricBar
                      label="Clarity"
                      value={analysis.communicationSkills.clarity}
                    />
                    <MetricBar
                      label="Articulateness"
                      value={analysis.communicationSkills.articulateness}
                    />
                    <MetricBar
                      label="Pace"
                      value={analysis.communicationSkills.pace}
                    />
                    <MetricBar
                      label="Confidence"
                      value={analysis.communicationSkills.confidence}
                    />
                  </div>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      fontStyle: "italic",
                    }}
                  >
                    {analysis.communicationSkills.evidence}
                  </p>
                </div>
              )}

              {/* Non-Verbal Cues */}
              {analysis.nonVerbalCues && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "10px", color: "#374151" }}>
                    Non-Verbal Cues
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <MetricBar
                      label="Eye Contact"
                      value={analysis.nonVerbalCues.eyeContact}
                    />
                    <MetricBar
                      label="Body Language"
                      value={analysis.nonVerbalCues.bodyLanguage}
                    />
                    <MetricBar
                      label="Facial Expressions"
                      value={analysis.nonVerbalCues.facialExpressions}
                    />
                    <MetricBar
                      label="Overall Presence"
                      value={analysis.nonVerbalCues.overallPresence}
                    />
                  </div>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      fontStyle: "italic",
                    }}
                  >
                    {analysis.nonVerbalCues.evidence}
                  </p>
                </div>
              )}

              {/* Content Quality */}
              {analysis.contentQuality && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "10px", color: "#374151" }}>
                    Content Quality
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <MetricBar
                      label="Relevance"
                      value={analysis.contentQuality.relevance}
                    />
                    <MetricBar
                      label="Depth"
                      value={analysis.contentQuality.depth}
                    />
                    <MetricBar
                      label="Structure"
                      value={analysis.contentQuality.structure}
                    />
                    <MetricBar
                      label="Examples"
                      value={analysis.contentQuality.examples}
                    />
                  </div>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      fontStyle: "italic",
                    }}
                  >
                    {analysis.contentQuality.evidence}
                  </p>
                </div>
              )}

              {/* Transcribed Text */}
              {analysis.transcribedText && (
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <h4 style={{ margin: 0, color: "#374151" }}>Transcript</h4>
                    <button
                      onClick={() =>
                        downloadTranscript(
                          analysis.transcribedText!,
                          video.filename
                        )
                      }
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span>↓</span> Download Transcript
                    </button>
                  </div>
                  <div
                    style={{
                      padding: "15px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    <p
                      style={{
                        color: "#374151",
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {analysis.transcribedText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper component for metric bars
const MetricBar: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => {
  const getColor = (val: number) => {
    if (val >= 8) return "#059669"; // green
    if (val >= 6) return "#f59e0b"; // orange
    return "#dc2626"; // red
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "5px",
          fontSize: "13px",
        }}
      >
        <span style={{ color: "#6b7280" }}>{label}</span>
        <span style={{ fontWeight: "600", color: getColor(value) }}>
          {value.toFixed(1)}/10
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: "6px",
          backgroundColor: "#e5e7eb",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${(value / 10) * 100}%`,
            height: "100%",
            backgroundColor: getColor(value),
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
};
