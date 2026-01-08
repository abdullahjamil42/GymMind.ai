import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { connectToDatabase } from '@/lib/db/connection';
import { User, WorkoutPlanModel } from '@/lib/db/schemas';
import { generateWorkoutPlan } from '@/lib/ai/workout-generator';
import { UserProfile, FitnessGoal, ExperienceLevel, TrainingLocation, DayOfWeek, Gender } from '@/types';

/**
 * POST /api/workout-plan/generate
 * Generate a new AI workout plan for the authenticated user
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

    // Check if onboarding is complete
    if (!user.isOnboardingComplete) {
      return NextResponse.json(
        { error: 'Please complete onboarding first' },
        { status: 400 }
      );
    }

    // Build user profile for AI with proper type casting
    const userProfile: Partial<UserProfile> = {
      gender: user.gender as Gender | undefined,
      height: user.height,
      weight: user.weight,
      fitnessGoal: user.fitnessGoal as FitnessGoal | undefined,
      experienceLevel: user.experienceLevel as ExperienceLevel | undefined,
      trainingLocation: user.trainingLocation as TrainingLocation | undefined,
      availableDays: user.availableDays as DayOfWeek[] | undefined,
      injuries: user.injuries,
      bmr: user.bmr,
      tdee: user.tdee,
    };

    // Generate workout plan using AI
    const generatedPlan = await generateWorkoutPlan(userProfile);

    // Save workout plan to database
    const workoutPlan = new WorkoutPlanModel({
      userId: user._id,
      goal: user.fitnessGoal,
      weeklyPlan: generatedPlan.weeklyPlan,
      aiExplanation: generatedPlan.explanation,
      isActive: true,
      startDate: new Date(),
    });

    await workoutPlan.save();

    // Deactivate previous plans
    await WorkoutPlanModel.updateMany(
      { userId: user._id, _id: { $ne: workoutPlan._id } },
      { isActive: false }
    );

    return NextResponse.json({
      success: true,
      workoutPlan: {
        id: workoutPlan._id.toString(),
        weeklyPlan: generatedPlan.weeklyPlan,
        explanation: generatedPlan.explanation,
        createdAt: workoutPlan.createdAt,
      },
    });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate workout plan' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workout-plan/generate
 * Get the current active workout plan
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get active workout plan
    const workoutPlan = await WorkoutPlanModel.findOne({
      userId: user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    if (!workoutPlan) {
      return NextResponse.json({
        success: true,
        workoutPlan: null,
      });
    }

    return NextResponse.json({
      success: true,
      workoutPlan: {
        id: workoutPlan._id.toString(),
        weeklyPlan: workoutPlan.weeklyPlan,
        explanation: workoutPlan.aiExplanation,
        createdAt: workoutPlan.createdAt,
        goal: workoutPlan.goal,
      },
    });
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout plan' },
      { status: 500 }
    );
  }
}
