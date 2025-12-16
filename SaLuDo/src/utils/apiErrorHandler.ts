/**
 * API Error Handler
 * Centralized error handling for API requests
 * Extracts meaningful error messages from backend responses
 */

/**
 * Custom API Error class with additional context
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly response?: Response;
  public readonly responseData?: any;

  constructor(
    message: string,
    statusCode: number,
    response?: Response,
    responseData?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
    this.responseData = responseData;

    // Maintains proper stack trace for where our error was thrown
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is an authentication error (401/403)
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  /**
   * Check if error is a validation error (400)
   */
  isValidationError(): boolean {
    return this.statusCode === 400;
  }

  /**
   * Check if error is a not found error (404)
   */
  isNotFoundError(): boolean {
    return this.statusCode === 404;
  }

  /**
   * Check if error is a server error (500+)
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

/**
 * Handle API error responses
 * Extracts error message from backend and throws ApiError
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage = `HTTP ${response.status}`;
  let errorData: any = null;

  try {
    // Try to parse JSON error response
    errorData = await response.json();
    
    // Backend typically returns { success: false, message: "error details" }
    if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.error) {
      errorMessage = errorData.error;
    } else if (typeof errorData === 'string') {
      errorMessage = errorData;
    }
  } catch (e) {
    // If response is not JSON, use status text
    errorMessage = response.statusText || `HTTP ${response.status}`;
  }

  throw new ApiError(errorMessage, response.status, response, errorData);
}

/**
 * Validate API response structure
 * Checks both HTTP status and success field in JSON response
 */
export async function validateApiResponse<T = any>(
  response: Response
): Promise<T> {
  // First check HTTP status
  if (!response.ok) {
    await handleApiError(response);
  }

  // Parse JSON response
  let result: any;
  try {
    result = await response.json();
  } catch (e) {
    throw new ApiError(
      'Invalid JSON response from server',
      response.status,
      response
    );
  }

  // Check success field in response
  if (result.success === false) {
    const errorMessage = result.message || result.error || 'Operation failed';
    throw new ApiError(errorMessage, response.status, response, result);
  }

  return result as T;
}

/**
 * Check if an error is an ApiError instance
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Extract error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred';
}
