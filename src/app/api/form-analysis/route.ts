import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { connectToDatabase } from '@/lib/db/connection';
import { generateLLMResponse, LLMMessage } from '@/lib/ai/llm-client';

// ==========================================
// Form Analysis Types
// ==========================================

interface JointAngle {
  name: string;
  angle: number;
  idealMin: number;
  idealMax: number;
  status: 'good' | 'warning' | 'error';
}

interface FormIssue {
  severity: 'low' | 'medium' | 'high';
  issue: string;
  suggestion: string;
  affectedJoint?: string;
}

interface FormAnalysisResult {
  exerciseType: string;
  overallScore: number;
  jointAngles: JointAngle[];
  issues: FormIssue[];
  feedback: string;
  tips: string[];
}

// ==========================================
// Ideal Angle Ranges for Exercises
// ==========================================

const EXERCISE_ANGLE_STANDARDS: Record<string, Record<string, { min: number; max: number; critical?: boolean }>> = {
  squat: {
    kneeFlexion: { min: 80, max: 100, critical: true },
    hipFlexion: { min: 75, max: 95 },
    ankleFlexion: { min: 25, max: 40 },
    torsoAngle: { min: 45, max: 75 },
    kneeAlignment: { min: -10, max: 10 }, // Knee tracking over toes
  },
  pushup: {
    elbowFlexion: { min: 85, max: 100, critical: true },
    shoulderAngle: { min: 40, max: 60 },
    hipAlignment: { min: 165, max: 180 }, // Body should be straight
    neckAlignment: { min: 150, max: 180 },
  },
  deadlift: {
    hipHinge: { min: 70, max: 90, critical: true },
    kneeFlexion: { min: 15, max: 35 },
    spineAngle: { min: 10, max: 30 },
    shoulderPosition: { min: -5, max: 10 },
  },
  lunge: {
    frontKneeFlexion: { min: 85, max: 100, critical: true },
    backKneeFlexion: { min: 80, max: 100 },
    torsoAngle: { min: 80, max: 100 },
    hipAlignment: { min: -10, max: 10 },
  },
  plank: {
    hipAlignment: { min: 165, max: 180, critical: true },
    shoulderPosition: { min: 80, max: 100 },
    neckAlignment: { min: 150, max: 180 },
  },
};

// ==========================================
// Form Analysis Prompts
// ==========================================

function buildFormAnalysisPrompt(
  exerciseType: string,
  keypoints: any[],
  jointAngles: JointAngle[]
): string {
  return `You are an expert personal trainer and biomechanics specialist analyzing exercise form.

EXERCISE: ${exerciseType.toUpperCase()}

DETECTED JOINT ANGLES:
${jointAngles.map(ja => `- ${ja.name}: ${ja.angle.toFixed(1)}° (ideal: ${ja.idealMin}°-${ja.idealMax}°) - ${ja.status.toUpperCase()}`).join('\n')}

KEYPOINTS DETECTED: ${keypoints.length} body landmarks

Based on this analysis, provide personalized feedback in this JSON format:
{
  "summary": "One sentence overall assessment",
  "mainIssues": ["List of 2-3 main form issues detected"],
  "corrections": ["Specific correction cues for each issue"],
  "tips": ["3-4 helpful tips to improve this exercise"],
  "safetyWarning": "Any safety concerns, or null if none"
}

Be specific, actionable, and encouraging. Focus on the most important corrections first.
Return ONLY valid JSON, no markdown formatting.`;
}

// ==========================================
// Angle Calculation Utilities
// ==========================================

function calculateAngle(
  pointA: { x: number; y: number },
  pointB: { x: number; y: number },
  pointC: { x: number; y: number }
): number {
  const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
                  Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

function getAngleStatus(
  angle: number,
  idealMin: number,
  idealMax: number
): 'good' | 'warning' | 'error' {
  if (angle >= idealMin && angle <= idealMax) return 'good';
  const tolerance = (idealMax - idealMin) * 0.2; // 20% tolerance for warning
  if (angle >= idealMin - tolerance && angle <= idealMax + tolerance) return 'warning';
  return 'error';
}

// ==========================================
// MediaPipe Keypoint Index Reference
// ==========================================
const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

// ==========================================
// Analyze Keypoints for Specific Exercises
// ==========================================

function analyzeSquat(keypoints: any[]): JointAngle[] {
  const angles: JointAngle[] = [];
  const standards = EXERCISE_ANGLE_STANDARDS.squat;

  // Left knee flexion (hip-knee-ankle)
  if (keypoints[POSE_LANDMARKS.LEFT_HIP] && keypoints[POSE_LANDMARKS.LEFT_KNEE] && keypoints[POSE_LANDMARKS.LEFT_ANKLE]) {
    const angle = calculateAngle(
      keypoints[POSE_LANDMARKS.LEFT_HIP],
      keypoints[POSE_LANDMARKS.LEFT_KNEE],
      keypoints[POSE_LANDMARKS.LEFT_ANKLE]
    );
    angles.push({
      name: 'Left Knee Flexion',
      angle,
      idealMin: standards.kneeFlexion.min,
      idealMax: standards.kneeFlexion.max,
      status: getAngleStatus(angle, standards.kneeFlexion.min, standards.kneeFlexion.max),
    });
  }

  // Right knee flexion
  if (keypoints[POSE_LANDMARKS.RIGHT_HIP] && keypoints[POSE_LANDMARKS.RIGHT_KNEE] && keypoints[POSE_LANDMARKS.RIGHT_ANKLE]) {
    const angle = calculateAngle(
      keypoints[POSE_LANDMARKS.RIGHT_HIP],
      keypoints[POSE_LANDMARKS.RIGHT_KNEE],
      keypoints[POSE_LANDMARKS.RIGHT_ANKLE]
    );
    angles.push({
      name: 'Right Knee Flexion',
      angle,
      idealMin: standards.kneeFlexion.min,
      idealMax: standards.kneeFlexion.max,
      status: getAngleStatus(angle, standards.kneeFlexion.min, standards.kneeFlexion.max),
    });
  }

  // Hip flexion (shoulder-hip-knee)
  if (keypoints[POSE_LANDMARKS.LEFT_SHOULDER] && keypoints[POSE_LANDMARKS.LEFT_HIP] && keypoints[POSE_LANDMARKS.LEFT_KNEE]) {
    const angle = calculateAngle(
      keypoints[POSE_LANDMARKS.LEFT_SHOULDER],
      keypoints[POSE_LANDMARKS.LEFT_HIP],
      keypoints[POSE_LANDMARKS.LEFT_KNEE]
    );
    angles.push({
      name: 'Hip Flexion',
      angle,
      idealMin: standards.hipFlexion.min,
      idealMax: standards.hipFlexion.max,
      status: getAngleStatus(angle, standards.hipFlexion.min, standards.hipFlexion.max),
    });
  }

  return angles;
}

function analyzePushup(keypoints: any[]): JointAngle[] {
  const angles: JointAngle[] = [];
  const standards = EXERCISE_ANGLE_STANDARDS.pushup;

  // Elbow flexion (shoulder-elbow-wrist)
  if (keypoints[POSE_LANDMARKS.LEFT_SHOULDER] && keypoints[POSE_LANDMARKS.LEFT_ELBOW] && keypoints[POSE_LANDMARKS.LEFT_WRIST]) {
    const angle = calculateAngle(
      keypoints[POSE_LANDMARKS.LEFT_SHOULDER],
      keypoints[POSE_LANDMARKS.LEFT_ELBOW],
      keypoints[POSE_LANDMARKS.LEFT_WRIST]
    );
    angles.push({
      name: 'Left Elbow Flexion',
      angle,
      idealMin: standards.elbowFlexion.min,
      idealMax: standards.elbowFlexion.max,
      status: getAngleStatus(angle, standards.elbowFlexion.min, standards.elbowFlexion.max),
    });
  }

  // Body alignment (shoulder-hip-ankle)
  if (keypoints[POSE_LANDMARKS.LEFT_SHOULDER] && keypoints[POSE_LANDMARKS.LEFT_HIP] && keypoints[POSE_LANDMARKS.LEFT_ANKLE]) {
    const angle = calculateAngle(
      keypoints[POSE_LANDMARKS.LEFT_SHOULDER],
      keypoints[POSE_LANDMARKS.LEFT_HIP],
      keypoints[POSE_LANDMARKS.LEFT_ANKLE]
    );
    angles.push({
      name: 'Body Alignment',
      angle,
      idealMin: standards.hipAlignment.min,
      idealMax: standards.hipAlignment.max,
      status: getAngleStatus(angle, standards.hipAlignment.min, standards.hipAlignment.max),
    });
  }

  return angles;
}

function analyzePlank(keypoints: any[]): JointAngle[] {
  const angles: JointAngle[] = [];
  const standards = EXERCISE_ANGLE_STANDARDS.plank;

  // Body alignment (shoulder-hip-ankle)
  if (keypoints[POSE_LANDMARKS.LEFT_SHOULDER] && keypoints[POSE_LANDMARKS.LEFT_HIP] && keypoints[POSE_LANDMARKS.LEFT_ANKLE]) {
    const angle = calculateAngle(
      keypoints[POSE_LANDMARKS.LEFT_SHOULDER],
      keypoints[POSE_LANDMARKS.LEFT_HIP],
      keypoints[POSE_LANDMARKS.LEFT_ANKLE]
    );
    angles.push({
      name: 'Hip Alignment',
      angle,
      idealMin: standards.hipAlignment.min,
      idealMax: standards.hipAlignment.max,
      status: getAngleStatus(angle, standards.hipAlignment.min, standards.hipAlignment.max),
    });
  }

  return angles;
}

// ==========================================
// Calculate Overall Score
// ==========================================

function calculateOverallScore(jointAngles: JointAngle[]): number {
  if (jointAngles.length === 0) return 0;

  const scores = jointAngles.map(ja => {
    switch (ja.status) {
      case 'good': return 100;
      case 'warning': return 70;
      case 'error': return 40;
      default: return 50;
    }
  });

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// ==========================================
// Generate Form Issues
// ==========================================

function generateFormIssues(jointAngles: JointAngle[], exerciseType: string): FormIssue[] {
  const issues: FormIssue[] = [];

  jointAngles.forEach(ja => {
    if (ja.status === 'error') {
      issues.push({
        severity: 'high',
        issue: `${ja.name} is significantly outside the ideal range`,
        suggestion: `Adjust your ${ja.name.toLowerCase()} to be between ${ja.idealMin}° and ${ja.idealMax}°`,
        affectedJoint: ja.name,
      });
    } else if (ja.status === 'warning') {
      issues.push({
        severity: 'medium',
        issue: `${ja.name} could be improved`,
        suggestion: `Try to bring your ${ja.name.toLowerCase()} closer to ${Math.round((ja.idealMin + ja.idealMax) / 2)}°`,
        affectedJoint: ja.name,
      });
    }
  });

  return issues;
}

// ==========================================
// POST - Analyze Form from Keypoints
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { exerciseType, keypoints, frameData } = body;

    if (!exerciseType || !keypoints || !Array.isArray(keypoints)) {
      return NextResponse.json(
        { error: 'Missing required fields: exerciseType and keypoints' },
        { status: 400 }
      );
    }

    // Validate exercise type
    const supportedExercises = ['squat', 'pushup', 'plank', 'deadlift', 'lunge'];
    const normalizedExercise = exerciseType.toLowerCase().replace(/[-_\s]/g, '');
    
    if (!supportedExercises.some(e => normalizedExercise.includes(e))) {
      return NextResponse.json(
        { error: `Exercise '${exerciseType}' is not supported. Supported: ${supportedExercises.join(', ')}` },
        { status: 400 }
      );
    }

    // Analyze based on exercise type
    let jointAngles: JointAngle[] = [];
    
    if (normalizedExercise.includes('squat')) {
      jointAngles = analyzeSquat(keypoints);
    } else if (normalizedExercise.includes('pushup') || normalizedExercise.includes('push')) {
      jointAngles = analyzePushup(keypoints);
    } else if (normalizedExercise.includes('plank')) {
      jointAngles = analyzePlank(keypoints);
    }

    // Calculate overall score
    const overallScore = calculateOverallScore(jointAngles);

    // Generate form issues
    const issues = generateFormIssues(jointAngles, exerciseType);

    // Get AI feedback for more detailed analysis
    let aiFeedback = null;
    try {
      const prompt = buildFormAnalysisPrompt(exerciseType, keypoints, jointAngles);
      const response = await generateLLMResponse([
        { role: 'system', content: prompt }
      ], { maxTokens: 512, temperature: 0.5 });

      let cleanResponse = response.content.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      aiFeedback = JSON.parse(cleanResponse);
    } catch (aiError) {
      console.error('AI feedback generation failed:', aiError);
    }

    // Build response
    const result: FormAnalysisResult = {
      exerciseType,
      overallScore,
      jointAngles,
      issues,
      feedback: aiFeedback?.summary || getDefaultFeedback(overallScore),
      tips: aiFeedback?.tips || getDefaultTips(exerciseType),
    };

    return NextResponse.json({
      success: true,
      analysis: result,
      aiInsights: aiFeedback,
    });

  } catch (error: any) {
    console.error('Form analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze form' },
      { status: 500 }
    );
  }
}

// ==========================================
// GET - Get Supported Exercises
// ==========================================

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    supportedExercises: [
      { id: 'squat', name: 'Squat', description: 'Analyzes knee flexion, hip hinge, and torso angle' },
      { id: 'pushup', name: 'Push-up', description: 'Analyzes elbow flexion and body alignment' },
      { id: 'plank', name: 'Plank', description: 'Analyzes hip alignment and body straightness' },
    ],
    comingSoon: ['deadlift', 'lunge', 'overhead-press'],
  });
}

// ==========================================
// Default Feedback Helpers
// ==========================================

function getDefaultFeedback(score: number): string {
  if (score >= 90) return 'Excellent form! Keep up the great work.';
  if (score >= 75) return 'Good form with minor areas to improve.';
  if (score >= 60) return 'Decent form, but focus on the key corrections.';
  return 'Form needs significant improvement. Review the corrections carefully.';
}

function getDefaultTips(exerciseType: string): string[] {
  const tips: Record<string, string[]> = {
    squat: [
      'Keep your chest up and back straight',
      'Push your knees out over your toes',
      'Go as low as your mobility allows',
      'Drive through your heels when standing',
    ],
    pushup: [
      'Keep your body in a straight line',
      'Lower until your chest nearly touches the ground',
      'Keep your elbows at 45-degree angle',
      'Engage your core throughout',
    ],
    plank: [
      'Keep your hips level with your shoulders',
      'Engage your core and glutes',
      'Look at the floor to maintain neck alignment',
      'Breathe steadily throughout',
    ],
  };

  return tips[exerciseType] || ['Focus on controlled movements', 'Maintain proper breathing'];
}
