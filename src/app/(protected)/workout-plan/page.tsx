'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Dumbbell, 
  RefreshCw, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Info,
  ArrowLeft,
  Loader2,
  Sparkles,
  X
} from 'lucide-react';

interface Exercise {
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instructions: string;
}

interface WorkoutDay {
  day: string;
  name: string;
  focus: string[];
  exercises: Exercise[];
  estimatedDuration: number;
}

interface WorkoutPlan {
  id: string;
  weeklyPlan: WorkoutDay[];
  explanation: string;
  createdAt: string;
  goal?: string;
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export default function WorkoutPlanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [exerciseExplanation, setExerciseExplanation] = useState<{name: string; text: string} | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // Fetch current workout plan
  useEffect(() => {
    if (status === 'authenticated') {
      fetchWorkoutPlan();
    }
  }, [status]);

  const fetchWorkoutPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workout-plan/generate');
      const data = await response.json();
      
      if (data.success && data.workoutPlan) {
        setWorkoutPlan(data.workoutPlan);
        // Auto-expand first day
        if (data.workoutPlan.weeklyPlan?.length > 0) {
          setExpandedDay(data.workoutPlan.weeklyPlan[0].day);
        }
      }
    } catch (err) {
      console.error('Error fetching workout plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewPlan = async () => {
    try {
      setGenerating(true);
      setError('');
      
      const response = await fetch('/api/workout-plan/generate', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }
      
      setWorkoutPlan(data.workoutPlan);
      if (data.workoutPlan.weeklyPlan?.length > 0) {
        setExpandedDay(data.workoutPlan.weeklyPlan[0].day);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate workout plan');
    } finally {
      setGenerating(false);
    }
  };

  const explainExercise = async (exerciseName: string) => {
    try {
      setLoadingExplanation(true);
      setExerciseExplanation(null);
      
      const response = await fetch('/api/workout-plan/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseName }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setExerciseExplanation({
          name: exerciseName,
          text: data.explanation,
        });
      }
    } catch (err) {
      console.error('Error explaining exercise:', err);
    } finally {
      setLoadingExplanation(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading workout plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-black transition">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-black">AI Workout Plan</h1>
                <p className="text-sm text-gray-600">Your personalized training program</p>
              </div>
            </div>
            <button
              onClick={generateNewPlan}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  {workoutPlan ? 'Regenerate' : 'Generate Plan'}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* No Plan State */}
        {!workoutPlan && !generating && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Sparkles className="h-16 w-16 text-primary-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-black mb-4">Generate Your AI Workout Plan</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Our AI will create a personalized workout plan based on your fitness goals, experience level, and available training days.
            </p>
            <button
              onClick={generateNewPlan}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition"
            >
              <Dumbbell className="h-5 w-5" />
              Generate My Plan
            </button>
          </div>
        )}

        {/* Generating State */}
        {generating && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <Loader2 className="h-20 w-20 animate-spin text-primary-600" />
              <Dumbbell className="h-8 w-8 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-4">Creating Your Plan...</h2>
            <p className="text-gray-600">
              Our AI is designing a personalized workout program just for you.
            </p>
          </div>
        )}

        {/* Workout Plan Display */}
        {workoutPlan && !generating && (
          <div className="space-y-6">
            {/* Plan Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-black">Your Weekly Plan</h2>
                  <p className="text-sm text-gray-600">
                    {workoutPlan.weeklyPlan.length} training days per week
                  </p>
                </div>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Info className="h-4 w-4" />
                  {showExplanation ? 'Hide' : 'Why this plan?'}
                </button>
              </div>
              
              {showExplanation && workoutPlan.explanation && (
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{workoutPlan.explanation}</p>
                </div>
              )}

              {/* Weekly Overview Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const workoutDay = workoutPlan.weeklyPlan.find(d => d.day === day);
                  return (
                    <button
                      key={day}
                      onClick={() => workoutDay && setExpandedDay(expandedDay === day ? null : day)}
                      className={`p-2 rounded-lg text-center transition ${
                        workoutDay 
                          ? 'bg-primary-100 hover:bg-primary-200 cursor-pointer' 
                          : 'bg-gray-100 text-gray-400'
                      } ${expandedDay === day ? 'ring-2 ring-primary-500' : ''}`}
                    >
                      <div className="text-xs font-medium">{DAY_LABELS[day].slice(0, 3)}</div>
                      {workoutDay && (
                        <Dumbbell className="h-4 w-4 mx-auto mt-1 text-primary-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Workout Days */}
            {workoutPlan.weeklyPlan.map((day) => (
              <div key={day.day} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <Dumbbell className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-black">{DAY_LABELS[day.day]}</h3>
                      <p className="text-sm text-gray-600">{day.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {day.estimatedDuration} min
                    </div>
                    {expandedDay === day.day ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedDay === day.day && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    {/* Focus Areas */}
                    <div className="flex flex-wrap gap-2 py-4">
                      {day.focus.map((area) => (
                        <span
                          key={area}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full capitalize"
                        >
                          {area}
                        </span>
                      ))}
                    </div>

                    {/* Exercise List */}
                    <div className="space-y-3">
                      {day.exercises.map((exercise, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-primary-600">#{idx + 1}</span>
                                <h4 className="font-semibold text-black">{exercise.name}</h4>
                              </div>
                              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                <span>{exercise.sets} sets × {exercise.reps} reps</span>
                                <span>{exercise.restSeconds}s rest</span>
                                <span className="capitalize">{exercise.equipment}</span>
                              </div>
                              {exercise.instructions && (
                                <p className="text-sm text-gray-500 mt-2">{exercise.instructions}</p>
                              )}
                            </div>
                            <button
                              onClick={() => explainExercise(exercise.name)}
                              className="ml-4 p-2 text-gray-400 hover:text-primary-600 transition"
                              title="Get AI explanation"
                            >
                              <Info className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Exercise Explanation Modal */}
        {(exerciseExplanation || loadingExplanation) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-black">
                  {loadingExplanation ? 'Loading...' : exerciseExplanation?.name}
                </h3>
                <button
                  onClick={() => setExerciseExplanation(null)}
                  className="text-gray-400 hover:text-black transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loadingExplanation ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  </div>
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">{exerciseExplanation?.text}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
