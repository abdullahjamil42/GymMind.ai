import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { connectToDatabase } from '@/lib/db/connection';
import { User } from '@/lib/db/schemas';
import { explainExercise } from '@/lib/ai/workout-generator';
import { ExperienceLevel } from '@/types';

/**
 * POST /api/workout-plan/explain
 * Get AI explanation for a specific exercise
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { exerciseName } = body;

    if (!exerciseName) {
      return NextResponse.json(
        { error: 'Exercise name is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get user profile
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build user profile for context with proper type casting
    const userProfile = {
      experienceLevel: user.experienceLevel as ExperienceLevel | undefined,
      injuries: user.injuries,
    };

    // Get AI explanation
    const explanation = await explainExercise(exerciseName, userProfile);

    return NextResponse.json({
      success: true,
      exerciseName,
      explanation,
    });
  } catch (error) {
    console.error('Error explaining exercise:', error);
    return NextResponse.json(
      { error: 'Failed to explain exercise' },
      { status: 500 }
    );
  }
}
