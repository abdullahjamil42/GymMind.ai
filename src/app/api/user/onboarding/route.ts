import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import connectDB from '@/lib/db/connection';
import { User } from '@/lib/db/schemas';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      height,
      weight,
      fitnessGoal,
      experienceLevel,
      trainingLocation,
      availableDays,
      injuries,
      medicalConditions,
    } = body;

    await connectDB();

    // Calculate BMR and TDEE
    const age = dateOfBirth ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear() : 30;
    let bmr = 0;
    
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 78; // Average
    }

    // Activity multiplier based on available days
    const activityMultiplier = availableDays?.length >= 5 ? 1.55 : availableDays?.length >= 3 ? 1.375 : 1.2;
    const tdee = Math.round(bmr * activityMultiplier);

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        height,
        weight,
        fitnessGoal,
        experienceLevel,
        trainingLocation,
        availableDays,
        injuries,
        medicalConditions,
        bmr: Math.round(bmr),
        tdee,
        isOnboardingComplete: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        isOnboardingComplete: updatedUser.isOnboardingComplete,
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
