'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950">
      {/* Navigation Header */}
      <nav className="bg-dark-900/80 backdrop-blur-lg border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                GymMind<span className="text-primary-500">.ai</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-dark-300">{session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}! 👋
          </h2>
          <p className="text-dark-400 text-lg">
            Ready to crush your fitness goals today?
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-dark-400 text-sm">Workouts This Week</span>
              <span className="text-2xl">💪</span>
            </div>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-dark-500 text-sm mt-1">+0 from last week</p>
          </div>

          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-dark-400 text-sm">Current Streak</span>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-3xl font-bold text-white">0 days</p>
            <p className="text-dark-500 text-sm mt-1">Keep it going!</p>
          </div>

          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-dark-400 text-sm">Calories Burned</span>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-dark-500 text-sm mt-1">This week</p>
          </div>

          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-dark-400 text-sm">Total Workouts</span>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-dark-500 text-sm mt-1">All time</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link
            href="/workout-plan"
            className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-8 hover:shadow-lg hover:shadow-primary-500/20 transition group"
          >
            <div className="text-4xl mb-4">🏋️</div>
            <h3 className="text-xl font-bold text-white mb-2">Start Workout</h3>
            <p className="text-primary-100">Begin your training session</p>
          </Link>

          <Link
            href="/workout-plan"
            className="bg-dark-900 border border-dark-800 rounded-xl p-8 hover:border-primary-500/50 transition group"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">View Plan</h3>
            <p className="text-dark-400">Check your workout schedule</p>
          </Link>

          <Link
            href="/progress"
            className="bg-dark-900 border border-dark-800 rounded-xl p-8 hover:border-primary-500/50 transition group"
          >
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-white mb-2">Progress</h3>
            <p className="text-dark-400">Track your improvements</p>
          </Link>

          <Link
            href="/nutrition"
            className="bg-dark-900 border border-dark-800 rounded-xl p-8 hover:border-primary-500/50 transition group"
          >
            <div className="text-4xl mb-4">🥗</div>
            <h3 className="text-xl font-bold text-white mb-2">Nutrition</h3>
            <p className="text-dark-400">Log meals and track macros</p>
          </Link>

          <Link
            href="/form-analysis"
            className="bg-dark-900 border border-dark-800 rounded-xl p-8 hover:border-primary-500/50 transition group"
          >
            <div className="text-4xl mb-4">📹</div>
            <h3 className="text-xl font-bold text-white mb-2">Form Check</h3>
            <p className="text-dark-400">AI-powered exercise analysis</p>
          </Link>

          <Link
            href="/ai-coach"
            className="bg-dark-900 border border-dark-800 rounded-xl p-8 hover:border-primary-500/50 transition group"
          >
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-2">AI Coach</h3>
            <p className="text-dark-400">Chat with your AI trainer</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="text-center py-12">
            <p className="text-dark-400 mb-4">No workouts yet</p>
            <Link
              href="/workout-plan"
              className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition"
            >
              Start Your First Workout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
