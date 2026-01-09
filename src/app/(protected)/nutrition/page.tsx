'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Loader2, 
  Utensils, 
  Coffee, 
  Sun, 
  Moon, 
  Cookie,
  Trash2,
  Target,
  TrendingUp
} from 'lucide-react';

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

interface MealEntry {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  foods: FoodItem[];
  totalCalories: number;
  totalMacros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  createdAt: string;
}

interface DailyTotals {
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

const MEAL_ICONS = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch', 
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function NutritionPage() {
  const { data: session, status } = useSession();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({ calories: 0, macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 } });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [mealDescription, setMealDescription] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // User goals (can be made dynamic later)
  const calorieGoal = 2200;
  const proteinGoal = 150;
  const carbGoal = 250;
  const fatGoal = 80;

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNutritionData();
    }
  }, [status, selectedDate]);

  const fetchNutritionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/nutrition?date=${selectedDate}`);
      const data = await response.json();
      
      if (data.success) {
        setMeals(data.meals || []);
        setDailyTotals(data.dailyTotals || { calories: 0, macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 } });
      }
    } catch (err) {
      console.error('Error fetching nutrition data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async () => {
    if (!mealDescription.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: mealDescription.trim(),
          mealType,
          date: selectedDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log meal');
      }

      // Add the new meal to the list
      setMeals(prev => [data.meal, ...prev]);
      
      // Update daily totals
      setDailyTotals(prev => ({
        calories: prev.calories + (data.meal.totalCalories || 0),
        macros: {
          protein: prev.macros.protein + (data.meal.totalMacros?.protein || 0),
          carbs: prev.macros.carbs + (data.meal.totalMacros?.carbs || 0),
          fat: prev.macros.fat + (data.meal.totalMacros?.fat || 0),
          fiber: prev.macros.fiber + (data.meal.totalMacros?.fiber || 0),
        },
      }));

      // Reset form
      setMealDescription('');
      setShowAddMeal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to log meal');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    try {
      const response = await fetch(`/api/nutrition?id=${mealId}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        // Remove meal from list and update totals
        const deletedMeal = meals.find(m => m.id === mealId);
        if (deletedMeal) {
          setMeals(prev => prev.filter(m => m.id !== mealId));
          setDailyTotals(prev => ({
            calories: prev.calories - (deletedMeal.totalCalories || 0),
            macros: {
              protein: prev.macros.protein - (deletedMeal.totalMacros?.protein || 0),
              carbs: prev.macros.carbs - (deletedMeal.totalMacros?.carbs || 0),
              fat: prev.macros.fat - (deletedMeal.totalMacros?.fat || 0),
              fiber: prev.macros.fiber - (deletedMeal.totalMacros?.fiber || 0),
            },
          }));
        }
      }
    } catch (err) {
      console.error('Error deleting meal:', err);
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatMacroProgress = (current: number, goal: number) => {
    return `${Math.round(current)}g / ${goal}g`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading nutrition data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Background */}
      <img src="/bg.png" alt="Background" className="fixed inset-0 w-full h-full object-cover opacity-20 blur-sm pointer-events-none z-0" />

      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Nutrition Tracker</h1>
                <p className="text-sm text-gray-400">AI-powered calorie and macro tracking</p>
              </div>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        {/* Daily Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Calories */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary-500" />
              <h3 className="text-sm font-medium text-gray-300">Calories</h3>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{dailyTotals.calories}</div>
            <div className="text-xs text-gray-500">of {calorieGoal} goal</div>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(dailyTotals.calories, calorieGoal)}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-300">Protein</h3>
            </div>
            <div className="text-lg font-bold text-white mb-1">{formatMacroProgress(dailyTotals.macros.protein, proteinGoal)}</div>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(dailyTotals.macros.protein, proteinGoal)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-medium text-gray-300">Carbs</h3>
            </div>
            <div className="text-lg font-bold text-white mb-1">{formatMacroProgress(dailyTotals.macros.carbs, carbGoal)}</div>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(dailyTotals.macros.carbs, carbGoal)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-yellow-500" />
              <h3 className="text-sm font-medium text-gray-300">Fat</h3>
            </div>
            <div className="text-lg font-bold text-white mb-1">{formatMacroProgress(dailyTotals.macros.fat, fatGoal)}</div>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(dailyTotals.macros.fat, fatGoal)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Add Meal Button */}
        {!showAddMeal && (
          <button
            onClick={() => setShowAddMeal(true)}
            className="w-full mb-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition"
          >
            <Plus className="h-5 w-5" />
            Log a Meal
          </button>
        )}

        {/* Add Meal Form */}
        {showAddMeal && (
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Log New Meal</h3>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(Object.keys(MEAL_LABELS) as Array<keyof typeof MEAL_LABELS>).map((type) => {
                const Icon = MEAL_ICONS[type];
                return (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 transition ${
                      mealType === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{MEAL_LABELS[type]}</span>
                  </button>
                );
              })}
            </div>

            <textarea
              value={mealDescription}
              onChange={(e) => setMealDescription(e.target.value)}
              placeholder="Describe what you ate... (e.g., 'grilled chicken breast with brown rice and steamed broccoli')"
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-4"
            />

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={addMeal}
                disabled={!mealDescription.trim() || submitting}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Utensils className="h-4 w-4" />
                    Log Meal
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowAddMeal(false);
                  setMealDescription('');
                  setError('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Meals List */}
        <div className="space-y-4">
          {meals.length === 0 ? (
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
              <Utensils className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No meals logged today</h3>
              <p className="text-gray-500">Start tracking your nutrition by logging your first meal!</p>
            </div>
          ) : (
            meals.map((meal) => {
              const Icon = MEAL_ICONS[meal.mealType];
              return (
                <div key={meal.id} className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{MEAL_LABELS[meal.mealType]}</h3>
                        <p className="text-sm text-gray-400">{meal.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{meal.totalCalories} cal</div>
                        <div className="text-xs text-gray-400">
                          P: {Math.round(meal.totalMacros?.protein || 0)}g • 
                          C: {Math.round(meal.totalMacros?.carbs || 0)}g • 
                          F: {Math.round(meal.totalMacros?.fat || 0)}g
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMeal(meal.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Food Items */}
                  {meal.foods && meal.foods.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                      {meal.foods.map((food, idx) => (
                        <div key={idx} className="bg-gray-700/50 rounded-lg p-3 text-sm">
                          <div className="font-medium text-gray-200 capitalize">{food.name}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {food.quantity} • {food.calories} cal
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
