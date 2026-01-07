/**
 * GymMind.ai - Constants
 * ======================
 * Application-wide constants.
 */

// ==========================================
// Application Info
// ==========================================

export const APP_NAME = 'GymMind.ai';
export const APP_DESCRIPTION = 'AI-Powered Gym Coach';
export const APP_VERSION = '1.0.0';

// ==========================================
// Feature Flags
// ==========================================

export const FEATURES = {
  FORM_CHECKER: process.env.ENABLE_FORM_CHECKER !== 'false',
  ROUTINE_ANALYZER: process.env.ENABLE_ROUTINE_ANALYZER !== 'false',
  CHATBOT: process.env.ENABLE_CHATBOT !== 'false',
} as const;

// ==========================================
// Fitness Constants
// ==========================================

export const FITNESS_GOALS = [
  { value: 'lose-weight', label: 'Lose Weight', icon: '🔥' },
  { value: 'build-muscle', label: 'Build Muscle', icon: '💪' },
  { value: 'gain-strength', label: 'Gain Strength', icon: '🏋️' },
  { value: 'improve-endurance', label: 'Improve Endurance', icon: '🏃' },
  { value: 'maintain-fitness', label: 'Maintain Fitness', icon: '⚖️' },
  { value: 'general-health', label: 'General Health', icon: '❤️' },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to working out (0-1 years)' },
  { value: 'intermediate', label: 'Intermediate', description: 'Regular training (1-3 years)' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced lifter (3+ years)' },
] as const;

export const TRAINING_LOCATIONS = [
  { value: 'gym', label: 'Gym', description: 'Full gym access with equipment' },
  { value: 'home', label: 'Home', description: 'Limited or no equipment' },
  { value: 'both', label: 'Both', description: 'Mix of gym and home training' },
] as const;

export const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' },
  { value: 'sunday', label: 'Sunday', short: 'Sun' },
] as const;

// ==========================================
// Supported Exercises for Form Check
// ==========================================

export const SUPPORTED_EXERCISES = [
  { value: 'squat', label: 'Squat', description: 'Barbell or bodyweight squat' },
  { value: 'push-up', label: 'Push-up', description: 'Standard push-up' },
] as const;

// ==========================================
// Nutrition Constants
// ==========================================

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { value: 'lunch', label: 'Lunch', icon: '🥗' },
  { value: 'dinner', label: 'Dinner', icon: '🍽️' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
] as const;

// ==========================================
// Rate Limits
// ==========================================

export const RATE_LIMITS = {
  AI_CALLS_PER_DAY: parseInt(process.env.MAX_AI_CALLS_PER_DAY || '100', 10),
  FORM_CHECK_PER_DAY: parseInt(process.env.MAX_FORM_CHECK_CALLS_PER_DAY || '10', 10),
} as const;

// ==========================================
// Validation Constants
// ==========================================

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_CHAT_MESSAGE_LENGTH: 1000,
  MAX_MEAL_DESCRIPTION_LENGTH: 500,
  MIN_HEIGHT_CM: 100,
  MAX_HEIGHT_CM: 250,
  MIN_WEIGHT_KG: 30,
  MAX_WEIGHT_KG: 300,
  MIN_AGE: 13,
  MAX_AGE: 120,
} as const;
