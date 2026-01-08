/**
 * GymMind.ai - AI Workout Plan Generator
 * =======================================
 * Service for generating personalized workout plans using LLM.
 */

import { generateLLMResponse, LLMMessage } from './llm-client';
import { SYSTEM_PROMPTS, buildWorkoutPlanPrompt } from './prompts';
import { UserProfile, WorkoutDay, DayOfWeek } from '@/types';

// ==========================================
// Types
// ==========================================

export interface GeneratedWorkoutPlan {
  weeklyPlan: GeneratedWorkoutDay[];
  explanation: string;
}

export interface GeneratedWorkoutDay {
  day: DayOfWeek;
  name: string;
  focus: string[];
  exercises: GeneratedExercise[];
  estimatedDuration: number;
}

export interface GeneratedExercise {
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instructions: string;
}

// ==========================================
// Workout Plan Generator
// ==========================================

/**
 * Generate a personalized workout plan using AI
 */
export async function generateWorkoutPlan(
  userProfile: Partial<UserProfile>
): Promise<GeneratedWorkoutPlan> {
  const systemPrompt = SYSTEM_PROMPTS.WORKOUT_PLANNER;
  const userPrompt = buildWorkoutPlanPrompt(userProfile);

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const response = await generateLLMResponse(messages, {
      maxTokens: 4096,
      temperature: 0.7,
    });

    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse workout plan JSON from AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as GeneratedWorkoutPlan;
    
    // Validate the response structure
    if (!parsed.weeklyPlan || !Array.isArray(parsed.weeklyPlan)) {
      throw new Error('Invalid workout plan structure');
    }

    // Ensure all days have required fields
    parsed.weeklyPlan = parsed.weeklyPlan.map((day) => ({
      day: day.day,
      name: day.name || 'Workout',
      focus: day.focus || [],
      exercises: (day.exercises || []).map((ex, idx) => ({
        name: ex.name || `Exercise ${idx + 1}`,
        muscleGroup: ex.muscleGroup || 'general',
        equipment: ex.equipment || 'bodyweight',
        sets: ex.sets || 3,
        reps: ex.reps || '10-12',
        restSeconds: ex.restSeconds || 60,
        instructions: ex.instructions || '',
      })),
      estimatedDuration: day.estimatedDuration || 45,
    }));

    return parsed;
  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw new Error('Failed to generate workout plan. Please try again.');
  }
}

/**
 * Generate explanation for a specific exercise
 */
export async function explainExercise(
  exerciseName: string,
  userProfile: Partial<UserProfile>
): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS.GYM_COACH;
  const userPrompt = `Explain the exercise "${exerciseName}" for someone who is ${userProfile.experienceLevel || 'beginner'} level.

Include:
1. What muscles it targets
2. Step-by-step form instructions
3. Common mistakes to avoid
4. Breathing technique
5. Modifications for different fitness levels

Keep the explanation clear and actionable.`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const response = await generateLLMResponse(messages, {
      maxTokens: 1024,
      temperature: 0.5,
    });

    return response.content;
  } catch (error) {
    console.error('Error explaining exercise:', error);
    throw new Error('Failed to explain exercise. Please try again.');
  }
}

/**
 * Get alternative exercises for a specific exercise
 */
export async function getAlternativeExercises(
  exerciseName: string,
  muscleGroup: string,
  equipment: string,
  userProfile: Partial<UserProfile>
): Promise<GeneratedExercise[]> {
  const systemPrompt = SYSTEM_PROMPTS.WORKOUT_PLANNER;
  const location = userProfile.trainingLocation || 'gym';
  
  const userPrompt = `Suggest 3 alternative exercises for "${exerciseName}" that target the ${muscleGroup}.

The user trains at: ${location}
Experience level: ${userProfile.experienceLevel || 'beginner'}
${userProfile.injuries?.length ? `Injuries to consider: ${userProfile.injuries.join(', ')}` : ''}

Provide alternatives with different equipment requirements if possible.

Output as JSON array:
[
  {
    "name": "Exercise Name",
    "muscleGroup": "${muscleGroup}",
    "equipment": "equipment type",
    "sets": 3,
    "reps": "10-12",
    "restSeconds": 60,
    "instructions": "Brief instructions"
  }
]`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const response = await generateLLMResponse(messages, {
      maxTokens: 1024,
      temperature: 0.7,
    });

    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse alternatives JSON');
    }

    return JSON.parse(jsonMatch[0]) as GeneratedExercise[];
  } catch (error) {
    console.error('Error getting alternative exercises:', error);
    throw new Error('Failed to get alternative exercises.');
  }
}
