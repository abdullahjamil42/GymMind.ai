/**
 * GymMind.ai - Frontend Route Definitions
 * ========================================
 * This file defines all frontend routes/pages in the application.
 * Used for navigation, route guards, and documentation.
 */

export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Onboarding (requires auth, incomplete profile)
  ONBOARDING: '/onboarding',

  // Protected Routes (requires auth + complete profile)
  DASHBOARD: '/dashboard',
  WORKOUT_PLAN: '/workout-plan',
  WORKOUT_SESSION: '/workout/:day', // Dynamic route
  FORM_CHECK: '/form-check',
  CHAT: '/chat',
  NUTRITION: '/nutrition',
  ROUTINE_ANALYZER: '/routine-analyzer',
  PROGRESS: '/progress',
  SETTINGS: '/settings',
} as const;

export type RouteKey = keyof typeof ROUTES;

/**
 * Route metadata for navigation and SEO
 */
export const ROUTE_META: Record<
  string,
  {
    title: string;
    description: string;
    requiresAuth: boolean;
    requiresProfile: boolean;
  }
> = {
  [ROUTES.HOME]: {
    title: 'Home',
    description: 'AI-Powered Gym Coach - Your intelligent fitness companion',
    requiresAuth: false,
    requiresProfile: false,
  },
  [ROUTES.LOGIN]: {
    title: 'Log In',
    description: 'Log in to your GymMind.ai account',
    requiresAuth: false,
    requiresProfile: false,
  },
  [ROUTES.SIGNUP]: {
    title: 'Sign Up',
    description: 'Create your GymMind.ai account',
    requiresAuth: false,
    requiresProfile: false,
  },
  [ROUTES.ONBOARDING]: {
    title: 'Complete Your Profile',
    description: 'Tell us about yourself to personalize your AI experience',
    requiresAuth: true,
    requiresProfile: false,
  },
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard',
    description: 'Your AI fitness command center',
    requiresAuth: true,
    requiresProfile: true,
  },
  [ROUTES.WORKOUT_PLAN]: {
    title: 'Workout Plan',
    description: 'AI-generated personalized workout plans',
    requiresAuth: true,
    requiresProfile: true,
  },
  [ROUTES.FORM_CHECK]: {
    title: 'Form Check',
    description: 'AI-powered exercise form analysis',
    requiresAuth: true,
    requiresProfile: true,
  },
  [ROUTES.CHAT]: {
    title: 'AI Coach',
    description: '24/7 AI gym assistant',
    requiresAuth: true,
    requiresProfile: true,
  },
  [ROUTES.NUTRITION]: {
    title: 'Nutrition',
    description: 'AI-powered calorie and macro tracking',
    requiresAuth: true,
    requiresProfile: true,
  },
  [ROUTES.ROUTINE_ANALYZER]: {
    title: 'Routine Analyzer',
    description: 'AI optimization for your workout routine',
    requiresAuth: true,
    requiresProfile: true,
  },
  [ROUTES.PROGRESS]: {
    title: 'Progress',
    description: 'Track your fitness journey',
    requiresAuth: true,
    requiresProfile: true,
  },
  [ROUTES.SETTINGS]: {
    title: 'Settings',
    description: 'Manage your account and preferences',
    requiresAuth: true,
    requiresProfile: true,
  },
};

/**
 * Navigation items for sidebar/navbar
 */
export const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: ROUTES.WORKOUT_PLAN, label: 'Workout Plan', icon: 'Dumbbell' },
  { href: ROUTES.FORM_CHECK, label: 'Form Check', icon: 'Video' },
  { href: ROUTES.CHAT, label: 'AI Coach', icon: 'MessageCircle' },
  { href: ROUTES.NUTRITION, label: 'Nutrition', icon: 'Utensils' },
  { href: ROUTES.ROUTINE_ANALYZER, label: 'Routine Analyzer', icon: 'Brain' },
  { href: ROUTES.PROGRESS, label: 'Progress', icon: 'TrendingUp' },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: 'Settings' },
] as const;
