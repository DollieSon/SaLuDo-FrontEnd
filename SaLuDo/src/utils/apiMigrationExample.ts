/**
 * API Client Migration Guide
 * 
 * This file demonstrates how to migrate from the old fetch-based API calls
 * to the new Axios-based apiClient with automatic 401 handling.
 */

import apiClient from './apiClient';

/**
 * BEFORE (Old Pattern - using fetch):
 * 
 * export const candidatesApi = {
 *   getAllCandidates: async (accessToken?: string) => {
 *     const headers: HeadersInit = {};
 *     if (accessToken) {
 *       headers["Authorization"] = `Bearer ${accessToken}`;
 *     } else {
 *       const token = localStorage.getItem("accessToken");
 *       if (token) {
 *         headers["Authorization"] = `Bearer ${token}`;
 *       }
 *     }
 *     const response = await fetch(`${apiUrl}candidates`, { headers });
 *     if (!response.ok) throw new Error("Failed to fetch candidates");
 *     return response.json();
 *   }
 * }
 */

/**
 * AFTER (New Pattern - using apiClient):
 * 
 * No need to pass accessToken - automatically added by interceptor
 * No need to handle 401 - automatically refreshes token and retries
 */
export const candidatesApiNew = {
  // Simple GET request
  getAllCandidates: async () => {
    const response = await apiClient.get('/candidates');
    return response.data;
  },

  // GET with path params
  getCandidateById: async (candidateId: string) => {
    const response = await apiClient.get(`/candidates/${candidateId}`);
    return response.data;
  },

  // POST with JSON body
  createCandidate: async (candidateData: any) => {
    const response = await apiClient.post('/candidates', candidateData);
    return response.data;
  },

  // POST with FormData (multipart)
  uploadFile: async (candidateId: string, formData: FormData) => {
    const response = await apiClient.post(
      `/candidates/${candidateId}/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // PUT request
  updateCandidate: async (candidateId: string, updates: any) => {
    const response = await apiClient.put(`/candidates/${candidateId}`, updates);
    return response.data;
  },

  // DELETE request
  deleteCandidate: async (candidateId: string) => {
    const response = await apiClient.delete(`/candidates/${candidateId}`);
    return response.data;
  },

  // GET with query parameters
  searchCandidates: async (params: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/candidates/search', { params });
    return response.data;
  },
};

/**
 * Benefits of using apiClient:
 * 
 * 1. ✅ Automatic Bearer token injection
 *    - No need to manually add Authorization header
 *    - No need to check localStorage
 * 
 * 2. ✅ Automatic 401 handling
 *    - Automatically refreshes token when expired
 *    - Retries failed request with new token
 *    - Prevents duplicate refresh requests
 * 
 * 3. ✅ Automatic logout on refresh failure
 *    - Clears localStorage
 *    - Redirects to login page
 * 
 * 4. ✅ Cleaner code
 *    - No repetitive error handling
 *    - No manual token management
 *    - Consistent API across all endpoints
 * 
 * 5. ✅ Better TypeScript support
 *    - Full Axios types
 *    - Better error typing
 */

/**
 * Migration Checklist:
 * 
 * For each API function in api.ts:
 * 
 * 1. Remove accessToken parameter
 * 2. Remove manual Authorization header logic
 * 3. Remove localStorage.getItem('accessToken') calls
 * 4. Replace fetch() with apiClient.get/post/put/delete
 * 5. Remove manual JSON parsing (apiClient does it automatically)
 * 6. Update error messages if needed
 * 7. Test the endpoint
 * 
 * Example:
 * 
 * OLD:
 * getAllUsers: async (accessToken: string) => {
 *   const response = await fetch(`${apiUrl}users`, {
 *     headers: { Authorization: `Bearer ${accessToken}` }
 *   });
 *   if (!response.ok) throw new Error("Failed");
 *   return response.json();
 * }
 * 
 * NEW:
 * getAllUsers: async () => {
 *   const response = await apiClient.get('/users');
 *   return response.data;
 * }
 */

/**
 * Error Handling:
 * 
 * The apiClient automatically handles 401 errors, but you may still want to
 * handle other errors in your components:
 * 
 * try {
 *   const data = await candidatesApiNew.getAllCandidates();
 *   // Handle success
 * } catch (error) {
 *   if (axios.isAxiosError(error)) {
 *     if (error.response?.status === 403) {
 *       // Handle forbidden
 *     } else if (error.response?.status === 404) {
 *       // Handle not found
 *     } else {
 *       // Handle other errors
 *     }
 *   }
 * }
 */

/**
 * Usage in Components:
 * 
 * import { candidatesApiNew } from '../utils/apiMigrationExample';
 * 
 * const MyComponent = () => {
 *   const loadCandidates = async () => {
 *     try {
 *       const data = await candidatesApiNew.getAllCandidates();
 *       setCandidates(data.candidates);
 *     } catch (error) {
 *       console.error('Failed to load candidates:', error);
 *     }
 *   };
 * 
 *   // No need to pass accessToken anymore!
 * };
 */
