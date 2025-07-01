// ==============================================================================
// SALUDO API FRONTEND INTEGRATION PACKAGE
// ==============================================================================

// Export all candidate types and interfaces (primary export)
export * from './types/CandidateApiTypes';

// Export API clients
export * from './clients/CandidateApiClient';
export * from './clients/AllApiClients';

// For other types, import what you need from individual files:
// import { JobData, CreateJobData } from './JobApiTypes';
// import { SkillMasterData } from './SkillApiTypes';
// import { TranscriptData } from './TranscriptApiTypes';
// import { UserData } from './UserApiTypes';

// ==============================================================================
// QUICK START GUIDE
// ==============================================================================

/**
 * Welcome to the SaLuDo API Frontend Integration Package!
 * 
 * This package provides everything you need to integrate with the SaLuDo backend:
 * 
 * 1. TYPE-SAFE INTERFACES
 *    - All request/response types for every API endpoint
 *    - Enums for consistent data values
 *    - Full TypeScript support with IntelliSense
 * 
 * 2. READY-TO-USE API CLIENTS
 *    - Pre-built client classes for all major endpoints
 *    - Error handling and response parsing included
 *    - Framework-agnostic (works with React, Vue, Angular, etc.)
 * 
 * 3. COMPREHENSIVE DOCUMENTATION
 *    - Detailed endpoint documentation with examples
 *    - Usage patterns and best practices
 *    - Integration guides for common scenarios
 * 
 * GETTING STARTED - CANDIDATE MANAGEMENT:
 * 
 * ```typescript
 * import { CandidateApiClient, CreateCandidateData } from './ForFrontEnd';
 * 
 * const client = new CandidateApiClient();
 * 
 * const newCandidate: CreateCandidateData = {
 *   email: "john.doe@example.com",
 *   name: "John Doe",
 *   phone: "+1-555-0123"
 * };
 * 
 * const result = await client.createCandidate(newCandidate);
 * if (result.success) {
 *   console.log('Created candidate:', result.data);
 * }
 * ```
 * 
 * COMPLETE API INTEGRATION:
 * 
 * ```typescript
 * import { AllApiClients } from './ForFrontEnd';
 * import { JobData, CreateJobData } from './ForFrontEnd/JobApiTypes';
 * 
 * const api = new AllApiClients();
 * 
 * // Create job with skill requirements
 * const jobData: CreateJobData = {
 *   name: "Frontend Developer",
 *   description: "React developer position"
 * };
 * 
 * const job = await api.jobs.createJob(jobData);
 * 
 * // Add skill requirements
 * await api.jobs.bulkAddJobSkills(job.data._id, {
 *   skills: [{ skillId: "react-id", level: "Advanced", isRequired: true }]
 * });
 * 
 * // Find matching candidates
 * const matches = await api.jobs.getMatchingCandidates(job.data._id);
 * ```
 * 
 * IMPORTING TYPES FROM SPECIFIC FILES:
 * 
 * ```typescript
 * // Import candidate types (included in main export)
 * import { CandidateData, CreateCandidateData } from './ForFrontEnd';
 * 
 * // Import job types
 * import { JobData, CreateJobData } from './ForFrontEnd/JobApiTypes';
 * 
 * // Import skill types
 * import { SkillMasterData } from './ForFrontEnd/SkillApiTypes';
 * 
 * // Import transcript types
 * import { TranscriptData } from './ForFrontEnd/TranscriptApiTypes';
 * 
 * // Import user types (legacy)
 * import { UserData } from './ForFrontEnd/UserApiTypes';
 * ```
 * 
 * DOCUMENTATION FILES:
 * 
 * 📖 API_COMPLETE_DOCUMENTATION.md - Complete API overview and guide
 * 👥 CandidateApiEndpoints.md - Candidate management endpoints (25+ endpoints)
 * 💼 JobApiEndpoints.md - Job management and matching endpoints (12+ endpoints)
 * 🎯 SkillApiEndpoints.md - Skill management endpoints (17+ endpoints)
 * 📄 TranscriptApiEndpoints.md - File upload and AI analysis endpoints (16+ endpoints)
 * 👤 UserApiEndpoints.md - Legacy user management endpoints (17+ endpoints)
 * 
 * TYPE DEFINITION FILES:
 * 
 * 📝 CandidateApiTypes.ts - All candidate-related interfaces and enums
 * 📝 JobApiTypes.ts - All job-related interfaces and enums
 * 📝 SkillApiTypes.ts - All skill-related interfaces and enums
 * 📝 TranscriptApiTypes.ts - All transcript-related interfaces and enums
 * 📝 UserApiTypes.ts - All user-related interfaces and enums
 * 
 * API CLIENT FILES:
 * 
 * 🔧 CandidateApiClient.ts - Candidate management API client with examples
 * 🔧 AllApiClients.ts - Unified API client for all endpoints with examples
 * 
 * FEATURES:
 * 
 * ✅ Full CRUD Operations - Create, Read, Update, Delete for all resources
 * ✅ Soft Deletion - Resources can be soft-deleted and restored
 * ✅ Bulk Operations - Efficient batch processing
 * ✅ AI Integration - Gemini AI for resume and transcript analysis
 * ✅ File Handling - Upload and process PDF, DOC, TXT files
 * ✅ Advanced Search - Filter, search, and match candidates
 * ✅ TypeScript Support - Fully typed interfaces and clients
 * ✅ Error Handling - Comprehensive error handling and validation
 * ✅ Pagination - Built-in pagination support for large datasets
 * ✅ Framework Agnostic - Works with React, Vue, Angular, vanilla JS
 * 
 * QUICK REFERENCE:
 * 
 * // Unified client (recommended for multiple endpoints)
 * const api = new AllApiClients();
 * const candidates = await api.candidates.getAllCandidates();
 * const jobs = await api.jobs.getAllJobs();
 * const skills = await api.skills.getAllSkills();
 * 
 * // Individual clients (for specific endpoints only)
 * const candidateClient = new CandidateApiClient();
 * const candidates = await candidateClient.getAllCandidates();
 * 
 * // File uploads
 * const transcript = await api.transcripts.uploadTranscript(file, { candidateId });
 * 
 * // AI processing
 * await api.transcripts.processTranscript(transcriptId, { analysisType: 'comprehensive' });
 * 
 * ERROR HANDLING:
 * 
 * ```typescript
 * try {
 *   const result = await api.candidates.createCandidate(data);
 *   if (!result.success) {
 *     console.error('API Error:', result.message);
 *     // Handle validation errors
 *     if (result.errors) {
 *       result.errors.forEach(err => console.error(`${err.field}: ${err.message}`));
 *     }
 *   }
 * } catch (error) {
 *   console.error('Network Error:', error);
 * }
 * ```
 * 
 * CONFIGURATION:
 * 
 * Update API_BASE_URL in the client files to match your backend:
 * - Development: http://localhost:3000/api
 * - Production: https://your-api-domain.com/api
 * 
 * Add authentication headers if required:
 * ```typescript
 * const client = new AllApiClients();
 * // Authentication will be added when backend implements it
 * ```
 * 
 * NOTES:
 * 
 * - This index file exports candidate types by default to avoid naming conflicts
 * - For other types (jobs, skills, transcripts, users), import from specific files
 * - All API clients are available through the unified AllApiClients class
 * - Comprehensive documentation is available in the .md files
 * - All endpoints support soft deletion and bulk operations where applicable
 * 
 * For complete documentation and examples, see the individual .md files.
 */
