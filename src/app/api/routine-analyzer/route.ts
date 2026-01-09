/**
 * GymMind.ai - Routine Analyzer API
 * ==================================
 * Analyzes user workout routines using AI and provides optimization suggestions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { connectToDatabase } from '@/lib/db/connection';
import { generateLLMResponse, LLMMessage } from '@/lib/ai/llm-client';

// ==========================================
// Types
// ==========================================

interface ExerciseInput {
  name: string;
  sets: number;
  reps: string;
  muscleGroup?: string;
}

interface DayRoutine {
  day: string;
  exercises: ExerciseInput[];
}

interface AnalysisResult {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  muscleGroupBalance: {
    group: string;
    weeklyVolume: number;
    status: 'optimal' | 'low' | 'high';
    recommendation: string;
  }[];
  optimizedRoutine?: DayRoutine[];
  tips: string[];
}

// ==========================================
// Muscle Group Categories
// ==========================================

const MUSCLE_GROUPS = {
  chest: ['bench press', 'push-up', 'chest fly', 'dumbbell press', 'incline press', 'decline press', 'cable crossover', 'pec deck'],
  back: ['pull-up', 'lat pulldown', 'row', 'deadlift', 'chin-up', 'face pull', 't-bar row', 'seated row'],
  shoulders: ['overhead press', 'shoulder press', 'lateral raise', 'front raise', 'rear delt', 'arnold press', 'upright row', 'shrug'],
  biceps: ['bicep curl', 'hammer curl', 'preacher curl', 'concentration curl', 'cable curl', 'barbell curl'],
  triceps: ['tricep extension', 'skull crusher', 'tricep pushdown', 'dip', 'close grip bench', 'overhead extension'],
  legs: ['squat', 'leg press', 'lunge', 'leg extension', 'leg curl', 'calf raise', 'hip thrust', 'glute bridge', 'romanian deadlift'],
  core: ['plank', 'crunch', 'sit-up', 'leg raise', 'russian twist', 'ab wheel', 'cable crunch', 'woodchop'],
};

// Optimal weekly sets per muscle group (research-based)
const OPTIMAL_WEEKLY_SETS: Record<string, { min: number; max: number }> = {
  chest: { min: 10, max: 20 },
  back: { min: 10, max: 20 },
  shoulders: { min: 8, max: 16 },
  biceps: { min: 6, max: 14 },
  triceps: { min: 6, max: 14 },
  legs: { min: 12, max: 22 },
  core: { min: 6, max: 12 },
};

// ==========================================
// Helper Functions
// ==========================================

function detectMuscleGroup(exerciseName: string): string {
  const lowerName = exerciseName.toLowerCase();
  
  for (const [group, exercises] of Object.entries(MUSCLE_GROUPS)) {
    if (exercises.some(ex => lowerName.includes(ex) || ex.includes(lowerName))) {
      return group;
    }
  }
  
  // Fallback detection based on keywords
  if (lowerName.includes('chest') || lowerName.includes('pec')) return 'chest';
  if (lowerName.includes('back') || lowerName.includes('lat') || lowerName.includes('row')) return 'back';
  if (lowerName.includes('shoulder') || lowerName.includes('delt')) return 'shoulders';
  if (lowerName.includes('bicep') || lowerName.includes('curl')) return 'biceps';
  if (lowerName.includes('tricep')) return 'triceps';
  if (lowerName.includes('leg') || lowerName.includes('squat') || lowerName.includes('glute') || lowerName.includes('quad') || lowerName.includes('ham')) return 'legs';
  if (lowerName.includes('ab') || lowerName.includes('core') || lowerName.includes('plank')) return 'core';
  
  return 'other';
}

function calculateWeeklyVolume(routine: DayRoutine[]): Record<string, number> {
  const volume: Record<string, number> = {
    chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0, legs: 0, core: 0, other: 0
  };
  
  routine.forEach(day => {
    day.exercises.forEach(exercise => {
      const group = exercise.muscleGroup || detectMuscleGroup(exercise.name);
      volume[group] = (volume[group] || 0) + exercise.sets;
    });
  });
  
  return volume;
}

function analyzeBalance(volume: Record<string, number>): AnalysisResult['muscleGroupBalance'] {
  const balance: AnalysisResult['muscleGroupBalance'] = [];
  
  for (const [group, optimal] of Object.entries(OPTIMAL_WEEKLY_SETS)) {
    const weeklyVolume = volume[group] || 0;
    let status: 'optimal' | 'low' | 'high' = 'optimal';
    let recommendation = 'Volume is in the optimal range for muscle growth.';
    
    if (weeklyVolume < optimal.min) {
      status = 'low';
      recommendation = `Add ${optimal.min - weeklyVolume} more sets per week for better results.`;
    } else if (weeklyVolume > optimal.max) {
      status = 'high';
      recommendation = `Consider reducing by ${weeklyVolume - optimal.max} sets to prevent overtraining.`;
    }
    
    balance.push({
      group: group.charAt(0).toUpperCase() + group.slice(1),
      weeklyVolume,
      status,
      recommendation,
    });
  }
  
  return balance;
}

function calculateOverallScore(balance: AnalysisResult['muscleGroupBalance']): number {
  const optimalCount = balance.filter(b => b.status === 'optimal').length;
  const totalGroups = balance.length;
  
  // Base score from balance
  let score = (optimalCount / totalGroups) * 80;
  
  // Bonus for having low groups (trying something)
  const lowCount = balance.filter(b => b.status === 'low').length;
  score += (totalGroups - lowCount) / totalGroups * 20;
  
  return Math.round(score);
}

// ==========================================
// AI Analysis Prompt
// ==========================================

function buildAnalysisPrompt(routine: DayRoutine[], volume: Record<string, number>): string {
  const routineText = routine.map(day => 
    `${day.day}: ${day.exercises.map(e => `${e.name} (${e.sets}x${e.reps})`).join(', ')}`
  ).join('\n');

  return `You are an expert personal trainer analyzing a client's workout routine.

WEEKLY ROUTINE:
${routineText}

WEEKLY VOLUME BY MUSCLE GROUP:
${Object.entries(volume).filter(([_, v]) => v > 0).map(([g, v]) => `${g}: ${v} sets`).join('\n')}

Analyze this routine and provide feedback in this exact JSON format:
{
  "summary": "A 2-3 sentence overall assessment",
  "strengths": ["3-4 specific strengths of this routine"],
  "weaknesses": ["2-4 areas that need improvement"],
  "tips": ["4-5 actionable tips to improve the routine"]
}

Consider:
1. Muscle group balance and weekly volume
2. Exercise selection variety
3. Rest and recovery (are related muscle groups spread out?)
4. Progressive overload potential
5. Movement pattern diversity (push/pull/legs/core)

Return ONLY valid JSON, no markdown formatting.`;
}

// ==========================================
// POST - Analyze Routine
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { routine } = body;

    if (!routine || !Array.isArray(routine)) {
      return NextResponse.json(
        { error: 'Invalid routine format. Expected array of day routines.' },
        { status: 400 }
      );
    }

    // Calculate weekly volume
    const volume = calculateWeeklyVolume(routine);
    
    // Analyze muscle group balance
    const muscleGroupBalance = analyzeBalance(volume);
    
    // Calculate overall score
    const overallScore = calculateOverallScore(muscleGroupBalance);
    
    // Get AI analysis
    let aiAnalysis = null;
    try {
      const prompt = buildAnalysisPrompt(routine, volume);
      const response = await generateLLMResponse([
        { role: 'system', content: prompt }
      ], { maxTokens: 1024, temperature: 0.6 });

      let cleanResponse = response.content.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      aiAnalysis = JSON.parse(cleanResponse);
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
    }

    const result: AnalysisResult = {
      overallScore,
      summary: aiAnalysis?.summary || 'Your routine has been analyzed. See the detailed breakdown below.',
      strengths: aiAnalysis?.strengths || ['Consistent training schedule', 'Good exercise variety'],
      weaknesses: aiAnalysis?.weaknesses || ['Some muscle groups may need more attention'],
      muscleGroupBalance,
      tips: aiAnalysis?.tips || [
        'Ensure progressive overload by increasing weight or reps over time',
        'Include both compound and isolation exercises',
        'Allow 48-72 hours rest between training the same muscle group',
      ],
    };

    return NextResponse.json({
      success: true,
      analysis: result,
    });

  } catch (error: any) {
    console.error('Routine analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze routine' },
      { status: 500 }
    );
  }
}

// ==========================================
// GET - Get User's Current Routine for Analysis
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch user's workout plan
    const planResponse = await fetch(new URL('/api/workout-plan/generate', request.url).toString(), {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    const planData = await planResponse.json();

    if (planData.success && planData.workoutPlan?.weeklyPlan) {
      const routine: DayRoutine[] = planData.workoutPlan.weeklyPlan.map((day: any) => ({
        day: day.day,
        exercises: day.exercises.map((ex: any) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          muscleGroup: ex.muscleGroup,
        })),
      }));

      return NextResponse.json({
        success: true,
        routine,
        hasExistingPlan: true,
      });
    }

    return NextResponse.json({
      success: true,
      routine: [],
      hasExistingPlan: false,
    });

  } catch (error: any) {
    console.error('Error fetching routine:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch routine' },
      { status: 500 }
    );
  }
}
