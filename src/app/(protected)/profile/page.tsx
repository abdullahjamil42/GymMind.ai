'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Target, 
  Activity, 
  MapPin, 
  Edit2, 
  Check, 
  X, 
  Loader2,
  Save
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  age?: number;
  height?: number;
  weight?: number;
  fitnessGoal?: string;
  experienceLevel?: string;
  location?: string;
  bio?: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchProfile();
    }
  }, [status, session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      
      if (data.success) {
        setProfile({
          name: data.profile.name || session?.user?.name || '',
          email: data.profile.email || session?.user?.email || '',
          age: data.profile.age,
          height: data.profile.height,
          weight: data.profile.weight,
          fitnessGoal: data.profile.fitnessGoal,
          experienceLevel: data.profile.experienceLevel,
          location: data.profile.location,
          bio: data.profile.bio
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      // Update session if name changed
      if (profile.name !== session?.user?.name) {
        await update({ name: profile.name });
      }
      
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
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
                <h1 className="text-xl font-bold text-white">Profile Settings</h1>
                <p className="text-sm text-gray-400">Manage your account information</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white rounded-lg transition"
                    disabled={saving}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{profile.name || 'User'}</h2>
              <p className="text-gray-400 mb-4">{profile.email}</p>
              {profile.bio && (
                <p className="text-sm text-gray-300 italic">"{profile.bio}"</p>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-6">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-gray-400 py-2">{profile.name || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address
                    </label>
                    <p className="text-gray-400 py-2">{profile.email}</p>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Age
                    </label>
                    {editing ? (
                      <input
                        type="number"
                        value={profile.age || ''}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                        placeholder="Enter your age"
                      />
                    ) : (
                      <p className="text-gray-400 py-2">{profile.age ? `${profile.age} years` : 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Location
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={profile.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                        placeholder="City, Country"
                      />
                    ) : (
                      <p className="text-gray-400 py-2">{profile.location || 'Not set'}</p>
                    )}
                  </div>
                </div>

                {/* Fitness Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Activity className="h-4 w-4 inline mr-1" />
                      Height (cm)
                    </label>
                    {editing ? (
                      <input
                        type="number"
                        value={profile.height || ''}
                        onChange={(e) => handleInputChange('height', parseInt(e.target.value) || '')}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                        placeholder="170"
                      />
                    ) : (
                      <p className="text-gray-400 py-2">{profile.height ? `${profile.height} cm` : 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Activity className="h-4 w-4 inline mr-1" />
                      Weight (kg)
                    </label>
                    {editing ? (
                      <input
                        type="number"
                        value={profile.weight || ''}
                        onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || '')}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                        placeholder="70"
                      />
                    ) : (
                      <p className="text-gray-400 py-2">{profile.weight ? `${profile.weight} kg` : 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Target className="h-4 w-4 inline mr-1" />
                      Fitness Goal
                    </label>
                    {editing ? (
                      <select
                        value={profile.fitnessGoal || ''}
                        onChange={(e) => handleInputChange('fitnessGoal', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Select a goal</option>
                        <option value="lose_weight">Lose Weight</option>
                        <option value="build_muscle">Build Muscle</option>
                        <option value="get_stronger">Get Stronger</option>
                        <option value="improve_endurance">Improve Endurance</option>
                        <option value="stay_healthy">Stay Healthy</option>
                        <option value="compete">Compete</option>
                      </select>
                    ) : (
                      <p className="text-gray-400 py-2 capitalize">
                        {profile.fitnessGoal?.replace('_', ' ') || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Experience Level
                    </label>
                    {editing ? (
                      <select
                        value={profile.experienceLevel || ''}
                        onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Select level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    ) : (
                      <p className="text-gray-400 py-2 capitalize">
                        {profile.experienceLevel || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                {editing ? (
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-400 py-2">{profile.bio || 'No bio yet'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}