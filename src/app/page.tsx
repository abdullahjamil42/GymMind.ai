import React from 'react';
import Link from 'next/link';
import { ArrowRight, Brain, Dumbbell, Utensils, Video, MessageCircle, TrendingUp, ChevronDown, LogIn } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="container-wrapper py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary-400" />
            <span className="font-heading text-2xl font-bold">GymMind.ai</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-gray-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/login" className="sm:hidden">
              <LogIn className="h-6 w-6 text-gray-300 hover:text-white" />
            </Link>
            <Link href="/signup" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-wrapper py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-primary-400/30 bg-primary-900/30 px-4 py-2 backdrop-blur-sm">
            <span className="text-sm text-primary-300">AI-Powered Fitness Revolution</span>
          </div>
          <h1 className="mb-6 font-heading text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            Your Personal
            <span className="bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
              {' '}AI Gym Coach
            </span>
          </h1>
          <p className="mb-10 text-xl text-gray-300 sm:text-2xl">
            Get personalized workout plans, real-time form analysis, and intelligent nutrition tracking—all powered by cutting-edge AI.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4">
              Start Free Today <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="#features" className="btn-secondary text-lg px-8 py-4 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800/60">
              See Features
            </Link>
          </div>
          
          {/* Scroll Indicator */}
          <div className="mt-16 flex justify-center">
            <div className="animate-bounce">
              <ChevronDown className="h-6 w-6 text-gray-400 opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Note */}
      <section className="container-wrapper py-20">
        <div className="mx-auto max-w-4xl">
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <img src="/profilepic.jpeg" alt="Founder Abdullah Jamil" className="w-20 h-20 rounded-full object-cover border-2 border-black" />
              </div>
              <h3 className="text-2xl font-bold mb-2">A Note from the Founder</h3>
              <p className="text-primary-400 font-medium">Abdullah Jamil</p>
            </div>
            <blockquote className="text-lg text-gray-300 leading-relaxed italic">
              "I designed GymMind.ai specifically to help beginners navigate their fitness journey with confidence. 
              Having struggled with inconsistent workouts and confusing nutrition advice myself, I wanted to create 
              an AI-powered platform that makes fitness accessible, personalized, and less intimidating. Whether you're 
              stepping into a gym for the first time or looking to optimize your routine, GymMind.ai is your intelligent 
              companion that grows with you every step of the way."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container-wrapper py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-heading text-4xl font-bold">AI-Powered Features</h2>
          <p className="text-xl text-gray-300">Everything you need for your fitness journey</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature Cards */}
          <FeatureCard
            icon={<Dumbbell className="h-8 w-8" />}
            title="Smart Workout Plans"
            description="AI generates personalized weekly workout plans based on your goals, experience, and available equipment."
          />
          <FeatureCard
            icon={<Video className="h-8 w-8" />}
            title="Form Analysis"
            description="Upload your exercise videos and get instant AI-powered feedback on your form with correction suggestions."
          />
          <FeatureCard
            icon={<Utensils className="h-8 w-8" />}
            title="Nutrition Tracking"
            description="Simply describe what you ate and AI calculates calories and macros automatically."
          />
          <FeatureCard
            icon={<MessageCircle className="h-8 w-8" />}
            title="24/7 AI Coach"
            description="Chat with your personal AI gym assistant anytime for advice, motivation, and answers."
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8" />}
            title="Progress Tracking"
            description="Visualize your fitness journey with smart analytics and AI-powered progress predictions."
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8" />}
            title="Routine Optimizer"
            description="Get AI analysis of your current routine with suggestions for improvement."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="container-wrapper py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-heading text-4xl font-bold">How It Works</h2>
          <p className="text-xl text-gray-300">Get started in three simple steps</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <StepCard number="1" title="Create Your Profile" description="Tell us about your fitness goals, experience level, and preferences." />
          <StepCard number="2" title="Get AI Plans" description="Receive personalized workout and nutrition plans tailored to you." />
          <StepCard number="3" title="Train & Track" description="Follow your plan, log progress, and let AI optimize your journey." />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-wrapper py-20">
        <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-primary-700 p-12 text-center shadow-xl">
          <h2 className="mb-4 font-heading text-4xl font-bold text-white">Ready to Transform?</h2>
          <p className="mb-8 text-xl text-primary-100">Join thousands of users achieving their fitness goals with AI.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-medium text-primary-700 transition-colors hover:bg-gray-50 shadow-lg">
            Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container-wrapper">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary-400" />
              <span className="font-heading text-xl font-bold">GymMind.ai</span>
            </div>
            <p className="text-gray-400">© 2026 GymMind.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors">
      <div className="mb-4 inline-flex rounded-lg bg-primary-900/30 p-3 text-primary-400">
        {icon}
      </div>
      <h3 className="mb-2 font-heading text-xl font-semibold text-white">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 font-heading text-2xl font-bold text-white shadow-lg">
        {number}
      </div>
      <h3 className="mb-2 font-heading text-xl font-semibold text-white">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
