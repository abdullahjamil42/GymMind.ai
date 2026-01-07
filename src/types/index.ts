/**
 * GymMind.ai - Type Definitions
 * =============================
 * Core TypeScript types used throughout the application.
 */

// ==========================================
// User Types
// ==========================================

export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export type FitnessGoal = 
  | 'lose-weight'
  | 'build-muscle'
  | 'gain-strength'
  | 'improve-endurance'
  | 'maintain-fitness'
  | 'general-health';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type TrainingLocation = 'gym' | 'home' | 'both';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface UserProfile {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isOnboardingComplete: boolean;
  
  // Personal info
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  
  // Physical stats
  height?: number; // in cm
  weight?: number; // in kg
  
  // Fitness profile
  fitnessGoal?: FitnessGoal;
  experienceLevel?: ExperienceLevel;
  trainingLocation?: TrainingLocation;
  availableDays?: DayOfWeek[];
  
  // Health info
  injuries?: string[];
  medicalConditions?: string[];
  
  // Calculated values
  bmr?: number; // Basal Metabolic Rate
  tdee?: number; // Total Daily Energy Expenditure
}

// ==========================================
// Workout Types
// ==========================================

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string; // Can be "8-12" or "AMRAP"
  restSeconds: number;
  instructions: string;
  videoUrl?: string;
}

export interface WorkoutDay {
  day: DayOfWeek;
  name: string; // e.g., "Push Day", "Leg Day"
  focus: string[];
  exercises: Exercise[];
  estimatedDuration: number; // minutes
  isRestDay: boolean;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  weekNumber: number;
  goal: FitnessGoal;
  days: WorkoutDay[];
  aiExplanation: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  workoutPlanId: string;
  date: Date;
  day: DayOfWeek;
  exercisesCompleted: {
    exerciseId: string;
    setsCompleted: number;
    repsPerSet: number[];
    weightUsed?: number;
    notes?: string;
  }[];
  duration: number; // minutes
  perceivedExertion: number; // 1-10 scale
  notes?: string;
}

// ==========================================
// Nutrition Types
// ==========================================

export interface MacroNutrients {
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
}

export interface MealEntry {
  id: string;
  userId: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string; // Raw text input
  foods: {
    name: string;
    quantity: string;
    calories: number;
    macros: MacroNutrients;
  }[];
  totalCalories: number;
  totalMacros: MacroNutrients;
  aiParsed: boolean;
}

export interface DailyNutrition {
  date: Date;
  meals: MealEntry[];
  totalCalories: number;
  totalMacros: MacroNutrients;
  calorieGoal: number;
  macroGoals: MacroNutrients;
}

// ==========================================
// Form Check Types
// ==========================================

export type SupportedExercise = 'squat' | 'push-up';

export interface FormCheckResult {
  id: string;
  userId: string;
  createdAt: Date;
  exercise: SupportedExercise;
  videoUrl: string;
  
  // Analysis results
  overallScore: number; // 0-100
  issues: {
    type: string;
    severity: 'minor' | 'moderate' | 'major';
    description: string;
    correction: string;
    timestamp?: number; // seconds in video
  }[];
  
  // Pose data
  keypoints?: {
    frame: number;
    joints: Record<string, { x: number; y: number; confidence: number }>;
  }[];
  
  aiSummary: string;
}

// ==========================================
// Chat Types
// ==========================================

export interface ChatMessage {
  id: string;
  userId: string;
  timestamp: Date;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// Progress Types
// ==========================================

export interface WeightLog {
  id: string;
  userId: string;
  date: Date;
  weight: number; // kg
  notes?: string;
}

export interface ProgressStats {
  userId: string;
  startWeight?: number;
  currentWeight?: number;
  targetWeight?: number;
  weightChange: number;
  workoutsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  avgCaloriesPerDay: number;
  estimatedTimeToGoal?: number; // days
}

// ==========================================
// Routine Analyzer Types
// ==========================================

export interface RoutineInput {
  exercises: {
    name: string;
    setsPerWeek: number;
    muscleGroup: string;
  }[];
}

export interface RoutineAnalysis {
  id: string;
  userId: string;
  createdAt: Date;
  inputRoutine: RoutineInput;
  
  // Analysis
  volumeBreakdown: Record<string, number>;
  muscleBalance: {
    muscle: string;
    status: 'undertrained' | 'optimal' | 'overtrained';
    recommendation: string;
  }[];
  
  // Optimized routine
  optimizedRoutine?: WorkoutPlan;
  
  aiExplanation: string;
}
