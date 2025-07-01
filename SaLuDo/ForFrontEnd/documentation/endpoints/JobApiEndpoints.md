# Job API Endpoints Documentation

This document provides comprehensive documentation for all job-related REST API endpoints in the SaLuDo backend.

## Base URL
```
https://your-api-domain.com/api
```

## Job Core Endpoints

### 1. Create Job
**POST** `/jobs`

Creates a new job with basic information. Skills can be added later via skill endpoints.

**Request Body:**
```typescript
{
  name: string;           // Required: Job title/name
  description: string;    // Required: Job description
  skills?: {             // Optional: Initial skills for the job
    skillId: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    isRequired: boolean;
    evidence?: string;    // Optional: Evidence/justification for skill requirement
  }[];
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  message: string;
  data: {
    _id: string;
    name: string;
    description: string;
    skills: JobSkillRequirement[];
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
}
```

**Example:**
```typescript
// Create job with just name and description
const response = await fetch('/api/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Frontend Developer",
    description: "Develop user interfaces using React and TypeScript"
  })
});

// Create job with initial skills
const response = await fetch('/api/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Backend Developer",
    description: "Develop server-side applications",
    skills: [
      {
        skillId: "64f1a2b3c4d5e6f7g8h9i0j1",
        level: "Advanced",
        isRequired: true,
        evidence: "Required for API development"
      }
    ]
  })
});
```

### 2. Get All Jobs
**GET** `/jobs`

Retrieves all jobs (excluding soft-deleted ones by default).

**Query Parameters:**
- `includeDeleted=true` (optional): Include soft-deleted jobs

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Job[];
}
```

**Example:**
```typescript
// Get active jobs only
const response = await fetch('/api/jobs');

// Get all jobs including deleted
const response = await fetch('/api/jobs?includeDeleted=true');
```

### 3. Get Job by ID
**GET** `/jobs/:jobId`

Retrieves a specific job by its ID.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Job;
}
```

**Example:**
```typescript
const response = await fetch('/api/jobs/64f1a2b3c4d5e6f7g8h9i0j1');
```

### 4. Update Job
**PUT** `/jobs/:jobId`

Updates job basic information (name, description).

**Request Body:**
```typescript
{
  name?: string;
  description?: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Job;
}
```

**Example:**
```typescript
const response = await fetch('/api/jobs/64f1a2b3c4d5e6f7g8h9i0j1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Senior Frontend Developer",
    description: "Lead frontend development with React and TypeScript"
  })
});
```

### 5. Soft Delete Job
**DELETE** `/jobs/:jobId`

Soft deletes a job (sets isDeleted to true).

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Job;
}
```

**Example:**
```typescript
const response = await fetch('/api/jobs/64f1a2b3c4d5e6f7g8h9i0j1', {
  method: 'DELETE'
});
```

### 6. Restore Job
**PUT** `/jobs/:jobId/restore`

Restores a soft-deleted job.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Job;
}
```

**Example:**
```typescript
const response = await fetch('/api/jobs/64f1a2b3c4d5e6f7g8h9i0j1/restore', {
  method: 'PUT'
});
```

### 7. Hard Delete Job
**DELETE** `/jobs/:jobId/hard`

Permanently deletes a job from the database.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
}
```

**Example:**
```typescript
const response = await fetch('/api/jobs/64f1a2b3c4d5e6f7g8h9i0j1/hard', {
  method: 'DELETE'
});
```

## Job Skills Management

### 8. Add Skill to Job
**POST** `/jobs/:jobId/skills`

Adds a skill requirement to a job.

**Request Body:**
```typescript
{
  skillId: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  isRequired: boolean;
  evidence?: string;
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  message: string;
  data: Job;
}
```

**Example:**
```typescript
const response = await fetch('/api/jobs/64f1a2b3c4d5e6f7g8h9i0j1/skills', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    skillId: "64f1a2b3c4d5e6f7g8h9i0j2",
    level: "Intermediate",
    isRequired: true,
    evidence: "Needed for component development"
  })
});
```

### 9. Bulk Add Skills to Job
**POST** `/jobs/:jobId/skills/bulk`

Adds multiple skill requirements to a job in a single operation.

**Request Body:**
```typescript
{
  skills: {
    skillId: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    isRequired: boolean;
    evidence?: string;
  }[];
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  message: string;
  data: Job;
}
```

**Example:**
```typescript
const response = await fetch('/api/jobs/64f1a2b3c4d5e6f7g8h9i0j1/skills/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    skills: [
      {
        skillId: "64f1a2b3c4d5e6f7g8h9i0j2",
        level: "Advanced",
        isRequired: true,
        evidence: "Core technology"
      },
      {
        skillId: "64f1a2b3c4d5e6f7g8h9i0j3",
        level: "Intermediate",
        isRequired: false,
        evidence: "Nice to have"
      }
    ]
  })
});
```

### 10. Update Job Skill
**PUT** `/jobs/:jobId/skills/:skillId`

Updates a skill requirement for a job.

**Request Body:**
```typescript
{
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  isRequired?: boolean;
  evidence?: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Job;
}
```

**Example:**
```typescript
const response = await fetch('/api/jobs/64f1a2b3c4d5e6f7g8h9i0j1/skills/64f1a2b3c4d5e6f7g8h9i0j2', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    level: "Expert",
    isRequired: true,
    evidence: "Critical for project success"
  })
});
```

### 11. Remove Skill from Job
**DELETE** `/jobs/:jobId/skills/:skillId`

Removes a skill requirement from a job.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Job;
}
```

**Example:**
```typescript
const response = await fetch('/api/jobs/64f1a2b3c4d5e6f7g8h9i0j1/skills/64f1a2b3c4d5e6f7g8h9i0j2', {
  method: 'DELETE'
});
```

## Job-Candidate Matching

### 12. Find Matching Candidates
**GET** `/jobs/:jobId/matching-candidates`

Finds candidates that match the job's skill requirements.

**Query Parameters:**
- `minMatch` (optional): Minimum match percentage (0-100)
- `includePartial` (optional): Include partial matches

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    jobId: string;
    totalCandidates: number;
    matches: {
      candidate: Candidate;
      matchScore: number;
      matchingSkills: string[];
      missingSkills: string[];
    }[];
  }
}
```

**Example:**
```typescript
// Get all matching candidates
const response = await fetch('/api/jobs/64f1a2b3c4d5e6f7g8h9i0j1/matching-candidates');

// Get candidates with at least 70% match
const response = await fetch('/api/jobs/64f1a2b3c4d5e6f7g8h9i0j1/matching-candidates?minMatch=70');
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```typescript
{
  success: false;
  message: string;
  errors?: ValidationError[];
}
```

### 404 Not Found
```typescript
{
  success: false;
  message: "Job not found" | "Skill not found";
}
```

### 409 Conflict
```typescript
{
  success: false;
  message: "Skill already exists in job" | "Job name already exists";
}
```

### 500 Internal Server Error
```typescript
{
  success: false;
  message: "Internal server error";
  error?: string;
}
```

## Usage Notes

1. **Job Creation**: Jobs can be created with just name and description. Skills can be added later.
2. **Skill Management**: Use bulk operations when adding multiple skills for better performance.
3. **Soft Deletion**: Deleted jobs are hidden by default but can be restored.
4. **Matching**: The matching algorithm considers skill levels and requirements.
5. **Validation**: All required fields are validated, and duplicate skills are prevented.
6. **Evidence Field**: Provides context for why a skill is required at a specific level.

## Common Integration Patterns

### Creating a Complete Job
```typescript
// 1. Create job with basic info
const job = await createJob({
  name: "Full Stack Developer",
  description: "Develop both frontend and backend"
});

// 2. Add skills in bulk
await addSkillsToJob(job.data._id, {
  skills: [
    { skillId: "react-id", level: "Advanced", isRequired: true },
    { skillId: "node-id", level: "Intermediate", isRequired: true },
    { skillId: "docker-id", level: "Beginner", isRequired: false }
  ]
});
```

### Finding and Matching Candidates
```typescript
// 1. Get job details
const job = await getJob(jobId);

// 2. Find matching candidates
const matches = await getMatchingCandidates(jobId, { minMatch: 60 });

// 3. Process results
matches.data.matches.forEach(match => {
  console.log(`${match.candidate.name}: ${match.matchScore}% match`);
});
```
