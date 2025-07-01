# Candidate REST API Endpoints Reference

This document provides a complete reference for all Candidate-related REST API endpoints for frontend integration.

## Base URL
```
/api/candidates
```

## Authentication
All endpoints require appropriate authentication headers (implementation dependent).

## Common Response Format
```typescript
interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    count?: number;
    error?: string;
}
```

---

## 1. CORE CANDIDATE ENDPOINTS

### Get All Candidates
- **GET** `/api/candidates`
- **Description**: Retrieve all candidates
- **Response**: `GetAllCandidatesResponse`
- **Example Response**:
```json
{
    "success": true,
    "data": [
        {
            "candidateId": "507f1f77bcf86cd799439011",
            "name": "John Doe",
            "email": ["john.doe@email.com"],
            "birthdate": "1990-01-01T00:00:00.000Z",
            "status": "Applied",
            "roleApplied": "507f1f77bcf86cd799439012",
            "dateCreated": "2024-01-01T00:00:00.000Z",
            "dateUpdated": "2024-01-01T00:00:00.000Z",
            "isDeleted": false
            // ... other fields
        }
    ],
    "count": 1
}
```

### Create New Candidate
- **POST** `/api/candidates`
- **Content-Type**: `multipart/form-data`
- **Required Fields**: `name`, `email[]`, `birthdate`, `resume` (file)
- **Optional Fields**: `roleApplied`
- **Input**: `CreateCandidateData` + resume file
- **Response**: `CreateCandidateResponse`
- **Example Request**:
```typescript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john.doe@email.com');
formData.append('birthdate', '1990-01-01');
formData.append('roleApplied', '507f1f77bcf86cd799439012');
formData.append('resume', fileInput.files[0]);
```

### Get Candidate by ID
- **GET** `/api/candidates/:id`
- **Parameters**: `id` (candidateId)
- **Response**: `GetCandidateResponse`

### Update Candidate
- **PUT** `/api/candidates/:id`
- **Parameters**: `id` (candidateId)
- **Input**: `UpdateCandidateData`
- **Response**: `UpdateCandidateResponse`

### Delete Candidate (Soft Delete)
- **DELETE** `/api/candidates/:id`
- **Parameters**: `id` (candidateId)
- **Response**: `DeleteCandidateResponse`

---

## 2. SKILLS ENDPOINTS

### Get Candidate Skills
- **GET** `/api/skills/:candidateId/skills`
- **Parameters**: `candidateId`
- **Query Params**: 
  - `includeUnaccepted` (boolean, default: true)
  - `includeDeleted` (boolean, default: false)
- **Response**: `GetCandidateSkillsResponse`

### Add Skill to Candidate
- **POST** `/api/skills/:candidateId/skills`
- **Parameters**: `candidateId`
- **Input**: `CreateSkillData`
- **Response**: `AddSkillResponse`

### Update Candidate Skill
- **PUT** `/api/skills/:candidateId/skills/:candidateSkillId`
- **Parameters**: `candidateId`, `candidateSkillId`
- **Input**: Partial `SkillData`
- **Response**: `UpdateSkillResponse`

### Delete Skill (Soft Delete)
- **DELETE** `/api/skills/:candidateId/skills/:candidateSkillId`
- **Parameters**: `candidateId`, `candidateSkillId`
- **Response**: `DeleteSkillResponse`

### Restore Deleted Skill
- **PATCH** `/api/skills/:candidateId/skills/:candidateSkillId/restore`
- **Parameters**: `candidateId`, `candidateSkillId`
- **Response**: `ApiResponse<null>`

### Permanently Delete Skill
- **DELETE** `/api/skills/:candidateId/skills/:candidateSkillId/hard`
- **Parameters**: `candidateId`, `candidateSkillId`
- **Response**: `ApiResponse<null>`

### Get Skills by Threshold
- **GET** `/api/skills/:candidateId/skills/threshold/:threshold`
- **Parameters**: `candidateId`, `threshold` (number)
- **Query Params**: `includeUnaccepted` (boolean)
- **Response**: `GetCandidateSkillsResponse`

### Bulk Add Skills
- **POST** `/api/skills/:candidateId/skills/bulk`
- **Parameters**: `candidateId`
- **Input**: `CreateSkillData[]`
- **Response**: `AddSkillResponse`

---

## 3. EDUCATION ENDPOINTS

### Get Candidate Education
- **GET** `/api/candidates/:candidateId/education`
- **Parameters**: `candidateId`
- **Query Params**: `includeDeleted` (boolean, default: false)
- **Response**: `GetEducationResponse`

### Add Education
- **POST** `/api/candidates/:candidateId/education`
- **Parameters**: `candidateId`
- **Input**: `CreateEducationData`
- **Response**: `AddEducationResponse`

### Update Education
- **PUT** `/api/candidates/:candidateId/education/:eduId`
- **Parameters**: `candidateId`, `eduId`
- **Input**: `CreateEducationData`
- **Response**: `UpdateEducationResponse`

### Delete Education (Soft Delete)
- **DELETE** `/api/candidates/:candidateId/education/:eduId`
- **Parameters**: `candidateId`, `eduId`
- **Response**: `DeleteEducationResponse`

### Restore Deleted Education
- **PATCH** `/api/candidates/:candidateId/education/:eduId/restore`
- **Parameters**: `candidateId`, `eduId`
- **Response**: `ApiResponse<null>`

### Permanently Delete Education
- **DELETE** `/api/candidates/:candidateId/education/:eduId/hard`
- **Parameters**: `candidateId`, `eduId`
- **Response**: `ApiResponse<null>`

---

## 4. EXPERIENCE ENDPOINTS

### Get Candidate Experience
- **GET** `/api/candidates/:candidateId/experience`
- **Parameters**: `candidateId`
- **Query Params**: `includeDeleted` (boolean, default: false)
- **Response**: `GetExperienceResponse`

### Add Experience
- **POST** `/api/candidates/:candidateId/experience`
- **Parameters**: `candidateId`
- **Input**: `CreateExperienceData`
- **Response**: `AddExperienceResponse`

### Update Experience
- **PUT** `/api/candidates/:candidateId/experience/:expId`
- **Parameters**: `candidateId`, `expId`
- **Input**: `UpdateExperienceData`
- **Response**: `UpdateExperienceResponse`

### Delete Experience (Soft Delete)
- **DELETE** `/api/candidates/:candidateId/experience/:expId`
- **Parameters**: `candidateId`, `expId`
- **Response**: `DeleteExperienceResponse`

### Restore Deleted Experience
- **PATCH** `/api/candidates/:candidateId/experience/:expId/restore`
- **Parameters**: `candidateId`, `expId`
- **Response**: `ApiResponse<null>`

### Permanently Delete Experience
- **DELETE** `/api/candidates/:candidateId/experience/:expId/hard`
- **Parameters**: `candidateId`, `expId`
- **Response**: `ApiResponse<null>`

---

## 5. CERTIFICATION ENDPOINTS

### Get Candidate Certifications
- **GET** `/api/candidates/:candidateId/certifications`
- **Parameters**: `candidateId`
- **Response**: `GetCertificationsResponse`

### Add Certification
- **POST** `/api/candidates/:candidateId/certifications`
- **Parameters**: `candidateId`
- **Input**: `CreateCertificationData`
- **Response**: `AddCertificationResponse`

### Update Certification
- **PUT** `/api/candidates/:candidateId/certifications/:certId`
- **Parameters**: `candidateId`, `certId`
- **Input**: `CreateCertificationData`
- **Response**: `UpdateCertificationResponse`

### Delete Certification
- **DELETE** `/api/candidates/:candidateId/certifications/:certId`
- **Parameters**: `candidateId`, `certId`
- **Response**: `DeleteCertificationResponse`

---

## 6. STRENGTHS & WEAKNESSES ENDPOINTS

### Get Candidate Strengths
- **GET** `/api/candidates/:candidateId/strengths`
- **Parameters**: `candidateId`
- **Response**: `GetStrengthsResponse`

### Add Strength
- **POST** `/api/candidates/:candidateId/strengths`
- **Parameters**: `candidateId`
- **Input**: `CreateStrengthWeaknessData` (with type: "Strength")
- **Response**: `AddStrengthWeaknessResponse`

### Update Strength
- **PUT** `/api/candidates/:candidateId/strengths/:strengthId`
- **Parameters**: `candidateId`, `strengthId`
- **Input**: `CreateStrengthWeaknessData`
- **Response**: `UpdateStrengthWeaknessResponse`

### Delete Strength
- **DELETE** `/api/candidates/:candidateId/strengths/:strengthId`
- **Parameters**: `candidateId`, `strengthId`
- **Response**: `DeleteStrengthWeaknessResponse`

### Get Candidate Weaknesses
- **GET** `/api/candidates/:candidateId/weaknesses`
- **Parameters**: `candidateId`
- **Response**: `GetWeaknessesResponse`

### Add Weakness
- **POST** `/api/candidates/:candidateId/weaknesses`
- **Parameters**: `candidateId`
- **Input**: `CreateStrengthWeaknessData` (with type: "Weakness")
- **Response**: `AddStrengthWeaknessResponse`

### Update Weakness
- **PUT** `/api/candidates/:candidateId/weaknesses/:weaknessId`
- **Parameters**: `candidateId`, `weaknessId`
- **Input**: `CreateStrengthWeaknessData`
- **Response**: `UpdateStrengthWeaknessResponse`

### Delete Weakness
- **DELETE** `/api/candidates/:candidateId/weaknesses/:weaknessId`
- **Parameters**: `candidateId`, `weaknessId`
- **Response**: `DeleteStrengthWeaknessResponse`

---

## 7. PERSONALITY ENDPOINTS

### Get Candidate Personality
- **GET** `/api/candidates/:candidateId/personality`
- **Parameters**: `candidateId`
- **Response**: `GetPersonalityResponse`

### Update Personality Assessment
- **PUT** `/api/candidates/:candidateId/personality`
- **Parameters**: `candidateId`
- **Input**: Partial `PersonalityData`
- **Response**: `UpdatePersonalityResponse`

---

## 8. TRANSCRIPT ENDPOINTS

### Upload Interview Transcript
- **POST** `/api/candidates/:candidateId/transcripts`
- **Content-Type**: `multipart/form-data`
- **Parameters**: `candidateId`
- **Input**: File + metadata
- **Response**: `UploadTranscriptResponse`

### Get Candidate Transcripts
- **GET** `/api/candidates/:candidateId/transcripts`
- **Parameters**: `candidateId`
- **Response**: `GetTranscriptsResponse`

### Delete Transcript
- **DELETE** `/api/candidates/:candidateId/transcripts/:transcriptId`
- **Parameters**: `candidateId`, `transcriptId`
- **Response**: `DeleteTranscriptResponse`

---

## Error Handling

All endpoints return consistent error responses:
```json
{
    "success": false,
    "message": "Error description",
    "error": "Detailed error message"
}
```

## Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Notes

1. **Soft Deletion**: Most DELETE endpoints perform soft deletion (setting `isDeleted: true`). Use `/hard` endpoints for permanent deletion.

2. **File Uploads**: Resume and transcript uploads use `multipart/form-data`. Supported formats:
   - Resume: PDF, DOC, DOCX (max 10MB)
   - Transcripts: Audio files, text files

3. **Date Formats**: All dates should be in ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`)

4. **Validation**: 
   - Email addresses are validated
   - Required fields are enforced
   - File types and sizes are validated

5. **AI Integration**: Resume parsing and transcript processing happen automatically after upload.
