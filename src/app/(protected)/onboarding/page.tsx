'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FitnessGoal = 'lose-weight' | 'build-muscle' | 'gain-strength' | 'improve-endurance' | 'maintain-fitness' | 'general-health';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
type TrainingLocation = 'gym' | 'home' | 'both';
type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '' as Gender,
    height: '',
    weight: '',
    fitnessGoal: '' as FitnessGoal,
    experienceLevel: '' as ExperienceLevel,
    trainingLocation: '' as TrainingLocation,
    availableDays: [] as string[],
    injuries: '',
    medicalConditions: '',
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          injuries: formData.injuries.split(',').map(i => i.trim()).filter(Boolean),
          medicalConditions: formData.medicalConditions.split(',').map(m => m.trim()).filter(Boolean),
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-dark-400">Step {step} of 4</span>
            <span className="text-sm text-dark-400">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-dark-900 rounded-2xl shadow-2xl p-8 border border-dark-800">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to GymMind.ai!</h1>
          <p className="text-dark-400 mb-8">Let's personalize your fitness journey</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => updateField('height', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="175"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => updateField('weight', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="70"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Fitness Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Fitness Goals</h2>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-3">What's your primary goal?</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'lose-weight', label: '🔥 Lose Weight', desc: 'Burn fat and get leaner' },
                    { value: 'build-muscle', label: '💪 Build Muscle', desc: 'Gain size and strength' },
                    { value: 'gain-strength', label: '🏋️ Gain Strength', desc: 'Increase power and performance' },
                    { value: 'improve-endurance', label: '🏃 Improve Endurance', desc: 'Boost stamina and cardio' },
                    { value: 'maintain-fitness', label: '⚖️ Maintain Fitness', desc: 'Stay in current shape' },
                    { value: 'general-health', label: '🌟 General Health', desc: 'Overall wellness' },
                  ].map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => updateField('fitnessGoal', goal.value)}
                      className={`p-4 rounded-lg border-2 text-left transition ${
                        formData.fitnessGoal === goal.value
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-700 bg-dark-800 hover:border-dark-600'
                      }`}
                    >
                      <div className="font-semibold text-white">{goal.label}</div>
                      <div className="text-sm text-dark-400">{goal.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-3">Experience Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' },
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => updateField('experienceLevel', level.value)}
                      className={`p-4 rounded-lg border-2 text-center transition ${
                        formData.experienceLevel === level.value
                          ? 'border-primary-500 bg-primary-500/10 text-white'
                          : 'border-dark-700 bg-dark-800 text-dark-300 hover:border-dark-600'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Training Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Training Preferences</h2>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-3">Where do you train?</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'gym', label: '🏢 Gym' },
                    { value: 'home', label: '🏠 Home' },
                    { value: 'both', label: '🔄 Both' },
                  ].map((location) => (
                    <button
                      key={location.value}
                      onClick={() => updateField('trainingLocation', location.value)}
                      className={`p-4 rounded-lg border-2 text-center transition ${
                        formData.trainingLocation === location.value
                          ? 'border-primary-500 bg-primary-500/10 text-white'
                          : 'border-dark-700 bg-dark-800 text-dark-300 hover:border-dark-600'
                      }`}
                    >
                      {location.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-3">Available Training Days</label>
                <div className="grid grid-cols-4 gap-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`p-3 rounded-lg border-2 text-center text-sm transition ${
                        formData.availableDays.includes(day)
                          ? 'border-primary-500 bg-primary-500/10 text-white'
                          : 'border-dark-700 bg-dark-800 text-dark-300 hover:border-dark-600'
                      }`}
                    >
                      {day.slice(0, 3).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Health Information */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Health Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Any injuries? (comma-separated, optional)
                </label>
                <textarea
                  value={formData.injuries}
                  onChange={(e) => updateField('injuries', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-24"
                  placeholder="e.g., knee injury, lower back pain"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Medical conditions? (comma-separated, optional)
                </label>
                <textarea
                  value={formData.medicalConditions}
                  onChange={(e) => updateField('medicalConditions', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-24"
                  placeholder="e.g., asthma, diabetes"
                />
              </div>

              <div className="bg-primary-500/10 border border-primary-500 rounded-lg p-4">
                <p className="text-sm text-primary-300">
                  ℹ️ This information helps us create a safe and personalized workout plan for you.
                  Always consult with a healthcare professional before starting any new exercise program.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-dark-800">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-3 bg-dark-800 text-white rounded-lg hover:bg-dark-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? 'Completing...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
