'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle, 
  Clock, 
  Dumbbell,
  Timer,
  ChevronRight,
  Trophy,
  Flame,
  RotateCcw,
  X,
  Loader2
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

interface SetLog {
  setNumber: number;
  reps: number;
  weight?: number;
  completed: boolean;
}

interface ExerciseProgress {
  exerciseIndex: number;
  sets: SetLog[];
  completed: boolean;
}

export default function WorkoutSessionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [todayWorkout, setTodayWorkout] = useState<WorkoutDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [repsInput, setRepsInput] = useState('');
  const [weightInput, setWeightInput] = useState('');

  // Get today's day name
  const getTodayDayName = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  // Fetch today's workout
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTodayWorkout();
    }
  }, [status]);

  const fetchTodayWorkout = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workout-plan/generate');
      const data = await response.json();
      
      if (data.success && data.workoutPlan?.weeklyPlan) {
        const today = getTodayDayName();
        const todayPlan = data.workoutPlan.weeklyPlan.find(
          (day: WorkoutDay) => day.day.toLowerCase() === today
        );
        
        if (todayPlan && todayPlan.exercises.length > 0) {
          setTodayWorkout(todayPlan);
          // Initialize exercise progress
          const progress: ExerciseProgress[] = todayPlan.exercises.map((_: Exercise, idx: number) => ({
            exerciseIndex: idx,
            sets: [],
            completed: false,
          }));
          setExerciseProgress(progress);
        }
      }
    } catch (err) {
      console.error('Error fetching workout:', err);
    } finally {
      setLoading(false);
    }
  };

  // Start workout timer
  const startWorkout = () => {
    setWorkoutStartTime(new Date());
  };

  // Rest timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  // Calculate elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workoutStartTime && !workoutComplete) {
      interval = setInterval(() => {
        setTotalTime(Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutStartTime, workoutComplete]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Complete current set
  const completeSet = () => {
    if (!todayWorkout) return;

    const currentExercise = todayWorkout.exercises[currentExerciseIndex];
    const reps = parseInt(repsInput) || parseInt(currentExercise.reps) || 10;
    const weight = parseFloat(weightInput) || undefined;

    // Log the set
    const newProgress = [...exerciseProgress];
    newProgress[currentExerciseIndex].sets.push({
      setNumber: currentSetIndex + 1,
      reps,
      weight,
      completed: true,
    });

    // Check if all sets for this exercise are done
    if (currentSetIndex + 1 >= currentExercise.sets) {
      newProgress[currentExerciseIndex].completed = true;
      
      // Move to next exercise or complete workout
      if (currentExerciseIndex + 1 >= todayWorkout.exercises.length) {
        setWorkoutComplete(true);
        setExerciseProgress(newProgress);
        // Log workout to progress
        logWorkoutProgress(newProgress);
        return;
      } else {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
      }
    } else {
      // Start rest timer
      setIsResting(true);
      setRestTimeLeft(currentExercise.restSeconds || 60);
      setCurrentSetIndex(prev => prev + 1);
    }

    setExerciseProgress(newProgress);
    setRepsInput('');
    setWeightInput('');
  };

  // Log workout progress to database
  const logWorkoutProgress = async (progress: ExerciseProgress[]) => {
    try {
      const completedSets = progress.reduce((acc, ex) => acc + ex.sets.length, 0);
      const duration = Math.round(totalTime / 60);
      const calories = Math.round((totalTime / 60) * 7);

      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'workout',
          data: {
            workoutName: todayWorkout?.name || 'Workout',
            duration,
            exercises: todayWorkout?.exercises.length || 0,
            setsCompleted: completedSets,
            caloriesBurned: calories,
          },
        }),
      });
    } catch (err) {
      console.error('Failed to log workout progress:', err);
    }
  };

  // Skip rest
  const skipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  // Skip exercise
  const skipExercise = () => {
    if (!todayWorkout) return;
    
    if (currentExerciseIndex + 1 >= todayWorkout.exercises.length) {
      setWorkoutComplete(true);
    } else {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
      setIsResting(false);
    }
  };

  // Calculate calories burned (rough estimate)
  const estimateCaloriesBurned = () => {
    const minutes = totalTime / 60;
    // Average 6-8 calories per minute for strength training
    return Math.round(minutes * 7);
  };

  // Calculate completed sets
  const getCompletedSets = () => {
    return exerciseProgress.reduce((acc, ex) => acc + ex.sets.length, 0);
  };

  const getTotalSets = () => {
    if (!todayWorkout) return 0;
    return todayWorkout.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // No workout for today
  if (!todayWorkout) {
    return (
      <div className="min-h-screen bg-gray-900">
        <img src="/bg.png" alt="Background" className="fixed inset-0 w-full h-full object-cover opacity-20 blur-sm pointer-events-none z-0" />
        
        <header className="bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-white">Start Workout</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
            <Dumbbell className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Workout Today</h2>
            <p className="text-gray-400 mb-6">
              It looks like today is a rest day or you haven't generated a workout plan yet.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/workout-plan"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
              >
                View Workout Plan
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Workout complete screen
  if (workoutComplete) {
    return (
      <div className="min-h-screen bg-gray-900">
        <img src="/bg.png" alt="Background" className="fixed inset-0 w-full h-full object-cover opacity-20 blur-sm pointer-events-none z-0" />
        
        <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Workout Complete! 🎉</h2>
            <p className="text-gray-400 mb-8">Great job crushing {todayWorkout.name}!</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-700/50 rounded-xl p-4">
                <Clock className="h-6 w-6 text-primary-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{formatTime(totalTime)}</p>
                <p className="text-xs text-gray-400">Duration</p>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{getCompletedSets()}</p>
                <p className="text-xs text-gray-400">Sets Completed</p>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4">
                <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{estimateCaloriesBurned()}</p>
                <p className="text-xs text-gray-400">Calories Burned</p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/progress"
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                View Progress
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentExercise = todayWorkout.exercises[currentExerciseIndex];

  return (
    <div className="min-h-screen bg-gray-900">
      <img src="/bg.png" alt="Background" className="fixed inset-0 w-full h-full object-cover opacity-20 blur-sm pointer-events-none z-0" />

      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
                <X className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">{todayWorkout.name}</h1>
                <p className="text-xs text-gray-400">
                  Exercise {currentExerciseIndex + 1} of {todayWorkout.exercises.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-lg font-mono text-white">{formatTime(totalTime)}</p>
                <p className="text-xs text-gray-400">Elapsed</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-gray-800 h-1">
        <div 
          className="bg-primary-500 h-full transition-all duration-300"
          style={{ width: `${(getCompletedSets() / getTotalSets()) * 100}%` }}
        />
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        {/* Start Workout Button (if not started) */}
        {!workoutStartTime && (
          <div className="text-center mb-8">
            <button
              onClick={startWorkout}
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-xl font-bold rounded-xl transition flex items-center gap-3 mx-auto"
            >
              <Play className="h-6 w-6" />
              Start Workout
            </button>
          </div>
        )}

        {/* Rest Timer Overlay */}
        {isResting && (
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center mb-6">
            <Timer className="h-12 w-12 text-primary-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Rest Time</h2>
            <p className="text-6xl font-mono font-bold text-primary-500 mb-4">
              {formatTime(restTimeLeft)}
            </p>
            <button
              onClick={skipRest}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Skip Rest
            </button>
          </div>
        )}

        {/* Current Exercise */}
        {workoutStartTime && !isResting && (
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs text-primary-500 font-medium uppercase">
                    {currentExercise.muscleGroup}
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">{currentExercise.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">{currentExercise.equipment}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    Set {currentSetIndex + 1} / {currentExercise.sets}
                  </p>
                  <p className="text-sm text-gray-400">{currentExercise.reps} reps</p>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                <p className="text-gray-300 text-sm">{currentExercise.instructions}</p>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Reps Completed</label>
                  <input
                    type="number"
                    value={repsInput}
                    onChange={(e) => setRepsInput(e.target.value)}
                    placeholder={currentExercise.reps}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Weight (optional)</label>
                  <input
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder="lbs"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={completeSet}
                  className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Complete Set
                </button>
                <button
                  onClick={skipExercise}
                  className="px-4 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
                  title="Skip Exercise"
                >
                  <SkipForward className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Set Progress */}
            <div className="bg-gray-900/50 px-6 py-4 flex items-center gap-2">
              {Array.from({ length: currentExercise.sets }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-2 rounded-full ${
                    idx < currentSetIndex ? 'bg-green-500' :
                    idx === currentSetIndex ? 'bg-primary-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Exercise List */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white">Exercise Queue</h3>
          </div>
          <div className="divide-y divide-gray-700">
            {todayWorkout.exercises.map((exercise, idx) => {
              const progress = exerciseProgress[idx];
              const isActive = idx === currentExerciseIndex;
              const isCompleted = progress?.completed;

              return (
                <div
                  key={idx}
                  className={`p-4 flex items-center gap-4 ${
                    isActive ? 'bg-primary-600/10' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-green-500' :
                    isActive ? 'bg-primary-500' : 'bg-gray-700'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-white text-sm font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCompleted ? 'text-gray-400' : 'text-white'}`}>
                      {exercise.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {exercise.sets} sets × {exercise.reps}
                    </p>
                  </div>
                  {isActive && (
                    <ChevronRight className="h-5 w-5 text-primary-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
