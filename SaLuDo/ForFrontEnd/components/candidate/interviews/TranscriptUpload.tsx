import React, { useState, useRef, useCallback } from 'react';

export interface TranscriptUploadProps {
  candidateId: string;
  onFileSelect: (file: File, interviewRound?: string) => void;
  onUpload?: (file: File, interviewRound?: string) => Promise<void>;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  disabled?: boolean;
}

const TranscriptUpload: React.FC<TranscriptUploadProps> = ({
  candidateId,
  onFileSelect,
  onUpload,
  acceptedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'text/plain'],
  maxSizeBytes = 100 * 1024 * 1024, // 100MB
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewRound, setInterviewRound] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'Please upload an audio file (MP3, WAV, M4A) or text file';
    }
    
    if (file.size > maxSizeBytes) {
      const maxSizeMB = maxSizeBytes / (1024 * 1024);
      return `File size must be less than ${maxSizeMB}MB`;
    }
    
    return null;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onFileSelect(file, interviewRound || undefined);

    if (onUpload) {
      try {
        setUploading(true);
        await onUpload(file, interviewRound || undefined);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    }
  }, [onFileSelect, onUpload, interviewRound, maxSizeBytes, acceptedTypes]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Interview Round Selection */}
      <div>
        <label htmlFor="interviewRound" className="block text-sm font-medium text-gray-700 mb-2">
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
          <option value="other">Other</option>
        </select>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="text-center">
          {uploading ? (
            <div className="space-y-2">
              <svg className="mx-auto h-12 w-12 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l3 3m0 0l3-3m-3 3V9" />
              </svg>
              <p className="text-sm text-blue-600">Uploading interview recording...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Audio files (MP3, WAV, M4A) or text transcripts up to {formatFileSize(maxSizeBytes)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Supported formats: MP3, WAV, M4A (audio) or TXT (text transcripts)</p>
        <p>• Maximum file size: {formatFileSize(maxSizeBytes)}</p>
        <p>• Audio files will be automatically transcribed using AI</p>
        <p>• Text files will be stored as-is for manual transcripts</p>
        <p>• Select the interview round to help organize your transcripts</p>
      </div>
    </div>
  );
};

export default TranscriptUpload;
