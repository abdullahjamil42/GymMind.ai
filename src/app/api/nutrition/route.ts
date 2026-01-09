/**
 * GymMind.ai - Nutrition Tracking API
 * ====================================
 * Handles meal logging with AI-powered food parsing and calorie tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { connectToDatabase } from '@/lib/db/connection';
import { User, MealEntryModel } from '@/lib/db/schemas';
import { generateLLMResponse, LLMMessage } from '@/lib/ai/llm-client';

// ==========================================
// Food Database & Nutrition Calculation
// ==========================================

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
}

interface NutritionSummary {
  totalCalories: number;
  totalMacros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  foods: FoodItem[];
}

// Simple food database (can be replaced with USDA API later)
const COMMON_FOODS: Record<string, { calories: number; protein: number; carbs: number; fat: number; fiber: number }> = {
  // Proteins
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  'ground beef': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
  'salmon': { calories: 208, protein: 22, carbs: 0, fat: 12, fiber: 0 },
  'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  'tuna': { calories: 132, protein: 28, carbs: 0, fat: 1.3, fiber: 0 },
  
  // Carbs
  'white rice': { calories: 205, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6 },
  'brown rice': { calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5 },
  'oatmeal': { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  'sweet potato': { calories: 112, protein: 2, carbs: 26, fat: 0.1, fiber: 3.9 },
  
  // Vegetables
  'broccoli': { calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6, fiber: 5.1 },
  'spinach': { calories: 41, protein: 5.35, carbs: 6.75, fat: 0.62, fiber: 4 },
  'avocado': { calories: 234, protein: 4.02, carbs: 8.64, fat: 21.4, fiber: 13.5 },
  
  // Common items
  'milk': { calories: 149, protein: 7.69, carbs: 11.7, fat: 8, fiber: 0 },
  'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
  'apple': { calories: 95, protein: 0.47, carbs: 25, fat: 0.17, fiber: 4.5 },
};

function buildFoodParsingPrompt(mealDescription: string): string {
  return `You are a nutrition expert. Parse this meal description into individual food items with estimated quantities and nutritional information.

INPUT: "${mealDescription}"

OUTPUT FORMAT (JSON only, no other text):
{
  "foods": [
    {
      "name": "food item name",
      "quantity": "estimated amount (e.g., '150g', '1 cup', '2 pieces')",
      "calories": estimated_calories_per_serving,
      "protein": grams_of_protein,
      "carbs": grams_of_carbs,
      "fat": grams_of_fat,
      "fiber": grams_of_fiber
    }
  ]
}

RULES:
1. Break down compound foods (e.g., "chicken salad" → chicken, lettuce, dressing)
2. Estimate reasonable portions based on typical serving sizes
3. Use your knowledge of nutrition facts per 100g
4. If unsure about a food, make your best estimate
5. Include all major ingredients mentioned
6. Return ONLY valid JSON, no markdown formatting, no code blocks, no explanations
7. Ensure all macros fields (protein, carbs, fat, fiber) are numbers

Examples:
- "2 eggs and toast" → eggs (2 large), bread (1 slice)
- "chicken breast with rice" → chicken breast (150g), white rice (1 cup cooked)`;
}

async function parseFoodsWithAI(mealDescription: string): Promise<FoodItem[]> {
  try {
    const systemPrompt = buildFoodParsingPrompt(mealDescription);
    
    const response = await generateLLMResponse([
      { role: 'system', content: systemPrompt }
    ], {
      maxTokens: 1024,
      temperature: 0.3, // Lower temperature for more consistent parsing
    });

    // Clean the response to remove markdown code blocks if present
    let cleanResponse = response.content.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse the JSON response
    const parsed = JSON.parse(cleanResponse);
    return parsed.foods || [];
  } catch (error) {
    console.error('AI food parsing failed:', error);
    
    // Fallback: simple keyword matching
    return fallbackFoodParsing(mealDescription);
  }
}

function fallbackFoodParsing(mealDescription: string): FoodItem[] {
  const foods: FoodItem[] = [];
  const lowerDesc = mealDescription.toLowerCase();
  
  // Simple keyword matching as fallback
  Object.entries(COMMON_FOODS).forEach(([foodName, nutrition]) => {
    if (lowerDesc.includes(foodName)) {
      foods.push({
        name: foodName,
        quantity: '1 serving',
        calories: nutrition.calories,
        macros: {
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          fiber: nutrition.fiber,
        },
      });
    }
  });
  
  // Ensure we always return at least one food item with proper structure
  return foods.length > 0 ? foods : [{
    name: 'mixed food',
    quantity: '1 serving',
    calories: 300, // Generic estimate
    macros: { 
      protein: 15, 
      carbs: 30, 
      fat: 10, 
      fiber: 5 
    },
  }];
}

function calculateNutritionSummary(foods: FoodItem[]): NutritionSummary {
  const summary = foods.reduce(
    (acc, food) => ({
      totalCalories: acc.totalCalories + (food.calories || 0),
      totalMacros: {
        protein: acc.totalMacros.protein + (food.macros?.protein || 0),
        carbs: acc.totalMacros.carbs + (food.macros?.carbs || 0),
        fat: acc.totalMacros.fat + (food.macros?.fat || 0),
        fiber: acc.totalMacros.fiber + (food.macros?.fiber || 0),
      },
    }),
    {
      totalCalories: 0,
      totalMacros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
    }
  );

  return { ...summary, foods };
}

// ==========================================
// GET - Fetch Daily Nutrition
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);

    await connectToDatabase();

    // Get all meals for the specified date
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const meals = await MealEntryModel.find({
      userId: session.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 }).lean();

    // Calculate daily totals
    let dailyCalories = 0;
    let dailyMacros = { protein: 0, carbs: 0, fat: 0, fiber: 0 };

    meals.forEach(meal => {
      if (meal.totalCalories) {
        dailyCalories += meal.totalCalories;
      }
      if (meal.totalMacros) {
        dailyMacros.protein += meal.totalMacros.protein || 0;
        dailyMacros.carbs += meal.totalMacros.carbs || 0;
        dailyMacros.fat += meal.totalMacros.fat || 0;
        dailyMacros.fiber += meal.totalMacros.fiber || 0;
      }
    });

    return NextResponse.json({
      success: true,
      date: dateStr,
      meals: meals.map(meal => ({
        id: meal._id,
        mealType: meal.mealType,
        description: meal.description,
        foods: meal.foods,
        totalCalories: meal.totalCalories,
        totalMacros: meal.totalMacros,
        createdAt: meal.createdAt,
      })),
      dailyTotals: {
        calories: Math.round(dailyCalories),
        macros: {
          protein: Math.round(dailyMacros.protein * 10) / 10,
          carbs: Math.round(dailyMacros.carbs * 10) / 10,
          fat: Math.round(dailyMacros.fat * 10) / 10,
          fiber: Math.round(dailyMacros.fiber * 10) / 10,
        },
      },
    });
  } catch (error: any) {
    console.error('Nutrition fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrition data' },
      { status: 500 }
    );
  }
}

// ==========================================
// POST - Log Meal with AI Parsing
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { description, mealType, date } = body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Meal description is required' },
        { status: 400 }
      );
    }

    if (!mealType || !['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
      return NextResponse.json(
        { error: 'Valid meal type is required (breakfast, lunch, dinner, snack)' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Parse foods using AI
    const foods = await parseFoodsWithAI(description.trim());
    const nutritionSummary = calculateNutritionSummary(foods);

    // Save to database
    const mealEntry = await MealEntryModel.create({
      userId: session.user.id,
      date: date ? new Date(date) : new Date(),
      mealType,
      description: description.trim(),
      foods: nutritionSummary.foods,
      totalCalories: nutritionSummary.totalCalories,
      totalMacros: nutritionSummary.totalMacros,
      aiParsed: true,
    });

    return NextResponse.json({
      success: true,
      meal: {
        id: mealEntry._id,
        mealType: mealEntry.mealType,
        description: mealEntry.description,
        foods: mealEntry.foods,
        totalCalories: mealEntry.totalCalories,
        totalMacros: mealEntry.totalMacros,
        createdAt: mealEntry.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Meal logging error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log meal' },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE - Remove Meal Entry
// ==========================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mealId = searchParams.get('id');

    if (!mealId) {
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const deletedMeal = await MealEntryModel.findOneAndDelete({
      _id: mealId,
      userId: session.user.id,
    });

    if (!deletedMeal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Meal deleted successfully',
    });
  } catch (error: any) {
    console.error('Meal deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete meal' },
      { status: 500 }
    );
  }
}