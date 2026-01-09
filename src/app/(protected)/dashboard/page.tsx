'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import ChatModal from './ChatModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nutritionStats, setNutritionStats] = useState({
    todayCalories: 0,
    weeklyMeals: 0,
    calorieGoal: 2200
  });
  const [progressStats, setProgressStats] = useState({
    workoutsThisWeek: 0,
    workoutsLastWeek: 0,
    currentStreak: 0,
    recentWorkouts: [] as Array<{ date: string; workoutName: string }>
  });
  const { data: session, status } = useSession();
  const router = useRouter();

  // Fetch all stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch nutrition stats
        const today = new Date().toISOString().split('T')[0];
        const nutritionRes = await fetch(`/api/nutrition?date=${today}`);
        const nutritionData = await nutritionRes.json();
        
        if (nutritionData.success) {
          setNutritionStats(prev => ({
            ...prev,
            todayCalories: nutritionData.dailyTotals?.calories || 0,
            weeklyMeals: nutritionData.meals?.length || 0
          }));
        }

        // Fetch progress stats (get last 30 days for recent activity)
        const progressRes = await fetch('/api/progress?range=30');
        const progressData = await progressRes.json();
        
        if (progressData.success) {
          const workoutEntries = (progressData.entries || [])
            .filter((e: any) => e.type === 'workout');
          
          // Calculate this week's workouts
          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
          weekStart.setHours(0, 0, 0, 0);
          
          const thisWeekWorkouts = workoutEntries.filter((e: any) => 
            new Date(e.date) >= weekStart
          );
          
          setProgressStats({
            workoutsThisWeek: thisWeekWorkouts.length,
            workoutsLastWeek: 0,
            currentStreak: progressData.stats?.currentStreak || 0,
            recentWorkouts: workoutEntries
              .slice(0, 5)
              .map((e: any) => ({
                date: new Date(e.date).toLocaleDateString(),
                workoutName: e.data?.workoutName || 'Workout'
              }))
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchStats();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />
  }

  return (
    <div className="min-h-screen bg-white relative">
      <img src="/bg.png" alt="Background Pattern" className="fixed inset-0 w-full h-full object-cover opacity-100 blur-sm pointer-events-none z-0 scale-110" />
      {/* Navigation Header */}
      <header className="bg-black/60 sticky backdrop-blur-lg border-b border-black shadow-sm z-20  ">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="flex items-center h-16 w-full">
            <div className="flex items-center flex-shrink-0">
              {/*<img src="/logo1.png" alt="GymMind.ai Logo" className="h-16 mr-2 z-30 relative" />*/}
              <h1 className="text-2xl font-bold text-white z-30 relative ">
                GymMind<span className="text-primary-600">.ai</span>
              </h1>
            </div>
            <div className="flex-1" />
            <div className="flex items-center space-x-4 z-30 relative">
              <span className="text-gray-200">{session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-4 py-2  hover:bg-gray-800 text-white rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slim Stats Bar Below Nav */}
      <div className="w-full bg-red-950 bg-opacity-30    z-20 relative flex items-center justify-center px-2 py-2 text-sm font-medium text-white/80 space-x-6 whitespace-nowrap overflow-x-auto">
        <span>Workouts This Week:  <span className="font-bold text-black  ">{progressStats.workoutsThisWeek}</span> {progressStats.workoutsLastWeek > 0 && `(+${progressStats.workoutsThisWeek - progressStats.workoutsLastWeek} from last week)`}</span>
        <span className="mx-2">|</span>
        <span>Current Streak: <span className="font-bold text-black">{progressStats.currentStreak} days</span> {progressStats.currentStreak > 0 ? '🔥' : '(Start today!)'}</span>
        <span className="mx-2">|</span>
        <span>Calories Today: <span className="font-bold text-black">{nutritionStats.todayCalories}</span> of {nutritionStats.calorieGoal}</span>
        <span className="mx-2">|</span>
        <span>Meals Today: <span className="font-bold text-black">{nutritionStats.weeklyMeals}</span> logged</span>
      </div> 

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-2 sm:px-3 lg:px-4 py-8 relative z-20">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}!
          </h2>
          <p className="text-gray-400 text-lg">
            Ready to crush your fitness goals today?
          </p>
        </div>

        {/* Quick Actions - Single Row, No AI Coach */}
        <div className="flex flex-row gap-4 mb-12 w-full justify-between opacity-70">
          <Link
            href="/workout-session"
            className="bg-white rounded-lg px-6 py-4 flex-1 min-w-0 flex flex-col items-center transition group hover:shadow-[0_0_40px_12px_rgba(239,68,68,0.35)] hover:ring-2 hover:ring-primary-400 hover:opacity-60"
          >
            <img src="start.gif" alt="Start Workout" className="h-30  mb-2" />
            <h3 className="text-base font-bold text-black mb-1">Start Workout</h3>
            <p className="text-xs text-red-950">Begin your training session</p>
          </Link>

          <Link
            href="/workout-plan"
            className="bg-white border border-gray-200 rounded-lg px-6 py-4 flex-1 min-w-0 flex flex-col items-center transition group hover:shadow-[0_0_40px_12px_rgba(239,68,68,0.25)] hover:ring-2 hover:ring-primary-200 hover:opacity-60"
          >
            <img src="plan.gif" alt="Start Workout" className="h-30  mb-2" />
            <h3 className="text-base font-bold text-black mb-1">View Plan</h3>
            <p className="text-xs text-gray-600">Check your workout schedule</p>
          </Link>

          <Link
            href="/progress"
            className="bg-white border border-gray-200 rounded-lg px-6 py-4 flex-1 min-w-0 flex flex-col items-center transition group hover:shadow-[0_0_40px_12px_rgba(239,68,68,0.25)] hover:ring-2 hover:ring-primary-200 hover:opacity-60"
          >
            <img src="progress.gif" alt="Start Workout" className="h-40  mb-2" />
            <h3 className="text-base font-bold text-black mb-1">Progress</h3>
            <p className="text-xs text-gray-600">Track your improvements</p>
          </Link>

          <Link
            href="/nutrition"
            className="bg-white border border-gray-200 rounded-lg px-6 py-4 flex-1 min-w-0 flex flex-col items-center transition group hover:shadow-[0_0_40px_12px_rgba(239,68,68,0.25)] hover:ring-2 hover:ring-primary-200 hover:opacity-60"
          >
            <img src="nutrition.gif" alt="Start Workout" className="h-30  mb-2" />
            <h3 className="text-base font-bold text-black mb-1">Nutrition</h3>
            <p className="text-xs text-gray-600">Log meals and track macros</p>
          </Link>

          <Link
            href="/form-check"
            className="bg-white border border-gray-200 rounded-lg px-6 py-4 flex-1 min-w-0 flex flex-col items-center transition group hover:shadow-[0_0_40px_12px_rgba(239,68,68,0.25)] hover:ring-2 hover:ring-primary-200 hover:opacity-60"
          >
            <img src="formcheck.gif" alt="Form Check" className="h-30  mb-2" />
            <h3 className="text-base font-bold text-black mb-1">Form Check</h3>
            <p className="text-xs text-gray-600">AI-powered exercise analysis</p>
          </Link>

          <Link
            href="/routine-analyzer"
            className="bg-white border border-gray-200 rounded-lg px-6 py-4 flex-1 min-w-0 flex flex-col items-center transition group hover:shadow-[0_0_40px_12px_rgba(239,68,68,0.25)] hover:ring-2 hover:ring-primary-200 hover:opacity-60"
          >
            <img src="routine.gif" alt="Routine Analyzer" className="h-30  mb-2 opacity-80" />
            <h3 className="text-base font-bold text-black mb-1">Routine Analyzer</h3>
            <p className="text-xs text-gray-600">Optimize your workout split</p>
          </Link>
        </div>

        {/* AI Coach Floating Button */}
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-8 right-8 z-50 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg p-5 flex items-center justify-center transition"
          title="AI Coach"
        >
          <span className="sr-only">AI Coach</span>
          <Bot className="w-8 h-8" />
        </button>

        {chatOpen && <ChatModal onClose={() => setChatOpen(false)} />}

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm bg-opacity-70 hover:opacity-90 transition">
          <h3 className="text-2xl font-bold text-black mb-6">Recent Activity</h3>
          {progressStats.recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {progressStats.recentWorkouts.map((workout, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600">💪</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{workout.workoutName}</p>
                      <p className="text-sm text-gray-500">{workout.date}</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-medium">Completed ✓</span>
                </div>
              ))}
              <Link
                href="/progress"
                className="block text-center text-primary-600 hover:text-primary-700 font-medium mt-4"
              >
                View All Activity →
              </Link>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No workouts yet</p>
              <Link
                href="/workout-session"
                className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition"
              >
                Start Your First Workout
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
