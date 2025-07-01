# Skill Management API Endpoints Documentation

This document provides comprehensive documentation for all skill-related REST API endpoints in the SaLuDo backend, covering both global skill management and candidate skill management.

## Base URL
```
https://your-api-domain.com/api
```

## Global Skill Master Management

### 1. Create Global Skill
**POST** `/skills`

Creates a new skill in the global skill master database.

**Request Body:**
```typescript
{
  name: string;           // Required: Skill name (must be unique)
  category?: string;      // Optional: Skill category (e.g., "Programming", "Design")
  description?: string;   // Optional: Skill description
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
    category?: string;
    description?: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/skills', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "React.js",
    category: "Frontend Framework",
    description: "JavaScript library for building user interfaces"
  })
});
```

### 2. Get All Global Skills
**GET** `/skills`

Retrieves all global skills (excluding soft-deleted ones by default).

**Query Parameters:**
- `includeDeleted=true` (optional): Include soft-deleted skills
- `category` (optional): Filter by category
- `search` (optional): Search by name or description

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: SkillMaster[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}
```

**Example:**
```typescript
// Get all active skills
const response = await fetch('/api/skills');

// Get skills by category
const response = await fetch('/api/skills?category=Programming');

// Search skills
const response = await fetch('/api/skills?search=javascript');

// Get deleted skills
const response = await fetch('/api/skills?includeDeleted=true');
```

### 3. Get Global Skill by ID
**GET** `/skills/:skillId`

Retrieves a specific global skill by its ID.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: SkillMaster;
}
```

**Example:**
```typescript
const response = await fetch('/api/skills/64f1a2b3c4d5e6f7g8h9i0j1');
```

### 4. Update Global Skill
**PUT** `/skills/:skillId`

Updates a global skill's information.

**Request Body:**
```typescript
{
  name?: string;
  category?: string;
  description?: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: SkillMaster;
}
```

**Example:**
```typescript
const response = await fetch('/api/skills/64f1a2b3c4d5e6f7g8h9i0j1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "React.js (Latest)",
    description: "Modern React with hooks and concurrent features"
  })
});
```

### 5. Soft Delete Global Skill
**DELETE** `/skills/:skillId`

Soft deletes a global skill (sets isDeleted to true).

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: SkillMaster;
}
```

**Example:**
```typescript
const response = await fetch('/api/skills/64f1a2b3c4d5e6f7g8h9i0j1', {
  method: 'DELETE'
});
```

### 6. Restore Global Skill
**PUT** `/skills/:skillId/restore`

Restores a soft-deleted global skill.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: SkillMaster;
}
```

**Example:**
```typescript
const response = await fetch('/api/skills/64f1a2b3c4d5e6f7g8h9i0j1/restore', {
  method: 'PUT'
});
```

### 7. Hard Delete Global Skill
**DELETE** `/skills/:skillId/hard`

Permanently deletes a global skill from the database.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
}
```

**Example:**
```typescript
const response = await fetch('/api/skills/64f1a2b3c4d5e6f7g8h9i0j1/hard', {
  method: 'DELETE'
});
```

## Candidate Skill Management

### 8. Add Skill to Candidate
**POST** `/candidates/:candidateId/skills`

Adds a skill to a candidate's profile.

**Request Body:**
```typescript
{
  skillId: string;        // Reference to global skill
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience?: number;
  certifications?: string[];
  projectsUsed?: string[];
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  message: string;
  data: Candidate; // Full candidate object with updated skills
}
```

**Example:**
```typescript
const response = await fetch('/api/candidates/64f1a2b3c4d5e6f7g8h9i0j1/skills', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    skillId: "64f1a2b3c4d5e6f7g8h9i0j2",
    level: "Advanced",
    yearsOfExperience: 3,
    certifications: ["React Certification"],
    projectsUsed: ["E-commerce App", "Dashboard"]
  })
});
```

### 9. Bulk Add Skills to Candidate
**POST** `/candidates/:candidateId/skills/bulk`

Adds multiple skills to a candidate in a single operation.

**Request Body:**
```typescript
{
  skills: {
    skillId: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    yearsOfExperience?: number;
    certifications?: string[];
    projectsUsed?: string[];
  }[];
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  message: string;
  data: Candidate;
}
```

**Example:**
```typescript
const response = await fetch('/api/candidates/64f1a2b3c4d5e6f7g8h9i0j1/skills/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    skills: [
      {
        skillId: "react-skill-id",
        level: "Advanced",
        yearsOfExperience: 3
      },
      {
        skillId: "node-skill-id",
        level: "Intermediate",
        yearsOfExperience: 2
      }
    ]
  })
});
```

### 10. Get Candidate Skills
**GET** `/candidates/:candidateId/skills`

Retrieves all skills for a specific candidate.

**Query Parameters:**
- `includeDeleted=true` (optional): Include soft-deleted skills
- `level` (optional): Filter by skill level
- `category` (optional): Filter by skill category

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: CandidateSkill[];
}
```

**Example:**
```typescript
// Get all candidate skills
const response = await fetch('/api/candidates/64f1a2b3c4d5e6f7g8h9i0j1/skills');

// Get only advanced skills
const response = await fetch('/api/candidates/64f1a2b3c4d5e6f7g8h9i0j1/skills?level=Advanced');
```

### 11. Update Candidate Skill
**PUT** `/candidates/:candidateId/skills/:skillId`

Updates a candidate's skill information.

**Request Body:**
```typescript
{
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience?: number;
  certifications?: string[];
  projectsUsed?: string[];
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Candidate;
}
```

**Example:**
```typescript
const response = await fetch('/api/candidates/64f1a2b3c4d5e6f7g8h9i0j1/skills/64f1a2b3c4d5e6f7g8h9i0j2', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    level: "Expert",
    yearsOfExperience: 5,
    certifications: ["React Advanced Certification", "Redux Certification"]
  })
});
```

### 12. Soft Delete Candidate Skill
**DELETE** `/candidates/:candidateId/skills/:skillId`

Soft deletes a skill from a candidate's profile.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Candidate;
}
```

**Example:**
```typescript
const response = await fetch('/api/candidates/64f1a2b3c4d5e6f7g8h9i0j1/skills/64f1a2b3c4d5e6f7g8h9i0j2', {
  method: 'DELETE'
});
```

### 13. Restore Candidate Skill
**PUT** `/candidates/:candidateId/skills/:skillId/restore`

Restores a soft-deleted skill in a candidate's profile.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Candidate;
}
```

**Example:**
```typescript
const response = await fetch('/api/candidates/64f1a2b3c4d5e6f7g8h9i0j1/skills/64f1a2b3c4d5e6f7g8h9i0j2/restore', {
  method: 'PUT'
});
```

### 14. Hard Delete Candidate Skill
**DELETE** `/candidates/:candidateId/skills/:skillId/hard`

Permanently removes a skill from a candidate's profile.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Candidate;
}
```

**Example:**
```typescript
const response = await fetch('/api/candidates/64f1a2b3c4d5e6f7g8h9i0j1/skills/64f1a2b3c4d5e6f7g8h9i0j2/hard', {
  method: 'DELETE'
});
```

## Skill Analytics and Matching

### 15. Get Skill Usage Statistics
**GET** `/skills/:skillId/stats`

Gets usage statistics for a specific skill across all candidates and jobs.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    skillId: string;
    skillName: string;
    candidatesWithSkill: number;
    jobsRequiringSkill: number;
    levelDistribution: {
      Beginner: number;
      Intermediate: number;
      Advanced: number;
      Expert: number;
    };
    averageExperience: number;
    topCertifications: string[];
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/skills/64f1a2b3c4d5e6f7g8h9i0j1/stats');
```

### 16. Find Candidates with Skill
**GET** `/skills/:skillId/candidates`

Finds all candidates who have a specific skill.

**Query Parameters:**
- `level` (optional): Filter by minimum skill level
- `minExperience` (optional): Minimum years of experience
- `hasCertification` (optional): Must have certifications

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    skill: SkillMaster;
    candidates: {
      candidate: Candidate;
      skillDetails: CandidateSkill;
    }[];
  }
}
```

**Example:**
```typescript
// Get all candidates with React skill
const response = await fetch('/api/skills/react-skill-id/candidates');

// Get candidates with advanced React and 2+ years experience
const response = await fetch('/api/skills/react-skill-id/candidates?level=Advanced&minExperience=2');
```

### 17. Skill Suggestions
**GET** `/skills/suggestions`

Gets skill suggestions based on current trends and job requirements.

**Query Parameters:**
- `category` (optional): Focus on specific category
- `candidateId` (optional): Personalized suggestions for candidate
- `jobId` (optional): Suggestions based on job requirements

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    trending: SkillMaster[];
    recommended: SkillMaster[];
    complementary: SkillMaster[];
  }
}
```

**Example:**
```typescript
// General skill suggestions
const response = await fetch('/api/skills/suggestions');

// Personalized for candidate
const response = await fetch('/api/skills/suggestions?candidateId=64f1a2b3c4d5e6f7g8h9i0j1');
```

## Error Responses

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
  message: "Skill not found" | "Candidate not found";
}
```

### 409 Conflict
```typescript
{
  success: false;
  message: "Skill name already exists" | "Candidate already has this skill";
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

1. **Global Skills**: Manage the master list of skills available system-wide
2. **Candidate Skills**: Link candidates to global skills with personal experience data
3. **Skill Levels**: Use consistent level naming across the application
4. **Soft Deletion**: Skills can be hidden without losing historical data
5. **Bulk Operations**: Use bulk endpoints for better performance when adding multiple skills
6. **Search & Filter**: Utilize query parameters for efficient skill discovery
7. **Analytics**: Use stats endpoints for insights into skill demand and supply

## Common Integration Patterns

### Setting up Global Skills
```typescript
// 1. Create skill categories
const frontendSkills = ["React.js", "Vue.js", "Angular", "TypeScript"];
const backendSkills = ["Node.js", "Python", "Java", "PostgreSQL"];

// 2. Create skills in bulk
for (const skill of frontendSkills) {
  await createSkill({
    name: skill,
    category: "Frontend",
    description: `${skill} programming skill`
  });
}
```

### Adding Skills to Candidate Profile
```typescript
// 1. Search for relevant skills
const skillSearch = await searchSkills("javascript");

// 2. Add skills to candidate
await addSkillsToCandidate(candidateId, {
  skills: skillSearch.data.map(skill => ({
    skillId: skill._id,
    level: "Intermediate",
    yearsOfExperience: 2
  }))
});
```

### Skill-Based Candidate Search
```typescript
// 1. Find candidates with specific skills
const reactDevelopers = await getCandidatesWithSkill("react-skill-id", {
  level: "Advanced",
  minExperience: 3
});

// 2. Get skill statistics for insights
const skillStats = await getSkillStats("react-skill-id");
```
