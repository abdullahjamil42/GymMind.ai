/**
 * GymMind.ai - Progress Tracking API
 * ===================================
 * Tracks user progress including workouts, weight, and achievements.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { connectToDatabase } from '@/lib/db/connection';
import mongoose from 'mongoose';

// ==========================================
// Progress Entry Schema
// ==========================================

const ProgressEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['workout', 'weight', 'measurement', 'achievement'],
    required: true 
  },
  data: {
    // For workout type
    workoutName: String,
    duration: Number, // in minutes
    exercises: Number,
    setsCompleted: Number,
    caloriesBurned: Number,
    
    // For weight type
    weight: Number,
    unit: { type: String, default: 'lbs' },
    
    // For measurement type
    measurements: {
      chest: Number,
      waist: Number,
      hips: Number,
      arms: Number,
      thighs: Number,
    },
    
    // For achievement type
    achievementType: String,
    achievementName: String,
    description: String,
  },
}, { timestamps: true });

const ProgressEntry = mongoose.models.ProgressEntry || 
  mongoose.model('ProgressEntry', ProgressEntrySchema);

// ==========================================
// GET - Fetch Progress Data
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'workout' | 'weight' | 'all'
    const range = searchParams.get('range') || '30'; // days
    const daysAgo = parseInt(range);

    await connectToDatabase();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const query: any = {
      userId: session.user.id,
      date: { $gte: startDate },
    };

    if (type && type !== 'all') {
      query.type = type;
    }

    const entries = await ProgressEntry.find(query)
      .sort({ date: -1 })
      .lean();

    // Calculate stats
    const workoutEntries = entries.filter((e: any) => e.type === 'workout');
    const weightEntries = entries.filter((e: any) => e.type === 'weight');

    const stats = {
      totalWorkouts: workoutEntries.length,
      totalDuration: workoutEntries.reduce((acc: number, e: any) => acc + (e.data?.duration || 0), 0),
      totalCalories: workoutEntries.reduce((acc: number, e: any) => acc + (e.data?.caloriesBurned || 0), 0),
      currentStreak: calculateStreak(workoutEntries),
      weightChange: calculateWeightChange(weightEntries),
      currentWeight: weightEntries[0]?.data?.weight || null,
    };

    // Get weekly summary
    const weeklySummary = getWeeklySummary(workoutEntries);

    return NextResponse.json({
      success: true,
      entries: entries.map((e: any) => ({
        id: e._id,
        type: e.type,
        date: e.date,
        data: e.data,
        createdAt: e.createdAt,
      })),
      stats,
      weeklySummary,
    });

  } catch (error: any) {
    console.error('Progress fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// ==========================================
// POST - Log Progress Entry
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, date, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const entry = await ProgressEntry.create({
      userId: session.user.id,
      date: date ? new Date(date) : new Date(),
      type,
      data,
    });

    // Check for achievements
    const achievements = await checkAchievements(session.user.id);

    return NextResponse.json({
      success: true,
      entry: {
        id: entry._id,
        type: entry.type,
        date: entry.date,
        data: entry.data,
      },
      newAchievements: achievements,
    });

  } catch (error: any) {
    console.error('Progress log error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log progress' },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE - Remove Progress Entry
// ==========================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    await connectToDatabase();

    await ProgressEntry.deleteOne({
      _id: id,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Progress delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete entry' },
      { status: 500 }
    );
  }
}

// ==========================================
// Helper Functions
// ==========================================

function calculateStreak(workoutEntries: any[]): number {
  if (workoutEntries.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get unique workout dates
  const workoutDates = new Set(
    workoutEntries.map((e: any) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let streak = 0;
  let currentDate = new Date(today);

  // Check if worked out today
  if (workoutDates.has(currentDate.getTime())) {
    streak = 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Count consecutive days
  while (workoutDates.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

function calculateWeightChange(weightEntries: any[]): number | null {
  if (weightEntries.length < 2) return null;

  const latest = weightEntries[0]?.data?.weight;
  const oldest = weightEntries[weightEntries.length - 1]?.data?.weight;

  if (!latest || !oldest) return null;

  return Math.round((latest - oldest) * 10) / 10;
}

function getWeeklySummary(workoutEntries: any[]): { week: string; count: number }[] {
  const weekMap = new Map<string, number>();
  
  workoutEntries.forEach((entry: any) => {
    const date = new Date(entry.date);
    const weekStart = getWeekStart(date);
    const key = weekStart.toISOString().split('T')[0];
    weekMap.set(key, (weekMap.get(key) || 0) + 1);
  });

  // Get last 8 weeks
  const result: { week: string; count: number }[] = [];
  const today = new Date();
  
  for (let i = 0; i < 8; i++) {
    const weekStart = getWeekStart(new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000));
    const key = weekStart.toISOString().split('T')[0];
    result.push({
      week: formatWeekLabel(weekStart),
      count: weekMap.get(key) || 0,
    });
  }

  return result.reverse();
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(date: Date): string {
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

async function checkAchievements(userId: string): Promise<any[]> {
  const achievements: any[] = [];

  // Count total workouts
  const totalWorkouts = await ProgressEntry.countDocuments({
    userId,
    type: 'workout',
  });

  const achievementMilestones = [
    { count: 1, name: 'First Step', description: 'Completed your first workout!' },
    { count: 10, name: 'Dedicated', description: 'Completed 10 workouts!' },
    { count: 25, name: 'Consistent', description: 'Completed 25 workouts!' },
    { count: 50, name: 'Committed', description: 'Completed 50 workouts!' },
    { count: 100, name: 'Century', description: 'Completed 100 workouts!' },
  ];

  for (const milestone of achievementMilestones) {
    if (totalWorkouts === milestone.count) {
      // Check if achievement already exists
      const exists = await ProgressEntry.findOne({
        userId,
        type: 'achievement',
        'data.achievementName': milestone.name,
      });

      if (!exists) {
        const achievement = await ProgressEntry.create({
          userId,
          date: new Date(),
          type: 'achievement',
          data: {
            achievementType: 'workout_milestone',
            achievementName: milestone.name,
            description: milestone.description,
          },
        });
        achievements.push(achievement);
      }
    }
  }

  return achievements;
}
