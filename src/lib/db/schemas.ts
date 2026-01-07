/**
 * GymMind.ai - MongoDB Database Schemas
 * ======================================
 * Mongoose schemas for all collections.
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ==========================================
// User Schema
// ==========================================

export interface IUser extends Document {
  email: string;
  isOnboardingComplete: boolean;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  height?: number;
  weight?: number;
  fitnessGoal?: string;
  experienceLevel?: string;
  trainingLocation?: string;
  availableDays?: string[];
  injuries?: string[];
  medicalConditions?: string[];
  bmr?: number;
  tdee?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isOnboardingComplete: {
      type: Boolean,
      default: false,
    },
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    },
    height: Number,
    weight: Number,
    fitnessGoal: {
      type: String,
      enum: [
        'lose-weight',
        'build-muscle',
        'gain-strength',
        'improve-endurance',
        'maintain-fitness',
        'general-health',
      ],
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    trainingLocation: {
      type: String,
      enum: ['gym', 'home', 'both'],
    },
    availableDays: [
      {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
    ],
    injuries: [String],
    medicalConditions: [String],
    bmr: Number,
    tdee: Number,
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Workout Plan Schema
// ==========================================

export interface IWorkoutPlan extends Document {
  userId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  weekNumber: number;
  goal?: string;
  days: unknown[];
  aiExplanation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema({
  name: { type: String, required: true },
  muscleGroup: { type: String, required: true },
  equipment: String,
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  restSeconds: { type: Number, default: 90 },
  instructions: String,
  videoUrl: String,
});

const WorkoutDaySchema = new Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true,
  },
  name: { type: String, required: true },
  focus: [String],
  exercises: [ExerciseSchema],
  estimatedDuration: Number,
  isRestDay: { type: Boolean, default: false },
});

const WorkoutPlanSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    weekNumber: { type: Number, default: 1 },
    goal: {
      type: String,
      enum: [
        'lose-weight',
        'build-muscle',
        'gain-strength',
        'improve-endurance',
        'maintain-fitness',
        'general-health',
      ],
    },
    days: [WorkoutDaySchema],
    aiExplanation: String,
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Workout Log Schema
// ==========================================

export interface IWorkoutLog extends Document {
  userId: Types.ObjectId;
  workoutPlanId?: Types.ObjectId;
  date: Date;
  day?: string;
  exercisesCompleted: unknown[];
  duration?: number;
  perceivedExertion?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workoutPlanId: { type: Schema.Types.ObjectId, ref: 'WorkoutPlan' },
    date: { type: Date, required: true },
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    exercisesCompleted: [
      {
        exerciseId: String,
        setsCompleted: Number,
        repsPerSet: [Number],
        weightUsed: Number,
        notes: String,
      },
    ],
    duration: Number,
    perceivedExertion: { type: Number, min: 1, max: 10 },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Meal Entry Schema
// ==========================================

export interface IMealEntry extends Document {
  userId: Types.ObjectId;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  foods: unknown[];
  totalCalories?: number;
  totalMacros?: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  aiParsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MealEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    description: { type: String, required: true },
    foods: [
      {
        name: String,
        quantity: String,
        calories: Number,
        macros: {
          protein: Number,
          carbs: Number,
          fat: Number,
          fiber: Number,
        },
      },
    ],
    totalCalories: Number,
    totalMacros: {
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
    },
    aiParsed: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Form Check Result Schema
// ==========================================

export interface IFormCheckResult extends Document {
  userId: Types.ObjectId;
  exercise: 'squat' | 'push-up';
  videoUrl: string;
  overallScore?: number;
  issues: unknown[];
  keypoints?: unknown[];
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormCheckResultSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    exercise: {
      type: String,
      enum: ['squat', 'push-up'],
      required: true,
    },
    videoUrl: { type: String, required: true },
    overallScore: { type: Number, min: 0, max: 100 },
    issues: [
      {
        type: { type: String },
        severity: {
          type: String,
          enum: ['minor', 'moderate', 'major'],
        },
        description: String,
        correction: String,
        timestamp: Number,
      },
    ],
    keypoints: [
      {
        frame: Number,
        joints: Schema.Types.Mixed,
      },
    ],
    aiSummary: String,
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Chat Message Schema
// ==========================================

export interface IChatMessage extends Document {
  userId: Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Weight Log Schema
// ==========================================

export interface IWeightLog extends Document {
  userId: Types.ObjectId;
  date: Date;
  weight: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WeightLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    weight: { type: Number, required: true },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Routine Analysis Schema
// ==========================================

export interface IRoutineAnalysis extends Document {
  userId: Types.ObjectId;
  inputRoutine: {
    exercises: Array<{
      name: string;
      setsPerWeek: number;
      muscleGroup: string;
    }>;
  };
  volumeBreakdown?: Record<string, number>;
  muscleBalance?: unknown[];
  optimizedRoutine?: unknown;
  aiExplanation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoutineAnalysisSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    inputRoutine: {
      exercises: [
        {
          name: String,
          setsPerWeek: Number,
          muscleGroup: String,
        },
      ],
    },
    volumeBreakdown: Schema.Types.Mixed,
    muscleBalance: [
      {
        muscle: String,
        status: {
          type: String,
          enum: ['undertrained', 'optimal', 'overtrained'],
        },
        recommendation: String,
      },
    ],
    optimizedRoutine: Schema.Types.Mixed,
    aiExplanation: String,
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Model Exports
// ==========================================

// Prevent model recompilation in development
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export const WorkoutPlanModel: Model<IWorkoutPlan> =
  mongoose.models.WorkoutPlan || mongoose.model<IWorkoutPlan>('WorkoutPlan', WorkoutPlanSchema);

export const WorkoutLogModel: Model<IWorkoutLog> =
  mongoose.models.WorkoutLog || mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);

export const MealEntryModel: Model<IMealEntry> =
  mongoose.models.MealEntry || mongoose.model<IMealEntry>('MealEntry', MealEntrySchema);

export const FormCheckResultModel: Model<IFormCheckResult> =
  mongoose.models.FormCheckResult ||
  mongoose.model<IFormCheckResult>('FormCheckResult', FormCheckResultSchema);

export const ChatMessageModel: Model<IChatMessage> =
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

export const WeightLogModel: Model<IWeightLog> =
  mongoose.models.WeightLog || mongoose.model<IWeightLog>('WeightLog', WeightLogSchema);

export const RoutineAnalysisModel: Model<IRoutineAnalysis> =
  mongoose.models.RoutineAnalysis ||
  mongoose.model<IRoutineAnalysis>('RoutineAnalysis', RoutineAnalysisSchema);
