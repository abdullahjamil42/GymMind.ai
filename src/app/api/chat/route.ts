/**
 * GymMind.ai - AI Gym Chatbot API
 * ================================
 * Handles chat messages with personalized gym coaching context.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { connectToDatabase } from '@/lib/db/connection';
import { User, ChatMessageModel, WorkoutPlanModel } from '@/lib/db/schemas';
import { generateLLMResponse, LLMMessage } from '@/lib/ai/llm-client';

// ==========================================
// System Prompt for Gym Coach
// ==========================================

function buildSystemPrompt(userContext: string): string {
  return `You are GymMind AI, an expert AI gym coach and fitness assistant. You provide personalized, science-based advice on workouts, nutrition, form, and fitness goals.

IMPORTANT RULES:
1. ONLY answer questions related to fitness, exercise, nutrition, gym equipment, workout plans, form tips, and general health/wellness.
2. If asked about medical conditions, injuries, or health issues, recommend consulting a healthcare professional. You can provide general fitness guidance but NOT medical advice.
3. Be encouraging, motivating, and supportive in your tone.
4. Keep responses concise but helpful - aim for 2-4 paragraphs unless more detail is needed.
5. Use the user's personal data to give personalized advice when relevant.
6. If asked about topics outside fitness/health (politics, coding, etc.), politely redirect to fitness topics.

USER CONTEXT:
${userContext}

Remember: You are a supportive gym coach who knows this user personally. Use their data to customize your advice.`;
}

function buildUserContext(user: any, workoutPlan: any): string {
  const parts: string[] = [];

  if (user.name) {
    parts.push(`Name: ${user.name}`);
  }
  if (user.gender) {
    parts.push(`Gender: ${user.gender}`);
  }
  if (user.height) {
    parts.push(`Height: ${user.height} cm`);
  }
  if (user.weight) {
    parts.push(`Weight: ${user.weight} kg`);
  }
  if (user.fitnessGoal) {
    parts.push(`Fitness Goal: ${user.fitnessGoal.replace(/-/g, ' ')}`);
  }
  if (user.experienceLevel) {
    parts.push(`Experience Level: ${user.experienceLevel}`);
  }
  if (user.trainingLocation) {
    parts.push(`Training Location: ${user.trainingLocation}`);
  }
  if (user.availableDays?.length) {
    parts.push(`Available Training Days: ${user.availableDays.join(', ')}`);
  }
  if (user.injuries?.length) {
    parts.push(`Injuries/Limitations: ${user.injuries.join(', ')}`);
  }
  if (user.bmr) {
    parts.push(`BMR: ${user.bmr} calories`);
  }
  if (user.tdee) {
    parts.push(`TDEE: ${user.tdee} calories`);
  }

  if (workoutPlan?.weeklyPlan?.length) {
    const workoutDays = workoutPlan.weeklyPlan.map((d: any) => `${d.day}: ${d.name}`).join(', ');
    parts.push(`Current Workout Plan: ${workoutDays}`);
  }

  return parts.length > 0 ? parts.join('\n') : 'No profile data available yet.';
}

// ==========================================
// GET - Fetch Chat History
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get last 50 messages
    const messages = await ChatMessageModel.find({ userId: session.user.id })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    // Reverse to get chronological order
    const chronologicalMessages = messages.reverse();

    return NextResponse.json({
      success: true,
      messages: chronologicalMessages,
    });
  } catch (error: any) {
    console.error('Chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

// ==========================================
// POST - Send Message & Get AI Response
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Fetch user profile
    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch active workout plan
    const workoutPlan = await WorkoutPlanModel.findOne({
      userId: session.user.id,
      isActive: true,
    }).lean();

    // Get recent chat history for context (last 10 messages)
    const recentMessages = await ChatMessageModel.find({ userId: session.user.id })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // Build context
    const userContext = buildUserContext(user, workoutPlan);
    const systemPrompt = buildSystemPrompt(userContext);

    // Build LLM messages
    const llmMessages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add recent history (in chronological order)
    const historyMessages = recentMessages.reverse();
    for (const msg of historyMessages) {
      llmMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
    }

    // Add current user message
    llmMessages.push({ role: 'user', content: message.trim() });

    // Save user message to database
    const userMessage = await ChatMessageModel.create({
      userId: session.user.id,
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    });

    // Generate AI response
    const aiResponse = await generateLLMResponse(llmMessages, {
      maxTokens: 1024,
      temperature: 0.7,
    });

    // Save assistant message to database
    const assistantMessage = await ChatMessageModel.create({
      userId: session.user.id,
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      userMessage: {
        id: userMessage._id,
        role: 'user',
        content: userMessage.content,
        timestamp: userMessage.timestamp,
      },
      assistantMessage: {
        id: assistantMessage._id,
        role: 'assistant',
        content: assistantMessage.content,
        timestamp: assistantMessage.timestamp,
      },
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE - Clear Chat History
// ==========================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    await ChatMessageModel.deleteMany({ userId: session.user.id });

    return NextResponse.json({
      success: true,
      message: 'Chat history cleared',
    });
  } catch (error: any) {
    console.error('Clear chat error:', error);
    return NextResponse.json(
      { error: 'Failed to clear chat history' },
      { status: 500 }
    );
  }
}
