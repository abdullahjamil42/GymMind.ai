'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Loader2, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle,
  Target,
  Dumbbell,
  Brain,
  Sparkles,
  Plus,
  Trash2,
  Search
} from 'lucide-react';

interface ExerciseInput {
  name: string;
  sets: number;
  reps: string;
}

interface DayRoutine {
  day: string;
  exercises: ExerciseInput[];
}

interface MuscleBalance {
  group: string;
  weeklyVolume: number;
  status: 'optimal' | 'low' | 'high';
  recommendation: string;
}

interface AnalysisResult {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  muscleGroupBalance: MuscleBalance[];
  tips: string[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SAMPLE_EXERCISES = [
  'Bench Press', 'Squat', 'Deadlift', 'Pull-up', 'Overhead Press',
  'Barbell Row', 'Dumbbell Curl', 'Tricep Extension', 'Leg Press',
  'Lat Pulldown', 'Lunges', 'Plank', 'Cable Fly', 'Face Pull'
];

export default function RoutineAnalyzerPage() {
  const { data: session, status } = useSession();
  const [routine, setRoutine] = useState<DayRoutine[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [showAddExercise, setShowAddExercise] = useState<string | null>(null);
  const [newExercise, setNewExercise] = useState({ name: '', sets: 3, reps: '10' });

  // Load existing routine
  useEffect(() => {
    if (status === 'authenticated') {
      fetchExistingRoutine();
    }
  }, [status]);

  const fetchExistingRoutine = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workout-plan/generate');
      const data = await response.json();
      
      if (data.success && data.workoutPlan?.weeklyPlan) {
        const loadedRoutine: DayRoutine[] = data.workoutPlan.weeklyPlan.map((day: any) => ({
          day: day.day.charAt(0).toUpperCase() + day.day.slice(1),
          exercises: day.exercises.map((ex: any) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
          })),
        }));
        setRoutine(loadedRoutine);
      } else {
        // Initialize empty routine
        setRoutine(DAYS.map(day => ({ day, exercises: [] })));
      }
    } catch (err) {
      console.error('Error fetching routine:', err);
      setRoutine(DAYS.map(day => ({ day, exercises: [] })));
    } finally {
      setLoading(false);
    }
  };

  const analyzeRoutine = async () => {
    const hasExercises = routine.some(day => day.exercises.length > 0);
    if (!hasExercises) {
      setError('Please add at least one exercise to analyze.');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const response = await fetch('/api/routine-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routine }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze routine');
    } finally {
      setAnalyzing(false);
    }
  };

  const addExercise = (dayName: string) => {
    if (!newExercise.name.trim()) return;

    setRoutine(prev => prev.map(day => 
      day.day === dayName
        ? { ...day, exercises: [...day.exercises, { ...newExercise }] }
        : day
    ));
    setNewExercise({ name: '', sets: 3, reps: '10' });
    setShowAddExercise(null);
  };

  const removeExercise = (dayName: string, exerciseIndex: number) => {
    setRoutine(prev => prev.map(day =>
      day.day === dayName
        ? { ...day, exercises: day.exercises.filter((_, idx) => idx !== exerciseIndex) }
        : day
    ));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500';
    return 'bg-red-500/20 border-red-500';
  };

  const getStatusIcon = (status: 'optimal' | 'low' | 'high') => {
    switch (status) {
      case 'optimal': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'low': return <TrendingDown className="h-4 w-4 text-yellow-500" />;
      case 'high': return <TrendingUp className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'optimal' | 'low' | 'high') => {
    switch (status) {
      case 'optimal': return 'bg-green-500';
      case 'low': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <img src="/bg.png" alt="Background" className="fixed inset-0 w-full h-full object-cover opacity-20 blur-sm pointer-events-none z-0" />

      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Routine Analyzer</h1>
                <p className="text-sm text-gray-400">AI-powered workout optimization</p>
              </div>
            </div>
            <button
              onClick={analyzeRoutine}
              disabled={analyzing}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Analyze Routine
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Routine Editor */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary-500" />
              Your Weekly Routine
            </h2>
            
            {routine.map((day) => (
              <div key={day.day} className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="font-medium text-white">{day.day}</h3>
                  <span className="text-xs text-gray-400">{day.exercises.length} exercises</span>
                </div>
                
                <div className="p-4 space-y-2">
                  {day.exercises.length === 0 ? (
                    <p className="text-gray-500 text-sm">Rest day or no exercises added</p>
                  ) : (
                    day.exercises.map((exercise, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                        <div>
                          <p className="text-white text-sm font-medium">{exercise.name}</p>
                          <p className="text-xs text-gray-400">{exercise.sets} sets × {exercise.reps}</p>
                        </div>
                        <button
                          onClick={() => removeExercise(day.day, idx)}
                          className="p-1 text-gray-400 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}

                  {showAddExercise === day.day ? (
                    <div className="bg-gray-700/30 rounded-lg p-3 space-y-3">
                      <input
                        type="text"
                        value={newExercise.name}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Exercise name"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                        list="exercises-list"
                      />
                      <datalist id="exercises-list">
                        {SAMPLE_EXERCISES.map(ex => <option key={ex} value={ex} />)}
                      </datalist>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={newExercise.sets}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 3 }))}
                          className="w-20 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm text-center"
                          placeholder="Sets"
                        />
                        <input
                          type="text"
                          value={newExercise.reps}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, reps: e.target.value }))}
                          className="w-20 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm text-center"
                          placeholder="Reps"
                        />
                        <button
                          onClick={() => addExercise(day.day)}
                          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded px-3 py-2 text-sm transition"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowAddExercise(null)}
                          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddExercise(day.day)}
                      className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-500 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Exercise
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Analysis Results */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-500" />
              Analysis Results
            </h2>

            {!analysisResult ? (
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center">
                <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Ready to Analyze</h3>
                <p className="text-gray-400 text-sm">
                  Click "Analyze Routine" to get AI-powered insights about your workout plan.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Overall Score */}
                <div className={`p-6 rounded-xl border ${getScoreBgColor(analysisResult.overallScore)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-gray-300 mb-1">Overall Score</h3>
                      <p className={`text-5xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                        {analysisResult.overallScore}
                      </p>
                    </div>
                    <Target className={`h-16 w-16 ${getScoreColor(analysisResult.overallScore)} opacity-50`} />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                  <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary-500" />
                    AI Summary
                  </h4>
                  <p className="text-gray-300 text-sm">{analysisResult.summary}</p>
                </div>

                {/* Muscle Balance */}
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                  <h4 className="font-medium text-white mb-4">Muscle Group Balance</h4>
                  <div className="space-y-3">
                    {analysisResult.muscleGroupBalance.map((muscle, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(muscle.status)}
                            <span className="text-sm text-white">{muscle.group}</span>
                          </div>
                          <span className="text-sm text-gray-400">{muscle.weeklyVolume} sets/week</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getStatusColor(muscle.status)} transition-all duration-300`}
                            style={{ width: `${Math.min((muscle.weeklyVolume / 20) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{muscle.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                    <h4 className="font-medium text-green-500 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                    <h4 className="font-medium text-yellow-500 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary-500" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-primary-500 font-bold">{idx + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
