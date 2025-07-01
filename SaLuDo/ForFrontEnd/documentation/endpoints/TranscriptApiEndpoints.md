# Transcript API Endpoints Documentation

This document provides comprehensive documentation for all transcript-related REST API endpoints in the SaLuDo backend, covering file upload, processing, and management.

## Base URL
```
https://your-api-domain.com/api
```

## Transcript Upload and Processing

### 1. Upload Transcript File
**POST** `/transcripts/upload`

Uploads a transcript file (PDF, TXT, DOCX) for processing and analysis.

**Request:**
- **Content-Type**: `multipart/form-data`
- **File Field**: `transcript`
- **Supported Formats**: PDF, TXT, DOCX

**Form Data:**
```typescript
{
  transcript: File;           // Required: Transcript file
  candidateId?: string;       // Optional: Associate with specific candidate
  title?: string;            // Optional: Custom title for transcript
  description?: string;      // Optional: Description or notes
  tags?: string[];          // Optional: Tags for categorization
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  message: string;
  data: {
    _id: string;
    filename: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    title?: string;
    description?: string;
    tags: string[];
    candidateId?: string;
    status: 'uploaded' | 'processing' | 'processed' | 'failed';
    extractedText?: string;
    analysis?: TranscriptAnalysis;
    createdAt: Date;
    updatedAt: Date;
  }
}
```

**Example:**
```typescript
const formData = new FormData();
formData.append('transcript', fileInput.files[0]);
formData.append('candidateId', '64f1a2b3c4d5e6f7g8h9i0j1');
formData.append('title', 'Technical Interview - Frontend Role');
formData.append('tags', JSON.stringify(['interview', 'frontend', 'technical']));

const response = await fetch('/api/transcripts/upload', {
  method: 'POST',
  body: formData
});
```

### 2. Process Transcript
**POST** `/transcripts/:transcriptId/process`

Triggers AI processing of an uploaded transcript to extract insights, skills, and analysis.

**Request Body:**
```typescript
{
  analysisType?: 'skills' | 'personality' | 'experience' | 'comprehensive';
  includeSkillExtraction?: boolean;
  includePersonalityAnalysis?: boolean;
  includeExperienceMapping?: boolean;
  customPrompt?: string;
}
```

**Response:** `202 Accepted`
```typescript
{
  success: true;
  message: string;
  data: {
    transcriptId: string;
    processingJobId: string;
    status: 'processing';
    estimatedCompletionTime: Date;
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/transcripts/64f1a2b3c4d5e6f7g8h9i0j1/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    analysisType: 'comprehensive',
    includeSkillExtraction: true,
    includePersonalityAnalysis: true,
    includeExperienceMapping: true
  })
});
```

### 3. Get Processing Status
**GET** `/transcripts/:transcriptId/status`

Checks the processing status of a transcript.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    transcriptId: string;
    status: 'uploaded' | 'processing' | 'processed' | 'failed';
    progress?: number; // 0-100
    currentStep?: string;
    estimatedTimeRemaining?: number; // seconds
    error?: string;
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/transcripts/64f1a2b3c4d5e6f7g8h9i0j1/status');
```

## Transcript Management

### 4. Get All Transcripts
**GET** `/transcripts`

Retrieves all transcripts with optional filtering.

**Query Parameters:**
- `candidateId` (optional): Filter by candidate
- `status` (optional): Filter by processing status
- `tags` (optional): Filter by tags (comma-separated)
- `dateFrom` (optional): Filter by creation date (ISO string)
- `dateTo` (optional): Filter by creation date (ISO string)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset
- `includeDeleted` (optional): Include soft-deleted transcripts

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Transcript[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  }
}
```

**Example:**
```typescript
// Get all transcripts
const response = await fetch('/api/transcripts');

// Get transcripts for specific candidate
const response = await fetch('/api/transcripts?candidateId=64f1a2b3c4d5e6f7g8h9i0j1');

// Get processed transcripts with interview tag
const response = await fetch('/api/transcripts?status=processed&tags=interview');
```

### 5. Get Transcript by ID
**GET** `/transcripts/:transcriptId`

Retrieves a specific transcript with full details including analysis.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    _id: string;
    filename: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    title?: string;
    description?: string;
    tags: string[];
    candidateId?: string;
    status: string;
    extractedText: string;
    analysis: {
      skills: {
        skillName: string;
        confidence: number;
        context: string[];
        level?: string;
      }[];
      experience: {
        role: string;
        company?: string;
        duration?: string;
        responsibilities: string[];
        achievements: string[];
      }[];
      personalityTraits: {
        trait: string;
        score: number;
        evidence: string[];
      }[];
      summary: string;
      recommendations: string[];
      sentiment: {
        overall: 'positive' | 'neutral' | 'negative';
        confidence: number;
      };
    };
    createdAt: Date;
    updatedAt: Date;
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/transcripts/64f1a2b3c4d5e6f7g8h9i0j1');
```

### 6. Update Transcript
**PUT** `/transcripts/:transcriptId`

Updates transcript metadata (title, description, tags, candidate association).

**Request Body:**
```typescript
{
  title?: string;
  description?: string;
  tags?: string[];
  candidateId?: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Transcript;
}
```

**Example:**
```typescript
const response = await fetch('/api/transcripts/64f1a2b3c4d5e6f7g8h9i0j1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Senior Developer Interview - Updated",
    tags: ["interview", "senior", "leadership"],
    description: "Comprehensive technical and leadership interview"
  })
});
```

### 7. Delete Transcript
**DELETE** `/transcripts/:transcriptId`

Soft deletes a transcript (marks as deleted but keeps file).

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Transcript;
}
```

**Example:**
```typescript
const response = await fetch('/api/transcripts/64f1a2b3c4d5e6f7g8h9i0j1', {
  method: 'DELETE'
});
```

### 8. Hard Delete Transcript
**DELETE** `/transcripts/:transcriptId/hard`

Permanently deletes transcript and associated file.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
}
```

**Example:**
```typescript
const response = await fetch('/api/transcripts/64f1a2b3c4d5e6f7g8h9i0j1/hard', {
  method: 'DELETE'
});
```

## Transcript Analysis

### 9. Get Extracted Skills
**GET** `/transcripts/:transcriptId/skills`

Retrieves skills extracted from transcript analysis.

**Query Parameters:**
- `minConfidence` (optional): Minimum confidence score (0-1)
- `skillType` (optional): Filter by skill type/category

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    transcriptId: string;
    extractedSkills: {
      skillName: string;
      confidence: number;
      context: string[];
      level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
      evidence: string[];
      matchedGlobalSkill?: {
        _id: string;
        name: string;
        category: string;
      };
    }[];
  }
}
```

**Example:**
```typescript
// Get all extracted skills
const response = await fetch('/api/transcripts/64f1a2b3c4d5e6f7g8h9i0j1/skills');

// Get high-confidence skills only
const response = await fetch('/api/transcripts/64f1a2b3c4d5e6f7g8h9i0j1/skills?minConfidence=0.8');
```

### 10. Apply Skills to Candidate
**POST** `/transcripts/:transcriptId/apply-skills`

Applies extracted skills to a candidate's profile.

**Request Body:**
```typescript
{
  candidateId: string;
  skillsToApply: {
    skillName: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    confidence?: number;
  }[];
  createMissingSkills?: boolean; // Create global skills if they don't exist
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    appliedSkills: number;
    createdSkills: number;
    skippedSkills: string[];
    updatedCandidate: Candidate;
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/transcripts/64f1a2b3c4d5e6f7g8h9i0j1/apply-skills', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    candidateId: "64f1a2b3c4d5e6f7g8h9i0j2",
    skillsToApply: [
      { skillName: "React.js", level: "Advanced", confidence: 0.9 },
      { skillName: "Leadership", level: "Intermediate", confidence: 0.8 }
    ],
    createMissingSkills: true
  })
});
```

### 11. Get Experience Analysis
**GET** `/transcripts/:transcriptId/experience`

Retrieves work experience information extracted from the transcript.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    transcriptId: string;
    extractedExperience: {
      role: string;
      company?: string;
      duration?: string;
      responsibilities: string[];
      achievements: string[];
      skills: string[];
      confidence: number;
    }[];
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/transcripts/64f1a2b3c4d5e6f7g8h9i0j1/experience');
```

### 12. Get Personality Analysis
**GET** `/transcripts/:transcriptId/personality`

Retrieves personality traits and characteristics extracted from the transcript.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    transcriptId: string;
    personalityAnalysis: {
      traits: {
        trait: string;
        score: number; // 0-100
        evidence: string[];
        description: string;
      }[];
      summary: string;
      strengths: string[];
      developmentAreas: string[];
      workingStyle: string;
      communicationStyle: string;
    }
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/transcripts/64f1a2b3c4d5e6f7g8h9i0j1/personality');
```

## File Operations

### 13. Download Original File
**GET** `/transcripts/:transcriptId/download`

Downloads the original uploaded transcript file.

**Response:** `200 OK`
- Returns the original file with appropriate headers

**Example:**
```typescript
const response = await fetch('/api/transcripts/64f1a2b3c4d5e6f7g8h9i0j1/download');
const blob = await response.blob();
const url = URL.createObjectURL(blob);
```

### 14. Get Text Content
**GET** `/transcripts/:transcriptId/text`

Retrieves the extracted text content from the transcript.

**Query Parameters:**
- `format` (optional): 'plain' | 'structured' (default: 'plain')

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    transcriptId: string;
    extractedText: string;
    metadata: {
      wordCount: number;
      pageCount?: number;
      extractionMethod: string;
      confidence: number;
    }
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/transcripts/64f1a2b3c4d5e6f7g8h9i0j1/text');
```

## Bulk Operations

### 15. Bulk Upload Transcripts
**POST** `/transcripts/bulk-upload`

Uploads multiple transcript files at once.

**Request:**
- **Content-Type**: `multipart/form-data`
- **File Fields**: `transcripts[]`

**Form Data:**
```typescript
{
  transcripts: File[];        // Multiple transcript files
  candidateId?: string;       // Associate all with same candidate
  tags?: string[];           // Apply same tags to all
  autoProcess?: boolean;     // Automatically start processing
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  message: string;
  data: {
    uploaded: Transcript[];
    failed: {
      filename: string;
      error: string;
    }[];
    summary: {
      totalFiles: number;
      successful: number;
      failed: number;
    }
  }
}
```

**Example:**
```typescript
const formData = new FormData();
files.forEach(file => formData.append('transcripts', file));
formData.append('autoProcess', 'true');

const response = await fetch('/api/transcripts/bulk-upload', {
  method: 'POST',
  body: formData
});
```

### 16. Bulk Process Transcripts
**POST** `/transcripts/bulk-process`

Triggers processing for multiple transcripts.

**Request Body:**
```typescript
{
  transcriptIds: string[];
  analysisType?: 'skills' | 'personality' | 'experience' | 'comprehensive';
  priority?: 'low' | 'normal' | 'high';
}
```

**Response:** `202 Accepted`
```typescript
{
  success: true;
  message: string;
  data: {
    queuedTranscripts: string[];
    estimatedCompletionTime: Date;
    batchId: string;
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/transcripts/bulk-process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcriptIds: ["id1", "id2", "id3"],
    analysisType: 'comprehensive',
    priority: 'high'
  })
});
```

## Error Responses

### 400 Bad Request
```typescript
{
  success: false;
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
}
```

### 413 Payload Too Large
```typescript
{
  success: false;
  message: "File size exceeds maximum limit of 10MB";
}
```

### 415 Unsupported Media Type
```typescript
{
  success: false;
  message: "Unsupported file type. Supported types: PDF, TXT, DOCX";
}
```

### 422 Processing Failed
```typescript
{
  success: false;
  message: "Transcript processing failed";
  error: string;
}
```

## Usage Notes

1. **File Limits**: Maximum file size is 10MB per transcript
2. **Supported Formats**: PDF, TXT, DOCX files are supported
3. **Processing Time**: Analysis typically takes 30 seconds to 5 minutes depending on file size and complexity
4. **Text Extraction**: PDF files are parsed for text; images and handwriting are not supported
5. **AI Analysis**: Uses advanced NLP for skill extraction and personality analysis
6. **Batch Processing**: Use bulk operations for better performance with multiple files
7. **Status Polling**: Check processing status regularly for real-time updates

## Common Integration Patterns

### Complete Transcript Workflow
```typescript
// 1. Upload transcript
const upload = await uploadTranscript(file, {
  candidateId,
  title: "Technical Interview",
  tags: ["interview", "technical"]
});

// 2. Start processing
await processTranscript(upload.data._id, {
  analysisType: 'comprehensive'
});

// 3. Poll for completion
let status;
do {
  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
  status = await getProcessingStatus(upload.data._id);
} while (status.data.status === 'processing');

// 4. Get results and apply to candidate
if (status.data.status === 'processed') {
  const skills = await getExtractedSkills(upload.data._id);
  await applySkillsToCandidate(upload.data._id, {
    candidateId,
    skillsToApply: skills.data.extractedSkills,
    createMissingSkills: true
  });
}
```

### Batch Processing Multiple Interviews
```typescript
// 1. Upload multiple files
const uploads = await bulkUploadTranscripts(files, {
  tags: ["interview", "batch-2024"],
  autoProcess: true
});

// 2. Monitor batch progress
const batchStatus = await getBatchProcessingStatus(uploads.data.batchId);

// 3. Process results when complete
for (const transcript of uploads.data.uploaded) {
  const analysis = await getTranscriptAnalysis(transcript._id);
  // Process individual results
}
```
