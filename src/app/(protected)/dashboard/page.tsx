'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Bot, 
  Dumbbell, 
  Calendar, 
  TrendingUp, 
  Utensils, 
  Video, 
  BarChart3,
  Flame,
  Activity,
  Clock,
  LogOut,
  Loader2
} from 'lucide-react';
import ChatModal from './ChatModal';

export default function DashboardPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [motivationQuote, setMotivationQuote] = useState('');
  const [nutritionStats, setNutritionStats] = useState({
    todayCalories: 0,
    weeklyMeals: 0,
    calorieGoal: 2200
  });
  const [progressStats, setProgressStats] = useState({
    workoutsThisWeek: 0,
    workoutsLastWeek: 0,
    currentStreak: 0,
    totalDuration: 0,
    recentWorkouts: [] as Array<{ date: string; workoutName: string }>
  });
  const { data: session, status } = useSession();
  const router = useRouter();

  // Gym motivation quotes
  const gymQuotes = [
    "The only bad workout is the one that didn't happen.",
    "Your body can do it. It's your mind you have to convince.",
    "Champions train, losers complain.",
    "Success isn't given. It's earned in the gym.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Don't wish for it, work for it.",
    "Sweat is just fat crying.",
    "Train like a beast, look like a beauty.",
    "The gym is your therapy session.",
    "Stronger than yesterday, weaker than tomorrow.",
    "Results happen over time, not overnight.",
    "Discipline is doing what needs to be done, even when you don't want to do it.",
    "Your only competition is who you were yesterday.",
    "Great things never come from comfort zones.",
    "The hardest lift of all is lifting your butt off the couch.",
    "Fitness is not about being better than someone else, it's about being better than you used to be.",
    "Train hard, stay humble.",
    "Push yourself because no one else is going to do it for you.",
    "The body achieves what the mind believes.",
    "Every workout is progress, no matter how small."
  ];

  // Set random quote on component mount
  useEffect(() => {
    const randomQuote = gymQuotes[Math.floor(Math.random() * gymQuotes.length)];
    setMotivationQuote(randomQuote);
  }, []);

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
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          
          const thisWeekWorkouts = workoutEntries.filter((e: any) => 
            new Date(e.date) >= weekStart
          );
          
          setProgressStats({
            workoutsThisWeek: thisWeekWorkouts.length,
            workoutsLastWeek: 0,
            currentStreak: progressData.stats?.currentStreak || 0,
            totalDuration: progressData.stats?.totalDuration || 0,
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { href: '/workout-session', icon: Dumbbell, title: 'Start Workout', description: 'Begin your training session', primary: true },
    { href: '/workout-plan', icon: Calendar, title: 'View Plan', description: 'Check your workout schedule' },
    { href: '/progress', icon: TrendingUp, title: 'Progress', description: 'Track your improvements' },
    { href: '/nutrition', icon: Utensils, title: 'Nutrition', description: 'Log meals and track macros' },
    { href: '/form-check', icon: Video, title: 'Form Check', description: 'AI-powered exercise analysis' },
    { href: '/routine-analyzer', icon: BarChart3, title: 'Routine Analyzer', description: 'Optimize your workout split' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <img src="/bg.png" alt="Background" className="fixed inset-0 w-full h-full object-cover opacity-20 blur-sm pointer-events-none z-0" />

      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              GymMind<span className="text-primary-500">.ai</span>
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 hidden sm:block">{session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Motivation Quote Bar */}
      <div className="bg-gray-800/50 border-b border-gray-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="text-center">
            <p className="text-gray-300 text-lg font-medium italic">
              "{motivationQuote}"
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}!
          </h2>
          <p className="text-gray-400 text-lg">Ready to crush your fitness goals today?</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                action.primary 
                  ? 'bg-gradient-to-br from-primary-600 to-primary-700 hover:shadow-primary-500/25' 
                  : 'bg-gray-800/60 backdrop-blur-sm border border-gray-700 hover:border-gray-600 hover:bg-gray-800/80'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                action.primary ? 'bg-white/20' : 'bg-gray-700/50'
              }`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">{action.title}</h3>
              <p className={`text-xs ${action.primary ? 'text-white/70' : 'text-gray-400'}`}>
                {action.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="h-5 w-5 text-primary-500" />
              <span className="text-sm text-gray-400">Workouts</span>
            </div>
            <p className="text-3xl font-bold text-white">{progressStats.workoutsThisWeek}</p>
            <p className="text-xs text-gray-500">this week</p>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-400">Streak</span>
            </div>
            <p className="text-3xl font-bold text-white">{progressStats.currentStreak}</p>
            <p className="text-xs text-gray-500">days in a row</p>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-400">Time</span>
            </div>
            <p className="text-3xl font-bold text-white">{Math.round(progressStats.totalDuration / 60) || 0}h</p>
            <p className="text-xs text-gray-500">total training</p>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-400">Calories</span>
            </div>
            <p className="text-3xl font-bold text-white">{nutritionStats.todayCalories}</p>
            <p className="text-xs text-gray-500">consumed today</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          {progressStats.recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {progressStats.recentWorkouts.map((workout, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <Dumbbell className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{workout.workoutName}</p>
                      <p className="text-sm text-gray-400">{workout.date}</p>
                    </div>
                  </div>
                  <span className="text-green-500 text-sm font-medium">Completed ✓</span>
                </div>
              ))}
              <Link
                href="/progress"
                className="block text-center text-primary-500 hover:text-primary-400 font-medium mt-4 transition"
              >
                View All Activity →
              </Link>
            </div>
          ) : (
            <div className="text-center py-12">
              <Dumbbell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No workouts yet</p>
              <Link
                href="/workout-session"
                className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition"
              >
                Start Your First Workout
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* AI Coach Floating Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg shadow-primary-500/25 p-4 flex items-center justify-center transition hover:scale-110"
        title="AI Coach"
      >
        <Bot className="w-6 h-6" />
      </button>

      {chatOpen && <ChatModal onClose={() => setChatOpen(false)} />}
    </div>
  );
}
