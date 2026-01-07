/**
 * GymMind.ai - Utility Functions
 * ===============================
 * Common utility functions used across the application.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ==========================================
// Tailwind CSS Utilities
// ==========================================

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==========================================
// Fitness Calculations
// ==========================================

/**
 * Calculate Basal Metabolic Rate (Mifflin-St Jeor equation)
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @param age - Age in years
 * @param gender - 'male' or 'female'
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

/**
 * Calculate Total Daily Energy Expenditure
 * @param bmr - Basal Metabolic Rate
 * @param activityLevel - Activity multiplier
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'
): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very-active': 1.9,
  };
  return Math.round(bmr * multipliers[activityLevel]);
}

/**
 * Calculate recommended macros based on goal
 */
export function calculateMacros(
  tdee: number,
  weight: number,
  goal: 'lose-weight' | 'build-muscle' | 'maintain'
): { protein: number; carbs: number; fat: number; calories: number } {
  let calories: number;
  let proteinMultiplier: number;
  let fatPercent: number;

  switch (goal) {
    case 'lose-weight':
      calories = tdee - 500; // 500 calorie deficit
      proteinMultiplier = 2.2; // Higher protein for muscle retention
      fatPercent = 0.25;
      break;
    case 'build-muscle':
      calories = tdee + 300; // 300 calorie surplus
      proteinMultiplier = 2.0;
      fatPercent = 0.25;
      break;
    default:
      calories = tdee;
      proteinMultiplier = 1.8;
      fatPercent = 0.3;
  }

  const protein = Math.round(weight * proteinMultiplier);
  const fat = Math.round((calories * fatPercent) / 9);
  const carbCalories = calories - protein * 4 - fat * 9;
  const carbs = Math.round(carbCalories / 4);

  return { protein, carbs, fat, calories };
}

// ==========================================
// Date Utilities
// ==========================================

/**
 * Get day of week from date
 */
export function getDayOfWeek(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

/**
 * Format date for display
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (format === 'relative') {
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
  }

  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get start of week (Monday)
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// ==========================================
// Validation Utilities
// ==========================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ==========================================
// Number Utilities
// ==========================================

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to specified decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

// ==========================================
// String Utilities
// ==========================================

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// ==========================================
// API Utilities
// ==========================================

/**
 * Delay execution (for rate limiting, etc.)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse JSON safely
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Extract JSON from LLM response (handles markdown code blocks)
 */
export function extractJsonFromResponse<T>(response: string, fallback: T): T {
  // Try to find JSON in code blocks first
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return safeJsonParse(codeBlockMatch[1].trim(), fallback);
  }

  // Try to parse as-is
  return safeJsonParse(response.trim(), fallback);
}
