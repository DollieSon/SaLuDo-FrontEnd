/**
 * Token Manager
 * Centralized token management for authentication
 * Handles storage, retrieval, and validation of access/refresh tokens
 */

interface TokenData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly ACCESS_TOKEN_EXPIRY_KEY = 'accessTokenExpiry';
  private static readonly REFRESH_TOKEN_EXPIRY_KEY = 'refreshTokenExpiry';
  private static readonly LEGACY_TOKEN_KEY = 'token'; // For backward compatibility

  /**
   * Get the current access token
   * Checks both new and legacy storage keys for backward compatibility
   */
  static getAccessToken(): string | null {
    return (
      localStorage.getItem(this.ACCESS_TOKEN_KEY) ||
      localStorage.getItem(this.LEGACY_TOKEN_KEY) ||
      null
    );
  }

  /**
   * Get the current refresh token
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || null;
  }

  /**
   * Get access token expiry date
   */
  static getAccessTokenExpiry(): Date | null {
    const expiry = localStorage.getItem(this.ACCESS_TOKEN_EXPIRY_KEY);
    return expiry ? new Date(expiry) : null;
  }

  /**
   * Get refresh token expiry date
   */
  static getRefreshTokenExpiry(): Date | null {
    const expiry = localStorage.getItem(this.REFRESH_TOKEN_EXPIRY_KEY);
    return expiry ? new Date(expiry) : null;
  }

  /**
   * Save complete token data from login/refresh response
   */
  static saveTokens(data: TokenData): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(this.ACCESS_TOKEN_EXPIRY_KEY, data.accessTokenExpiry);
    localStorage.setItem(this.REFRESH_TOKEN_EXPIRY_KEY, data.refreshTokenExpiry);
    
    // Also set legacy key for backward compatibility
    localStorage.setItem(this.LEGACY_TOKEN_KEY, data.accessToken);
  }

  /**
   * Set only the access token (for partial updates)
   */
  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    localStorage.setItem(this.LEGACY_TOKEN_KEY, token); // Legacy support
  }

  /**
   * Set only the refresh token (for partial updates)
   */
  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Clear all stored tokens and expiry data
   */
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ACCESS_TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.LEGACY_TOKEN_KEY);
  }

  /**
   * Check if access token is expired
   */
  static isAccessTokenExpired(): boolean {
    const expiry = this.getAccessTokenExpiry();
    if (!expiry) return true;
    return expiry <= new Date();
  }

  /**
   * Check if refresh token is expired
   */
  static isRefreshTokenExpired(): boolean {
    const expiry = this.getRefreshTokenExpiry();
    if (!expiry) return true;
    return expiry <= new Date();
  }

  /**
   * Check if access token should be refreshed proactively
   * Returns true if token expires in less than 5 minutes
   */
  static shouldRefreshToken(): boolean {
    const expiry = this.getAccessTokenExpiry();
    if (!expiry) return true;
    
    const fiveMinutesInMs = 5 * 60 * 1000;
    const timeUntilExpiry = expiry.getTime() - Date.now();
    
    return timeUntilExpiry < fiveMinutesInMs;
  }

  /**
   * Check if user has valid tokens (not expired)
   */
  static hasValidTokens(): boolean {
    return (
      !!this.getAccessToken() &&
      !this.isAccessTokenExpired() &&
      !!this.getRefreshToken() &&
      !this.isRefreshTokenExpired()
    );
  }

  /**
   * Check if user is authenticated (has any token, even if needs refresh)
   */
  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  /**
   * Get time remaining until access token expires (in milliseconds)
   */
  static getTimeUntilExpiry(): number {
    const expiry = this.getAccessTokenExpiry();
    if (!expiry) return 0;
    return Math.max(0, expiry.getTime() - Date.now());
  }
}
