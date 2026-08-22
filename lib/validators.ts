/**
 * Input sanitization and format validation utilities for DayFlow HRMS
 */

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // strip potential HTML tags
    .slice(0, 500); // enforce maximum length
}

export function validateEmailFormat(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

export function validateEmployeeId(empId: string): boolean {
  if (!empId) return false;
  return /^DF-\d{4}$/.test(empId.trim());
}

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0 to 4
  errors: string[];
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const errors: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score++;
  }

  if (/[A-Z]/.test(password)) score++;
  else errors.push('Password must contain at least one uppercase letter');

  if (/[0-9]/.test(password)) score++;
  else errors.push('Password must contain at least one number');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else errors.push('Password must contain at least one special character');

  return {
    isValid: errors.length === 0,
    score,
    errors,
  };
}
