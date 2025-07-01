# SaLuDo REST API Complete Documentation

This document provides a comprehensive overview of all REST API endpoints available in the SaLuDo backend system. The API is designed for talent management, candidate evaluation, and job matching.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [API Overview](#api-overview)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Pagination](#pagination)
7. [Endpoint Categories](#endpoint-categories)
8. [Integration Examples](#integration-examples)
9. [Best Practices](#best-practices)

## 🚀 Quick Start

### Base URL
```
Production: https://your-api-domain.com/api
Development: http://localhost:3000/api
```

### Basic Request Example
```typescript
const response = await fetch('/api/candidates', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <your-token>' // If authentication is required
  }
});

const data = await response.json();
```

### Using the TypeScript API Client
```typescript
import { CandidateApiClient, JobApiClient } from './ForFrontEnd';

const candidateClient = new CandidateApiClient();
const candidates = await candidateClient.getAllCandidates();
```

## 📊 API Overview

The SaLuDo API is organized into several main categories:

| Category | Purpose | Endpoints | Documentation |
|----------|---------|-----------|---------------|
| **Candidates** | Core candidate management | 25+ endpoints | [CandidateApiEndpoints.md](./CandidateApiEndpoints.md) |
| **Jobs** | Job creation and management | 12+ endpoints | [JobApiEndpoints.md](./JobApiEndpoints.md) |
| **Skills** | Global and candidate skills | 17+ endpoints | [SkillApiEndpoints.md](./SkillApiEndpoints.md) |
| **Transcripts** | File upload and AI analysis | 16+ endpoints | [TranscriptApiEndpoints.md](./TranscriptApiEndpoints.md) |
| **Users** | Legacy user management | 17+ endpoints | [UserApiEndpoints.md](./UserApiEndpoints.md) |

### Core Features
- ✅ **Full CRUD Operations** - Create, Read, Update, Delete for all resources
- ✅ **Soft Deletion** - Resources can be soft-deleted and restored
- ✅ **Bulk Operations** - Efficient batch processing
- ✅ **AI Integration** - Gemini AI for resume and transcript analysis
- ✅ **File Handling** - Upload and process PDF, DOC, TXT files
- ✅ **Advanced Search** - Filter, search, and match candidates
- ✅ **TypeScript Support** - Fully typed interfaces and clients

## 🔐 Authentication

Currently, the API endpoints are **publicly accessible** for development purposes. In production, you may need to implement authentication.

### Future Authentication (when implemented)
```typescript
// Login to get token
const auth = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await auth.json();

// Use token in subsequent requests
const response = await fetch('/api/candidates', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🚨 Error Handling

All API endpoints return consistent error responses:

### Success Response Format
```typescript
{
  success: true;
  message: string;
  data: any; // The actual response data
  pagination?: PaginationInfo; // For paginated responses
}
```

### Error Response Format
```typescript
{
  success: false;
  message: string;
  errors?: ValidationError[]; // Detailed validation errors
  error?: string; // Technical error details (development only)
}
```

### Common HTTP Status Codes
- `200 OK` - Successful GET, PUT operations
- `201 Created` - Successful POST operations
- `202 Accepted` - Async operations started
- `400 Bad Request` - Validation errors
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate data or business rule violation
- `413 Payload Too Large` - File size exceeds limits
- `415 Unsupported Media Type` - Invalid file type
- `422 Unprocessable Entity` - Processing failed
- `500 Internal Server Error` - Server errors

### Error Handling Example
```typescript
try {
  const response = await fetch('/api/candidates', { method: 'POST', ... });
  const result = await response.json();
  
  if (!result.success) {
    // Handle API error
    console.error('API Error:', result.message);
    if (result.errors) {
      result.errors.forEach(err => console.error(`${err.field}: ${err.message}`));
    }
    return;
  }
  
  // Handle success
  console.log('Created candidate:', result.data);
} catch (error) {
  // Handle network or parsing errors
  console.error('Network error:', error);
}
```

## 🚦 Rate Limiting

Currently, there are **no rate limits** imposed. In production, consider implementing:
- General API: 1000 requests/hour per IP
- File uploads: 50 uploads/hour per IP
- AI processing: 100 requests/hour per IP

## 📄 Pagination

List endpoints support pagination:

### Query Parameters
```typescript
{
  limit?: number;    // Items per page (default: 50, max: 100)
  offset?: number;   // Number of items to skip (default: 0)
  page?: number;     // Page number (alternative to offset)
}
```

### Pagination Response
```typescript
{
  success: true;
  data: any[];
  pagination: {
    total: number;       // Total number of items
    limit: number;       // Items per page
    offset: number;      // Current offset
    page?: number;       // Current page number
    totalPages?: number; // Total number of pages
    hasMore: boolean;    // Whether there are more items
  }
}
```

### Example
```typescript
// Get page 2 with 20 items per page
const response = await fetch('/api/candidates?page=2&limit=20');
```

## 📚 Endpoint Categories

### 1. Candidate Management
**Base Path:** `/api/candidates`

Core candidate operations including profile management, skills, education, experience, certifications, and strengths/weaknesses.

**Key Endpoints:**
- `POST /candidates` - Create candidate
- `GET /candidates` - List candidates with filtering
- `GET /candidates/:id` - Get candidate details
- `PUT /candidates/:id` - Update candidate
- `DELETE /candidates/:id` - Soft delete candidate

**Sub-resources:**
- `/candidates/:id/skills` - Manage candidate skills
- `/candidates/:id/education` - Manage education history
- `/candidates/:id/experience` - Manage work experience
- `/candidates/:id/certifications` - Manage certifications
- `/candidates/:id/strengths-weaknesses` - Manage personality traits

### 2. Job Management
**Base Path:** `/api/jobs`

Job creation, skill requirements, and candidate matching.

**Key Endpoints:**
- `POST /jobs` - Create job
- `GET /jobs` - List jobs
- `POST /jobs/:id/skills` - Add skill requirements
- `GET /jobs/:id/matching-candidates` - Find matching candidates

### 3. Skill Management
**Base Path:** `/api/skills`

Global skill master management and candidate skill assignment.

**Key Features:**
- Global skill database
- Skill categorization
- Usage analytics
- Candidate-skill associations

### 4. Transcript Processing
**Base Path:** `/api/transcripts`

AI-powered document analysis for resumes, interview transcripts, and other documents.

**Key Features:**
- Multi-format file upload (PDF, DOC, TXT)
- AI-powered text extraction
- Skill identification
- Personality analysis
- Experience extraction

### 5. User Management (Legacy)
**Base Path:** `/api/users`

Legacy user management system for backwards compatibility.

## 🔧 Integration Examples

### Complete Candidate Onboarding
```typescript
import { CandidateApiClient } from './ForFrontEnd';

const client = new CandidateApiClient();

// 1. Create candidate
const candidate = await client.createCandidate({
  email: "john.doe@example.com",
  name: "John Doe",
  phone: "+1-555-0123",
  location: "San Francisco, CA"
});

// 2. Add skills
await client.bulkAddCandidateSkills(candidate.data._id, {
  skills: [
    { skillId: "react-id", level: "Advanced", yearsOfExperience: 3 },
    { skillId: "node-id", level: "Intermediate", yearsOfExperience: 2 }
  ]
});

// 3. Add education
await client.addEducation(candidate.data._id, {
  institution: "Stanford University",
  degree: "Computer Science",
  graduationYear: 2020,
  gpa: 3.8
});

// 4. Add experience
await client.addExperience(candidate.data._id, {
  company: "Tech Corp",
  position: "Software Engineer",
  startDate: new Date('2020-06-01'),
  endDate: new Date('2023-12-31'),
  description: "Developed web applications using React and Node.js"
});
```

### Job Creation and Candidate Matching
```typescript
import { JobApiClient } from './ForFrontEnd';

const jobClient = new JobApiClient();

// 1. Create job
const job = await jobClient.createJob({
  name: "Senior Frontend Developer",
  description: "Lead frontend development using modern technologies"
});

// 2. Add skill requirements
await jobClient.bulkAddJobSkills(job.data._id, {
  skills: [
    { skillId: "react-id", level: "Advanced", isRequired: true },
    { skillId: "typescript-id", level: "Intermediate", isRequired: true },
    { skillId: "leadership-id", level: "Beginner", isRequired: false }
  ]
});

// 3. Find matching candidates
const matches = await jobClient.getMatchingCandidates(job.data._id, {
  minMatch: 70
});

console.log(`Found ${matches.data.matches.length} matching candidates`);
```

### Transcript Processing Workflow
```typescript
import { TranscriptApiClient } from './ForFrontEnd';

const transcriptClient = new TranscriptApiClient();

// 1. Upload transcript
const upload = await transcriptClient.uploadTranscript(file, {
  candidateId: "candidate-id",
  title: "Technical Interview",
  tags: ["interview", "technical"]
});

// 2. Process transcript
await transcriptClient.processTranscript(upload.data._id, {
  analysisType: 'comprehensive',
  includeSkillExtraction: true,
  includePersonalityAnalysis: true
});

// 3. Wait for processing (implement polling)
let status;
do {
  await new Promise(resolve => setTimeout(resolve, 5000));
  status = await transcriptClient.getProcessingStatus(upload.data._id);
} while (status.data.status === 'processing');

// 4. Apply extracted skills to candidate
if (status.data.status === 'processed') {
  const skills = await transcriptClient.getExtractedSkills(upload.data._id);
  await transcriptClient.applySkillsToCandidate(upload.data._id, {
    candidateId: "candidate-id",
    skillsToApply: skills.data.extractedSkills,
    createMissingSkills: true
  });
}
```

## 🎯 Best Practices

### 1. Use TypeScript Interfaces
```typescript
import { CreateCandidateRequest, CandidateResponse } from './ForFrontEnd';

const candidateData: CreateCandidateRequest = {
  email: "user@example.com",
  name: "User Name"
};
```

### 2. Handle Errors Gracefully
```typescript
const result = await candidateClient.createCandidate(data);
if (!result.success) {
  // Show user-friendly error message
  showErrorMessage(result.message);
  return;
}
```

### 3. Use Bulk Operations
```typescript
// Instead of multiple individual calls
skills.forEach(skill => addSkill(candidateId, skill)); // ❌

// Use bulk operations
bulkAddSkills(candidateId, { skills }); // ✅
```

### 4. Implement Proper Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await candidateClient.createCandidate(data);
  } finally {
    setLoading(false);
  }
};
```

### 5. Cache Frequently Used Data
```typescript
// Cache skill master list
const skills = await skillClient.getAllSkills();
localStorage.setItem('skills', JSON.stringify(skills));
```

### 6. Use Pagination for Large Lists
```typescript
const loadCandidates = async (page = 1) => {
  const response = await candidateClient.getAllCandidates({
    page,
    limit: 20
  });
  
  return response.data;
};
```

### 7. Validate File Uploads
```typescript
const validateFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'text/plain', 'application/msword'];
  
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Unsupported file type');
  }
};
```

## 📖 Additional Resources

### Type Definitions
All TypeScript interfaces are available in:
- `ForFrontEnd/CandidateApiTypes.ts`
- `ForFrontEnd/JobApiTypes.ts`
- `ForFrontEnd/SkillApiTypes.ts`
- `ForFrontEnd/TranscriptApiTypes.ts`
- `ForFrontEnd/UserApiTypes.ts`

### API Clients
Ready-to-use API clients:
- `ForFrontEnd/CandidateApiClient.ts`
- `ForFrontEnd/AllApiClients.ts`

### Quick Import
```typescript
import {
  // Types
  CreateCandidateRequest,
  CandidateResponse,
  CreateJobRequest,
  // Clients
  CandidateApiClient,
  JobApiClient,
  AllApiClients
} from './ForFrontEnd';
```

## 🔄 API Versioning

Current API version: **v1**

All endpoints are currently unversioned but follow RESTful conventions. Future versions will include version numbers in the URL path:
- `v1`: `/api/candidates`
- `v2`: `/api/v2/candidates`

## 📞 Support

For API support and questions:
1. Check the detailed endpoint documentation in each category
2. Review the TypeScript interfaces for request/response formats
3. Use the provided API clients for quick integration
4. Refer to the integration examples for common patterns

The SaLuDo API is designed to be intuitive, well-documented, and easy to integrate. All endpoints include comprehensive error handling, validation, and support for both individual and bulk operations.
