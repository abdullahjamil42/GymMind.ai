/**
 * GymMind.ai - AI Prompt Templates
 * =================================
 * Centralized prompt templates for all AI features.
 */

import { UserProfile, FitnessGoal, ExperienceLevel } from '@/types';

// ==========================================
// System Prompts
// ==========================================

export const SYSTEM_PROMPTS = {
  /**
   * Base system prompt for all gym-related AI interactions
   */
  GYM_COACH: `You are GymMind AI, an expert fitness coach and nutritionist. 
You provide science-based, personalized fitness advice.

Guidelines:
- Be encouraging but realistic
- Base recommendations on exercise science
- Consider user's experience level and limitations
- Never provide medical diagnoses or treatment advice
- Always prioritize safety
- Use clear, actionable language
- When unsure, recommend consulting a professional`,

  /**
   * Workout plan generation system prompt
   */
  WORKOUT_PLANNER: `You are an expert fitness coach specializing in workout program design.
You create personalized, progressive workout plans based on:
- User's fitness goals
- Experience level
- Available equipment
- Time constraints
- Any injuries or limitations

Your plans follow exercise science principles:
- Progressive overload
- Balanced muscle group training
- Adequate recovery time
- Appropriate volume and intensity`,

  /**
   * Chatbot system prompt
   */
  CHATBOT: `You are GymMind AI, a friendly and knowledgeable gym assistant.
You help users with:
- Exercise technique and form
- Workout modifications
- Nutrition guidance
- Motivation and accountability
- Answering fitness questions

Important constraints:
- Stay within fitness and nutrition topics
- Never diagnose medical conditions
- Recommend professional consultation for injuries
- Keep responses concise and actionable`,

  /**
   * Nutrition parsing system prompt
   */
  NUTRITION_PARSER: `You are a nutrition analysis AI.
Your job is to parse food descriptions and estimate nutritional content.

When analyzing food:
- Identify individual food items
- Estimate portion sizes if not specified
- Calculate calories and macros (protein, carbs, fat, fiber)
- Use standard nutritional databases as reference
- When uncertain, provide reasonable estimates

Output must be valid JSON matching the specified schema.`,

  /**
   * Routine analyzer system prompt
   */
  ROUTINE_ANALYZER: `You are an expert fitness program analyst.
You evaluate workout routines for:
- Volume balance across muscle groups
- Recovery adequacy
- Progressive overload potential
- Goal alignment
- Common programming mistakes

Provide constructive feedback with specific, actionable improvements.`,
};

// ==========================================
// Prompt Builders
// ==========================================

/**
 * Build user context for prompts
 */
export function buildUserContext(profile: Partial<UserProfile>): string {
  const parts: string[] = [];

  if (profile.gender) parts.push(`Gender: ${profile.gender}`);
  if (profile.height) parts.push(`Height: ${profile.height}cm`);
  if (profile.weight) parts.push(`Weight: ${profile.weight}kg`);
  if (profile.fitnessGoal) parts.push(`Goal: ${formatGoal(profile.fitnessGoal)}`);
  if (profile.experienceLevel) parts.push(`Experience: ${profile.experienceLevel}`);
  if (profile.trainingLocation) parts.push(`Training location: ${profile.trainingLocation}`);
  if (profile.availableDays?.length) {
    parts.push(`Available days: ${profile.availableDays.join(', ')}`);
  }
  if (profile.injuries?.length) {
    parts.push(`Injuries/limitations: ${profile.injuries.join(', ')}`);
  }
  if (profile.bmr) parts.push(`BMR: ${profile.bmr} calories`);
  if (profile.tdee) parts.push(`TDEE: ${profile.tdee} calories`);

  return parts.length > 0 ? `User Profile:\n${parts.join('\n')}` : '';
}

/**
 * Format fitness goal for display
 */
function formatGoal(goal: FitnessGoal): string {
  const goalMap: Record<FitnessGoal, string> = {
    'lose-weight': 'Lose weight',
    'build-muscle': 'Build muscle',
    'gain-strength': 'Gain strength',
    'improve-endurance': 'Improve endurance',
    'maintain-fitness': 'Maintain fitness',
    'general-health': 'General health',
  };
  return goalMap[goal] || goal;
}

// ==========================================
// Workout Plan Prompts
// ==========================================

export function buildWorkoutPlanPrompt(profile: Partial<UserProfile>): string {
  const userContext = buildUserContext(profile);
  const daysCount = profile.availableDays?.length || 3;

  return `${userContext}

Generate a ${daysCount}-day weekly workout plan for this user.

Requirements:
1. Match the user's fitness goal and experience level
2. Distribute exercises appropriately across available days
3. Include proper warm-up and cool-down suggestions
4. Provide sets, reps, and rest periods for each exercise
5. Consider any injuries or limitations mentioned
6. Balance push/pull/legs or upper/lower appropriately

Output Format:
Return a valid JSON object with this structure:
{
  "weeklyPlan": [
    {
      "day": "monday",
      "name": "Push Day",
      "focus": ["chest", "shoulders", "triceps"],
      "exercises": [
        {
          "name": "Bench Press",
          "muscleGroup": "chest",
          "equipment": "barbell",
          "sets": 4,
          "reps": "8-10",
          "restSeconds": 90,
          "instructions": "..."
        }
      ],
      "estimatedDuration": 60
    }
  ],
  "explanation": "Brief explanation of why this plan suits the user..."
}`;
}

// ==========================================
// Chatbot Prompts
// ==========================================

export function buildChatbotPrompt(
  userMessage: string,
  profile: Partial<UserProfile>,
  recentHistory: { role: 'user' | 'assistant'; content: string }[] = []
): string {
  const userContext = buildUserContext(profile);
  const historyText = recentHistory
    .slice(-5) // Last 5 messages for context
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  return `${userContext}

${historyText ? `Recent conversation:\n${historyText}\n\n` : ''}User: ${userMessage}

Respond helpfully and concisely. Stay focused on fitness and nutrition topics.`;
}

// ==========================================
// Nutrition Prompts
// ==========================================

export function buildNutritionParsePrompt(mealDescription: string): string {
  return `Parse this meal description and estimate nutritional content:

"${mealDescription}"

Return a JSON object with this structure:
{
  "foods": [
    {
      "name": "food item name",
      "quantity": "estimated quantity (e.g., '1 cup', '200g')",
      "calories": 250,
      "macros": {
        "protein": 20,
        "carbs": 30,
        "fat": 10,
        "fiber": 5
      }
    }
  ],
  "totalCalories": 500,
  "totalMacros": {
    "protein": 40,
    "carbs": 60,
    "fat": 20,
    "fiber": 10
  },
  "confidence": "high|medium|low",
  "notes": "Any relevant notes about estimation..."
}

Be reasonable with portion estimates. Use standard nutritional data.`;
}

// ==========================================
// Routine Analyzer Prompts
// ==========================================

export function buildRoutineAnalysisPrompt(
  exercises: { name: string; setsPerWeek: number; muscleGroup: string }[],
  goal: FitnessGoal
): string {
  const exerciseList = exercises
    .map((e) => `- ${e.name}: ${e.setsPerWeek} sets/week (${e.muscleGroup})`)
    .join('\n');

  return `Analyze this workout routine for someone with the goal of "${formatGoal(goal)}":

Current Routine:
${exerciseList}

Evaluate:
1. Total weekly volume per muscle group
2. Muscle group balance (push/pull ratio, etc.)
3. Potential overtraining or undertraining
4. Alignment with stated goal
5. Common issues or improvements

Return JSON:
{
  "volumeAnalysis": {
    "chest": { "sets": 12, "status": "optimal" },
    ...
  },
  "issues": [
    {
      "type": "imbalance",
      "description": "...",
      "severity": "moderate",
      "suggestion": "..."
    }
  ],
  "overallScore": 75,
  "summary": "Brief overall assessment...",
  "suggestedChanges": [
    "Add 2-3 sets of rear delt work",
    ...
  ]
}`;
}

// ==========================================
// Exercise Explanation Prompts
// ==========================================

export function buildExerciseExplanationPrompt(
  exerciseName: string,
  userExperience: ExperienceLevel
): string {
  return `Explain the exercise "${exerciseName}" for a ${userExperience} level user.

Include:
1. Primary muscles worked
2. Step-by-step form instructions
3. Common mistakes to avoid
4. Breathing pattern
5. ${userExperience === 'beginner' ? 'Easier alternatives' : userExperience === 'advanced' ? 'Advanced variations' : 'Tips for progression'}

Keep explanation concise but thorough. Focus on safety and proper form.`;
}
