/**
 * Password Validator
 * Validates passwords according to backend requirements
 * Matches backend validation in routes/users.ts
 */

// Internal validation result (for the class)
interface InternalPasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength?: 'weak' | 'medium' | 'strong';
}

export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export class PasswordValidator {
  static readonly MIN_LENGTH = 8;
  static readonly UPPERCASE_REGEX = /[A-Z]/;
  static readonly LOWERCASE_REGEX = /[a-z]/;
  static readonly NUMBER_REGEX = /[0-9]/;
  static readonly SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

  /**
   * Validate password against all requirements
   */
  static validate(password: string): InternalPasswordValidationResult {
    const errors: string[] = [];

    if (!password || password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    }

    if (!this.UPPERCASE_REGEX.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!this.LOWERCASE_REGEX.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!this.NUMBER_REGEX.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!this.SPECIAL_CHAR_REGEX.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
    }

    const strength = this.calculateStrength(password);

    return {
      valid: errors.length === 0,
      errors,
      strength
    };
  }

  /**
   * Check which requirements are met
   */
  static checkRequirements(password: string): PasswordRequirements {
    return {
      minLength: password.length >= this.MIN_LENGTH,
      hasUppercase: this.UPPERCASE_REGEX.test(password),
      hasLowercase: this.LOWERCASE_REGEX.test(password),
      hasNumber: this.NUMBER_REGEX.test(password),
      hasSpecialChar: this.SPECIAL_CHAR_REGEX.test(password)
    };
  }

  /**
   * Calculate password strength
   */
  static calculateStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (!password) return 'weak';

    let score = 0;

    // Length score
    if (password.length >= this.MIN_LENGTH) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    // Character variety score
    if (this.UPPERCASE_REGEX.test(password)) score++;
    if (this.LOWERCASE_REGEX.test(password)) score++;
    if (this.NUMBER_REGEX.test(password)) score++;
    if (this.SPECIAL_CHAR_REGEX.test(password)) score++;

    // Multiple special characters bonus
    const specialMatches = password.match(/[!@#$%^&*(),.?":{}|<>]/g);
    if (specialMatches && specialMatches.length > 2) score++;

    if (score <= 3) return 'weak';
    if (score <= 6) return 'medium';
    return 'strong';
  }

  /**
   * Get user-friendly requirement descriptions
   */
  static getRequirementDescriptions(): string[] {
    return [
      `At least ${this.MIN_LENGTH} characters long`,
      'Contains at least one uppercase letter (A-Z)',
      'Contains at least one lowercase letter (a-z)',
      'Contains at least one number (0-9)',
      'Contains at least one special character (!@#$%^&*(),.?":{}|<>)'
    ];
  }

  /**
   * Quick validation - returns only boolean
   */
  static isValid(password: string): boolean {
    return this.validate(password).valid;
  }
}

// ============================================
// Convenience Functions (for easier imports)
// ============================================

export interface PasswordValidationResult {
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
  messages: string[];
}

/**
 * Validate password and return detailed result
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  const requirements = {
    minLength: !!(password && password.length >= PasswordValidator.MIN_LENGTH),
    hasUpperCase: PasswordValidator.UPPERCASE_REGEX.test(password),
    hasLowerCase: PasswordValidator.LOWERCASE_REGEX.test(password),
    hasNumber: PasswordValidator.NUMBER_REGEX.test(password),
    hasSpecialChar: PasswordValidator.SPECIAL_CHAR_REGEX.test(password),
  };

  if (!requirements.minLength) {
    errors.push(`Password must be at least ${PasswordValidator.MIN_LENGTH} characters long`);
  }
  if (!requirements.hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!requirements.hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!requirements.hasNumber) {
    errors.push('Password must contain at least one number');
  }
  if (!requirements.hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    requirements,
    messages: errors,
  };
}

/**
 * Get password strength as a percentage (0-100)
 */
export function getPasswordStrength(password: string): number {
  if (!password) return 0;

  let score = 0;
  
  // Length scoring
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Character type scoring
  if (PasswordValidator.UPPERCASE_REGEX.test(password)) score += 15;
  if (PasswordValidator.LOWERCASE_REGEX.test(password)) score += 15;
  if (PasswordValidator.NUMBER_REGEX.test(password)) score += 15;
  if (PasswordValidator.SPECIAL_CHAR_REGEX.test(password)) score += 15;

  return Math.min(100, score);
}

/**
 * Validate if passwords match
 */
export function validatePasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}

/**
 * Get password requirements as text array
 */
export function getPasswordRequirementsText(): string[] {
  return PasswordValidator.getRequirementDescriptions();
}
