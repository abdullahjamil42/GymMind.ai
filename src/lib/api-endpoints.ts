/**
 * GymMind.ai - API Endpoint Definitions
 * ======================================
 * This file defines all backend API endpoints.
 * Used for frontend API calls and documentation.
 */

/**
 * API Base Configuration
 */
export const API_BASE = '/api';
export const API_VERSION = 'v1';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // ==========================================
  // Authentication Endpoints
  // ==========================================
  AUTH: {
    REGISTER: `${API_BASE}/auth/register`,        // POST - Create new user
    LOGIN: `${API_BASE}/auth/login`,              // POST - User login
    LOGOUT: `${API_BASE}/auth/logout`,            // POST - User logout
    SESSION: `${API_BASE}/auth/session`,          // GET  - Get current session
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`, // POST - Request password reset
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,   // POST - Reset password
  },

  // ==========================================
  // User Profile Endpoints
  // ==========================================
  USER: {
    PROFILE: `${API_BASE}/user/profile`,          // GET/PUT - Get or update profile
    ONBOARDING: `${API_BASE}/user/onboarding`,    // POST - Complete onboarding
    SETTINGS: `${API_BASE}/user/settings`,        // GET/PUT - User settings
    DELETE: `${API_BASE}/user/delete`,            // DELETE - Delete account & data
  },

  // ==========================================
  // AI Workout Plan Endpoints
  // ==========================================
  WORKOUT: {
    GENERATE_PLAN: `${API_BASE}/workout/generate`, // POST - Generate AI workout plan
    GET_PLAN: `${API_BASE}/workout/plan`,          // GET  - Get current workout plan
    GET_DAY: `${API_BASE}/workout/day/:day`,       // GET  - Get specific day workout
    LOG_SESSION: `${API_BASE}/workout/log`,        // POST - Log completed workout
    HISTORY: `${API_BASE}/workout/history`,        // GET  - Get workout history
    EXPLAIN: `${API_BASE}/workout/explain`,        // POST - AI explains exercise
  },

  // ==========================================
  // AI Chatbot Endpoints
  // ==========================================
  CHAT: {
    SEND: `${API_BASE}/chat/send`,                // POST - Send message to AI
    HISTORY: `${API_BASE}/chat/history`,          // GET  - Get chat history
    CLEAR: `${API_BASE}/chat/clear`,              // DELETE - Clear chat history
  },

  // ==========================================
  // AI Form Checker Endpoints
  // ==========================================
  FORM_CHECK: {
    UPLOAD: `${API_BASE}/form-check/upload`,      // POST - Upload video for analysis
    ANALYZE: `${API_BASE}/form-check/analyze`,    // POST - Analyze uploaded video
    RESULTS: `${API_BASE}/form-check/results/:id`,// GET  - Get analysis results
    HISTORY: `${API_BASE}/form-check/history`,    // GET  - Get form check history
  },

  // ==========================================
  // Nutrition Tracking Endpoints
  // ==========================================
  NUTRITION: {
    LOG_MEAL: `${API_BASE}/nutrition/log`,        // POST - Log meal with AI parsing
    GET_DAILY: `${API_BASE}/nutrition/daily`,     // GET  - Get daily nutrition
    GET_WEEKLY: `${API_BASE}/nutrition/weekly`,   // GET  - Get weekly summary
    SEARCH_FOOD: `${API_BASE}/nutrition/search`,  // GET  - Search food database
    DELETE_MEAL: `${API_BASE}/nutrition/meal/:id`,// DELETE - Delete logged meal
    UPDATE_GOALS: `${API_BASE}/nutrition/goals`,  // PUT  - Update nutrition goals
  },

  // ==========================================
  // Routine Analyzer Endpoints
  // ==========================================
  ROUTINE: {
    ANALYZE: `${API_BASE}/routine/analyze`,       // POST - Analyze routine with AI
    OPTIMIZE: `${API_BASE}/routine/optimize`,     // POST - Get optimized routine
    SAVE: `${API_BASE}/routine/save`,             // POST - Save optimized routine
  },

  // ==========================================
  // Progress Tracking Endpoints
  // ==========================================
  PROGRESS: {
    LOG_WEIGHT: `${API_BASE}/progress/weight`,    // POST - Log weight
    LOG_MEASUREMENT: `${API_BASE}/progress/measurement`, // POST - Log body measurement
    GET_STATS: `${API_BASE}/progress/stats`,      // GET  - Get progress statistics
    GET_PREDICTIONS: `${API_BASE}/progress/predictions`, // GET  - Get AI predictions
    GET_TIMELINE: `${API_BASE}/progress/timeline`,// GET  - Get progress timeline
  },

  // ==========================================
  // Health Check / Utility Endpoints
  // ==========================================
  HEALTH: {
    STATUS: `${API_BASE}/health`,                 // GET  - API health check
    VERSION: `${API_BASE}/version`,               // GET  - API version info
  },
} as const;

/**
 * API Request Types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * API Error Codes
 */
export const API_ERRORS = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DAILY_LIMIT_EXCEEDED: 'DAILY_LIMIT_EXCEEDED',
  
  // AI service errors
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  AI_QUOTA_EXCEEDED: 'AI_QUOTA_EXCEEDED',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
