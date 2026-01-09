'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  Flame,
  Clock,
  Dumbbell,
  Scale,
  Trophy,
  Calendar,
  Plus,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';

interface ProgressStats {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  currentStreak: number;
  weightChange: number | null;
  currentWeight: number | null;
}

interface WeeklySummary {
  week: string;
  count: number;
}

interface ProgressEntry {
  id: string;
  type: 'workout' | 'weight' | 'achievement';
  date: string;
  data: any;
}

export default function ProgressPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary[]>([]);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [range, setRange] = useState('30');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProgress();
    }
  }, [status, range]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/progress?range=${range}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setWeeklySummary(data.weeklySummary || []);
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const logWeight = async () => {
    if (!newWeight || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'weight',
          data: {
            weight: parseFloat(newWeight),
            unit: 'lbs',
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowWeightModal(false);
        setNewWeight('');
        fetchProgress();
      }
    } catch (err) {
      console.error('Error logging weight:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getMaxWorkouts = () => {
    if (weeklySummary.length === 0) return 7;
    return Math.max(...weeklySummary.map(w => w.count), 7);
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
                <h1 className="text-xl font-bold text-white">Progress Tracking</h1>
                <p className="text-sm text-gray-400">Monitor your fitness journey</p>
              </div>
            </div>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="h-5 w-5 text-primary-500" />
              <span className="text-sm text-gray-400">Workouts</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalWorkouts || 0}</p>
            <p className="text-xs text-gray-500">in {range} days</p>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-400">Current Streak</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.currentStreak || 0}</p>
            <p className="text-xs text-gray-500">days in a row</p>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-400">Total Time</span>
            </div>
            <p className="text-3xl font-bold text-white">{formatDuration(stats?.totalDuration || 0)}</p>
            <p className="text-xs text-gray-500">exercising</p>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-400">Calories</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalCalories?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-500">burned</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Chart */}
          <div className="lg:col-span-2 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary-500" />
                Weekly Workouts
              </h2>
            </div>

            {weeklySummary.length > 0 ? (
              <div className="space-y-3">
                {weeklySummary.map((week, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 w-16">{week.week}</span>
                    <div className="flex-1 bg-gray-700/50 rounded-full h-8 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                        style={{ width: `${Math.max((week.count / getMaxWorkouts()) * 100, week.count > 0 ? 15 : 0)}%` }}
                      >
                        {week.count > 0 && (
                          <span className="text-sm font-bold text-white">{week.count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No workout data yet</p>
                <p className="text-sm text-gray-500">Complete workouts to see your progress</p>
              </div>
            )}
          </div>

          {/* Weight Tracking */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary-500" />
                Weight
              </h2>
              <button
                onClick={() => setShowWeightModal(true)}
                className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {stats?.currentWeight ? (
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-white mb-1">{stats.currentWeight}</p>
                <p className="text-sm text-gray-400">lbs</p>
                
                {stats.weightChange !== null && (
                  <div className={`mt-4 flex items-center justify-center gap-2 ${
                    stats.weightChange < 0 ? 'text-green-500' : stats.weightChange > 0 ? 'text-yellow-500' : 'text-gray-400'
                  }`}>
                    {stats.weightChange < 0 ? (
                      <TrendingDown className="h-5 w-5" />
                    ) : stats.weightChange > 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : null}
                    <span className="font-medium">
                      {stats.weightChange > 0 ? '+' : ''}{stats.weightChange} lbs
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Scale className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No weight logged</p>
                <button
                  onClick={() => setShowWeightModal(true)}
                  className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition text-sm"
                >
                  Log Weight
                </button>
              </div>
            )}

            {/* Recent weight entries */}
            <div className="mt-4 space-y-2">
              {entries
                .filter(e => e.type === 'weight')
                .slice(0, 5)
                .map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-gray-700/30 rounded-lg px-3 py-2">
                    <span className="text-gray-400">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    <span className="text-white font-medium">{entry.data.weight} lbs</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-6 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </h2>

          {entries.filter(e => e.type === 'achievement').length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {entries
                .filter(e => e.type === 'achievement')
                .map((achievement, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 rounded-xl p-4 text-center">
                    <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <h3 className="font-bold text-white">{achievement.data.achievementName}</h3>
                    <p className="text-xs text-gray-400 mt-1">{achievement.data.description}</p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No achievements yet</p>
              <p className="text-sm text-gray-500">Complete workouts to unlock achievements!</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary-500" />
            Recent Activity
          </h2>

          {entries.filter(e => e.type === 'workout').length > 0 ? (
            <div className="space-y-3">
              {entries
                .filter(e => e.type === 'workout')
                .slice(0, 10)
                .map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-700/30 rounded-lg p-4">
                    <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center">
                      <Dumbbell className="h-5 w-5 text-primary-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{entry.data.workoutName || 'Workout'}</p>
                      <p className="text-sm text-gray-400">
                        {entry.data.duration} min • {entry.data.setsCompleted || 0} sets • {entry.data.caloriesBurned || 0} cal
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Dumbbell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No workouts logged yet</p>
              <Link
                href="/workout-session"
                className="inline-block mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition text-sm"
              >
                Start a Workout
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">Log Weight</h3>
            <input
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Enter weight in lbs"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-xl focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              step="0.1"
            />
            <div className="flex gap-3">
              <button
                onClick={logWeight}
                disabled={!newWeight || submitting}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowWeightModal(false);
                  setNewWeight('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
