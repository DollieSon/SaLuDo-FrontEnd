import React, { useState } from 'react';
import { TranscriptMetadata } from '../../../types/CandidateApiTypes';
import Modal from '../../common/Modal';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

export interface TranscriptViewerProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: TranscriptMetadata;
  candidateId: string;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  isOpen,
  onClose,
  transcript,
  candidateId
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTranscriptionStatusBadge = () => {
    switch (transcript.transcriptionStatus) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ Processing
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ⚪ Not Started
          </span>
        );
    }
  };

  const isAudioFile = () => {
    return transcript.contentType.startsWith('audio/');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Interview Transcript: ${transcript.filename}`}
      size="xl"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} />}

        {/* File Information */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h3 className="text-lg font-medium text-gray-900 mb-3">File Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">File name:</span>
              <div className="font-medium text-gray-900">{transcript.filename}</div>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <div className="font-medium text-gray-900">{transcript.contentType}</div>
            </div>
            <div>
              <span className="text-gray-500">Size:</span>
              <div className="font-medium text-gray-900">{formatFileSize(transcript.size)}</div>
            </div>
            {transcript.duration && (
              <div>
                <span className="text-gray-500">Duration:</span>
                <div className="font-medium text-gray-900">{formatDuration(transcript.duration)}</div>
              </div>
            )}
            <div>
              <span className="text-gray-500">Interview Round:</span>
              <div className="font-medium text-gray-900">
                {transcript.interviewRound || 'Not specified'}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <div className="mt-1">{getTranscriptionStatusBadge()}</div>
            </div>
            <div>
              <span className="text-gray-500">Uploaded:</span>
              <div className="font-medium text-gray-900">
                {new Date(transcript.uploadedAt).toLocaleString()}
              </div>
            </div>
            {transcript.transcribedAt && (
              <div>
                <span className="text-gray-500">Transcribed:</span>
                <div className="font-medium text-gray-900">
                  {new Date(transcript.transcribedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audio Player (if audio file) */}
        {isAudioFile() && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Audio Player</h3>
            <audio controls className="w-full">
              <source src={`/api/candidates/${candidateId}/transcripts/${transcript.fileId}/download`} type={transcript.contentType} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Transcript Content */}
        {transcript.transcriptionStatus === 'completed' && transcript.textContent ? (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Transcript</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(transcript.textContent || '');
                  // Could add toast notification here
                }}
                className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                Copy to Clipboard
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {transcript.textContent}
                </div>
              </div>
            </div>
          </div>
        ) : transcript.transcriptionStatus === 'pending' ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <div>
                <h3 className="text-lg font-medium text-yellow-900">Transcription in Progress</h3>
                <p className="text-sm text-yellow-700">
                  AI is currently processing this audio file. This may take a few minutes depending on the file size.
                </p>
              </div>
            </div>
          </div>
        ) : transcript.transcriptionStatus === 'failed' ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-900">Transcription Failed</h3>
                <p className="text-sm text-red-700">
                  There was an error processing this audio file. Please try uploading again or contact support.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transcript available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Transcription has not been started for this file.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
          
          {/* Download Button */}
          <a
            href={`/api/candidates/${candidateId}/transcripts/${transcript.fileId}/download`}
            download={transcript.filename}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default TranscriptViewer;
