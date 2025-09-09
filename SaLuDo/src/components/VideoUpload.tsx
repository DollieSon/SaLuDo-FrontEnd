import React, { useState, useRef, useCallback } from "react";

export interface VideoUploadProps {
  candidateId: string;
  videoType: "interview" | "introduction";
  onFileSelect: (
    file: File,
    videoType: "interview" | "introduction",
    metadata?: VideoMetadata
  ) => void;
  onUpload?: (
    file: File,
    videoType: "interview" | "introduction",
    metadata?: VideoMetadata
  ) => Promise<void>;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  disabled?: boolean;
}

export interface VideoMetadata {
  interviewRound?: string;
  duration?: number;
  resolution?: string;
  frameRate?: number;
  bitrate?: number;
  description?: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  candidateId,
  videoType,
  onFileSelect,
  onUpload,
  acceptedTypes = [
    "video/mp4",
    "video/webm",
    "video/avi",
    "video/mov",
    "video/wmv",
    "video/flv",
    "video/mkv",
    "video/m4v",
  ],
  maxSizeBytes = 500 * 1024 * 1024, // 500MB
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewRound, setInterviewRound] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Please upload a video file. Supported formats: ${acceptedTypes
        .map((t) => t.split("/")[1].toUpperCase())
        .join(", ")}`;
    }

    if (file.size > maxSizeBytes) {
      const maxSizeMB = maxSizeBytes / (1024 * 1024);
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const getVideoMetadata = (file: File): Promise<VideoMetadata> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        const metadata: VideoMetadata = {
          duration: Math.round(video.duration),
          resolution: `${video.videoWidth}x${video.videoHeight}`,
          interviewRound:
            videoType === "interview" ? interviewRound || undefined : undefined,
          description: description || undefined,
        };

        // Clean up
        window.URL.revokeObjectURL(video.src);
        resolve(metadata);
      };

      video.onerror = () => {
        // Clean up and resolve with basic metadata
        window.URL.revokeObjectURL(video.src);
        resolve({
          interviewRound:
            videoType === "interview" ? interviewRound || undefined : undefined,
          description: description || undefined,
        });
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);

      try {
        // Get video metadata
        const metadata = await getVideoMetadata(file);
        onFileSelect(file, videoType, metadata);

        if (onUpload) {
          setUploading(true);
          await onUpload(file, videoType, metadata);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [
      onFileSelect,
      onUpload,
      videoType,
      interviewRound,
      description,
      maxSizeBytes,
      acceptedTypes,
    ]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Video Type Info */}
      <div className="text-sm text-gray-600">
        <p className="font-medium">
          {videoType === "interview"
            ? "Interview Video Upload"
            : "Introduction Video Upload"}
        </p>
        <p className="text-xs text-gray-500">
          {videoType === "interview"
            ? "Upload recorded interview sessions for analysis and review"
            : "Upload your personal introduction video to showcase yourself"}
        </p>
      </div>

      {/* Interview Round Selection (only for interview videos) */}
      {videoType === "interview" && (
        <div>
          <label
            htmlFor="interviewRound"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Interview Round (Optional)
          </label>
          <select
            id="interviewRound"
            value={interviewRound}
            onChange={(e) => setInterviewRound(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={disabled}
          >
            <option value="">Select interview round...</option>
            <option value="phone-screening">Phone Screening</option>
            <option value="technical">Technical Interview</option>
            <option value="behavioral">Behavioral Interview</option>
            <option value="panel">Panel Interview</option>
            <option value="final">Final Interview</option>
            <option value="hr">HR Interview</option>
            <option value="case-study">Case Study</option>
            <option value="presentation">Presentation</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}

      {/* Description Field */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            videoType === "interview"
              ? "Brief description of the interview session..."
              : "Brief description of your introduction video..."
          }
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={disabled}
        />
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="text-center">
          {uploading ? (
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-blue-400 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l3 3m0 0l3-3m-3 3V9"
                />
              </svg>
              <p className="text-sm text-blue-600">
                Uploading {videoType} video...
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Video files up to {formatFileSize(maxSizeBytes)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <svg
            className="h-5 w-5 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Supported formats: MP4, WebM, AVI, MOV, WMV, FLV, MKV, M4V</p>
        <p>• Maximum file size: {formatFileSize(maxSizeBytes)}</p>
        <p>• Videos will be automatically analyzed for content and quality</p>
        <p>
          •{" "}
          {videoType === "interview"
            ? "Select the interview round to help organize your video files"
            : "Introduction videos help recruiters get to know you better"}
        </p>
        <p>
          • Video metadata (duration, resolution) will be extracted
          automatically
        </p>
      </div>
    </div>
  );
};

export default VideoUpload;
