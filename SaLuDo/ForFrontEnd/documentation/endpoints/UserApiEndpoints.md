# User & Resume API Endpoints Documentation

This document provides comprehensive documentation for user management and resume-related REST API endpoints in the SaLuDo backend. These are legacy endpoints that may be used for backwards compatibility or specific user management features.

## Base URL
```
https://your-api-domain.com/api
```

## User Management

### 1. Create User
**POST** `/users`

Creates a new user account in the system.

**Request Body:**
```typescript
{
  email: string;              // Required: User email (must be unique)
  name: string;               // Required: User full name
  password?: string;          // Optional: User password (for local auth)
  role?: 'candidate' | 'recruiter' | 'admin';  // Default: 'candidate'
  profile?: {
    phone?: string;
    location?: string;
    bio?: string;
    website?: string;
    linkedIn?: string;
    github?: string;
  };
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  message: string;
  data: {
    _id: string;
    email: string;
    name: string;
    role: string;
    profile: UserProfile;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: "john.doe@example.com",
    name: "John Doe",
    role: "candidate",
    profile: {
      phone: "+1-555-0123",
      location: "San Francisco, CA",
      bio: "Full-stack developer with 5 years experience",
      linkedIn: "https://linkedin.com/in/johndoe"
    }
  })
});
```

### 2. Get All Users
**GET** `/users`

Retrieves all users with optional filtering.

**Query Parameters:**
- `role` (optional): Filter by user role
- `status` (optional): Filter by active status
- `search` (optional): Search by name or email
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: User[];
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
// Get all users
const response = await fetch('/api/users');

// Get only candidates
const response = await fetch('/api/users?role=candidate');

// Search users
const response = await fetch('/api/users?search=john');
```

### 3. Get User by ID
**GET** `/users/:userId`

Retrieves a specific user by their ID.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    _id: string;
    email: string;
    name: string;
    role: string;
    profile: UserProfile;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/users/64f1a2b3c4d5e6f7g8h9i0j1');
```

### 4. Update User
**PUT** `/users/:userId`

Updates user information.

**Request Body:**
```typescript
{
  name?: string;
  email?: string;
  role?: 'candidate' | 'recruiter' | 'admin';
  profile?: {
    phone?: string;
    location?: string;
    bio?: string;
    website?: string;
    linkedIn?: string;
    github?: string;
  };
  isActive?: boolean;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: User;
}
```

**Example:**
```typescript
const response = await fetch('/api/users/64f1a2b3c4d5e6f7g8h9i0j1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "John Doe Sr.",
    profile: {
      bio: "Senior full-stack developer with 8 years experience",
      website: "https://johndoe.dev"
    }
  })
});
```

### 5. Delete User
**DELETE** `/users/:userId`

Soft deletes a user (deactivates the account).

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: User;
}
```

**Example:**
```typescript
const response = await fetch('/api/users/64f1a2b3c4d5e6f7g8h9i0j1', {
  method: 'DELETE'
});
```

### 6. Restore User
**PUT** `/users/:userId/restore`

Restores a soft-deleted user account.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: User;
}
```

**Example:**
```typescript
const response = await fetch('/api/users/64f1a2b3c4d5e6f7g8h9i0j1/restore', {
  method: 'PUT'
});
```

## Legacy Resume Management

### 7. Upload Resume
**POST** `/users/:userId/resume`

Uploads a resume file for a user.

**Request:**
- **Content-Type**: `multipart/form-data`
- **File Field**: `resume`
- **Supported Formats**: PDF, DOC, DOCX

**Form Data:**
```typescript
{
  resume: File;               // Required: Resume file
  title?: string;            // Optional: Resume title
  description?: string;      // Optional: Resume description
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  message: string;
  data: {
    _id: string;
    userId: string;
    filename: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    title?: string;
    description?: string;
    extractedText?: string;
    uploadedAt: Date;
  }
}
```

**Example:**
```typescript
const formData = new FormData();
formData.append('resume', fileInput.files[0]);
formData.append('title', 'Software Developer Resume 2024');

const response = await fetch('/api/users/64f1a2b3c4d5e6f7g8h9i0j1/resume', {
  method: 'POST',
  body: formData
});
```

### 8. Get User Resumes
**GET** `/users/:userId/resumes`

Retrieves all resumes uploaded by a user.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    userId: string;
    resumes: Resume[];
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/users/64f1a2b3c4d5e6f7g8h9i0j1/resumes');
```

### 9. Get Resume by ID
**GET** `/users/:userId/resumes/:resumeId`

Retrieves a specific resume with details.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    _id: string;
    userId: string;
    filename: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    title?: string;
    description?: string;
    extractedText: string;
    analysis?: {
      skills: string[];
      experience: string[];
      education: string[];
      summary: string;
    };
    uploadedAt: Date;
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/users/64f1a2b3c4d5e6f7g8h9i0j1/resumes/64f1a2b3c4d5e6f7g8h9i0j2');
```

### 10. Download Resume
**GET** `/users/:userId/resumes/:resumeId/download`

Downloads the original resume file.

**Response:** `200 OK`
- Returns the original file with appropriate headers

**Example:**
```typescript
const response = await fetch('/api/users/64f1a2b3c4d5e6f7g8h9i0j1/resumes/64f1a2b3c4d5e6f7g8h9i0j2/download');
const blob = await response.blob();
```

### 11. Process Resume
**POST** `/users/:userId/resumes/:resumeId/process`

Triggers AI processing of a resume to extract information.

**Request Body:**
```typescript
{
  extractSkills?: boolean;    // Extract skills from resume
  extractExperience?: boolean; // Extract work experience
  extractEducation?: boolean; // Extract education details
  generateSummary?: boolean;  // Generate resume summary
}
```

**Response:** `202 Accepted`
```typescript
{
  success: true;
  message: string;
  data: {
    resumeId: string;
    processingJobId: string;
    status: 'processing';
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/users/64f1a2b3c4d5e6f7g8h9i0j1/resumes/64f1a2b3c4d5e6f7g8h9i0j2/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    extractSkills: true,
    extractExperience: true,
    extractEducation: true,
    generateSummary: true
  })
});
```

### 12. Get Resume Analysis
**GET** `/users/:userId/resumes/:resumeId/analysis`

Retrieves the AI analysis results for a processed resume.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    resumeId: string;
    analysis: {
      skills: {
        name: string;
        confidence: number;
        category?: string;
      }[];
      experience: {
        position: string;
        company: string;
        duration: string;
        description: string;
        responsibilities: string[];
      }[];
      education: {
        degree: string;
        institution: string;
        year?: string;
        details?: string;
      }[];
      summary: string;
      strengths: string[];
      recommendations: string[];
    };
    processedAt: Date;
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/users/64f1a2b3c4d5e6f7g8h9i0j1/resumes/64f1a2b3c4d5e6f7g8h9i0j2/analysis');
```

### 13. Update Resume
**PUT** `/users/:userId/resumes/:resumeId`

Updates resume metadata.

**Request Body:**
```typescript
{
  title?: string;
  description?: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: Resume;
}
```

**Example:**
```typescript
const response = await fetch('/api/users/64f1a2b3c4d5e6f7g8h9i0j1/resumes/64f1a2b3c4d5e6f7g8h9i0j2', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Updated Resume Title",
    description: "Latest version with recent experience"
  })
});
```

### 14. Delete Resume
**DELETE** `/users/:userId/resumes/:resumeId`

Deletes a resume file and its analysis.

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
}
```

**Example:**
```typescript
const response = await fetch('/api/users/64f1a2b3c4d5e6f7g8h9i0j1/resumes/64f1a2b3c4d5e6f7g8h9i0j2', {
  method: 'DELETE'
});
```

## User Authentication (if implemented)

### 15. User Login
**POST** `/users/login`

Authenticates a user and returns access token.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
  data: {
    user: User;
    token: string;
    expiresAt: Date;
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: "john.doe@example.com",
    password: "securepassword"
  })
});
```

### 16. User Logout
**POST** `/users/logout`

Logs out the current user (invalidates token).

**Headers:**
```typescript
{
  'Authorization': 'Bearer <token>'
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  message: "Logged out successfully"
}
```

### 17. Change Password
**PUT** `/users/:userId/password`

Changes a user's password.

**Request Body:**
```typescript
{
  currentPassword: string;
  newPassword: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  message: string;
}
```

**Example:**
```typescript
const response = await fetch('/api/users/64f1a2b3c4d5e6f7g8h9i0j1/password', {
  method: 'PUT',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    currentPassword: "oldpassword",
    newPassword: "newpassword"
  })
});
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

### 401 Unauthorized
```typescript
{
  success: false;
  message: "Invalid credentials" | "Token expired";
}
```

### 403 Forbidden
```typescript
{
  success: false;
  message: "Insufficient permissions";
}
```

### 404 Not Found
```typescript
{
  success: false;
  message: "User not found" | "Resume not found";
}
```

### 409 Conflict
```typescript
{
  success: false;
  message: "Email already exists";
}
```

### 413 Payload Too Large
```typescript
{
  success: false;
  message: "Resume file size exceeds maximum limit";
}
```

## Usage Notes

1. **Legacy System**: These endpoints represent an older user management system
2. **Migration Path**: Consider migrating to the newer candidate system for better features
3. **Resume Processing**: Resume analysis is less advanced than the transcript system
4. **File Limits**: Resume files are limited to 5MB
5. **User Roles**: Role-based access control may be implemented
6. **Authentication**: Token-based authentication if auth endpoints are used

## Migration to Modern System

### From User to Candidate
```typescript
// Old approach with users
const user = await createUser({
  email: "john@example.com",
  name: "John Doe"
});

const resume = await uploadResume(user._id, resumeFile);

// New approach with candidates
const candidate = await createCandidate({
  email: "john@example.com",
  name: "John Doe",
  // ... more structured data
});

const transcript = await uploadTranscript(transcriptFile, {
  candidateId: candidate._id
});
```

### Data Migration Pattern
```typescript
// Migrate user data to candidate system
const users = await getAllUsers();

for (const user of users) {
  // Create corresponding candidate
  const candidate = await createCandidate({
    email: user.email,
    name: user.name,
    phone: user.profile?.phone,
    location: user.profile?.location,
    // Map other fields...
  });

  // Migrate resumes to transcripts if needed
  const resumes = await getUserResumes(user._id);
  for (const resume of resumes) {
    // Convert resume to transcript format
    // Process and apply to candidate
  }
}
```

## Common Integration Patterns

### Basic User Management
```typescript
// Create and setup user
const user = await createUser({
  email: "candidate@example.com",
  name: "Candidate Name",
  role: "candidate"
});

// Upload and process resume
const resume = await uploadResume(user._id, resumeFile);
await processResume(user._id, resume._id, {
  extractSkills: true,
  extractExperience: true
});

// Get analysis results
const analysis = await getResumeAnalysis(user._id, resume._id);
```

### User Search and Filtering
```typescript
// Search for candidates
const candidates = await getUsers({
  role: "candidate",
  search: "javascript developer",
  location: "San Francisco"
});

// Process each candidate's resumes
for (const candidate of candidates) {
  const resumes = await getUserResumes(candidate._id);
  // Analyze resumes...
}
```
