/**
 * API Headers Utility
 * Centralized header creation for API requests
 */

import { TokenManager } from './tokenManager';

/**
 * Create headers with authentication token
 * @param accessToken - Optional access token to use (falls back to stored token)
 * @param includeContentType - Whether to include Content-Type: application/json
 */
export function createAuthHeaders(
  accessToken?: string,
  includeContentType: boolean = true
): HeadersInit {
  const token = accessToken || TokenManager.getAccessToken();
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

/**
 * Create headers for multipart form data (file uploads)
 * Note: Content-Type is NOT included - browser will set it with boundary
 */
export function createFormDataHeaders(accessToken?: string): HeadersInit {
  const token = accessToken || TokenManager.getAccessToken();
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do NOT set Content-Type for FormData - browser handles it
  return headers;
}

/**
 * Create basic headers without authentication
 */
export function createBasicHeaders(includeContentType: boolean = true): HeadersInit {
  const headers: HeadersInit = {};

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}
