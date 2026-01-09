/**
 * GymMind.ai - User Profile API
 * =============================
 * Manages user profile information including fitness details.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { connectToDatabase } from '@/lib/db/connection';
import mongoose from 'mongoose';

// ==========================================
// User Profile Schema
// ==========================================

const UserProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  fitnessGoal: { 
    type: String,
    enum: ['lose_weight', 'build_muscle', 'get_stronger', 'improve_endurance', 'stay_healthy', 'compete']
  },
  experienceLevel: { 
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  location: { type: String },
  bio: { type: String, maxlength: 500 },
}, { timestamps: true });

const UserProfile = mongoose.models.UserProfile || 
  mongoose.model('UserProfile', UserProfileSchema);

// ==========================================
// GET - Fetch User Profile
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    let profile = await UserProfile.findOne({ userId: session.user.id }).lean();
    
    // If no profile exists, create one with basic info
    if (!profile) {
      const newProfile = await UserProfile.create({
        userId: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
      });
      // Convert to plain object for consistent typing
      profile = newProfile.toObject();
    }

    // TypeScript assertion - we know profile exists at this point
    const userProfile = profile as any;

    return NextResponse.json({
      success: true,
      profile: {
        name: userProfile.name,
        email: userProfile.email,
        age: userProfile.age,
        height: userProfile.height,
        weight: userProfile.weight,
        fitnessGoal: userProfile.fitnessGoal,
        experienceLevel: userProfile.experienceLevel,
        location: userProfile.location,
        bio: userProfile.bio,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// ==========================================
// PUT - Update User Profile
// ==========================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      age,
      height,
      weight,
      fitnessGoal,
      experienceLevel,
      location,
      bio
    } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (age && (age < 13 || age > 120)) {
      return NextResponse.json(
        { error: 'Age must be between 13 and 120' },
        { status: 400 }
      );
    }

    if (height && (height < 100 || height > 300)) {
      return NextResponse.json(
        { error: 'Height must be between 100 and 300 cm' },
        { status: 400 }
      );
    }

    if (weight && (weight < 30 || weight > 300)) {
      return NextResponse.json(
        { error: 'Weight must be between 30 and 300 kg' },
        { status: 400 }
      );
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio must be less than 500 characters' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updateData: any = {
      name: name.trim(),
      age: age || undefined,
      height: height || undefined,
      weight: weight || undefined,
      fitnessGoal: fitnessGoal || undefined,
      experienceLevel: experienceLevel || undefined,
      location: location?.trim() || undefined,
      bio: bio?.trim() || undefined,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const profile = await UserProfile.findOneAndUpdate(
      { userId: session.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        name: profile.name,
        email: profile.email,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        fitnessGoal: profile.fitnessGoal,
        experienceLevel: profile.experienceLevel,
        location: profile.location,
        bio: profile.bio,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}