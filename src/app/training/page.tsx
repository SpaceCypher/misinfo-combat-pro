'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Play, Trophy, Target, Clock, Star } from 'lucide-react';
import { useAuth } from '@/lib/simple-auth-context';

export default function Training() {
  const { user, logout } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.photoURL]);
  
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const trainingModules = {
    beginner: [
      {
        id: 'basic-fact-checking',
        title: 'Basic Fact-Checking',
        description: 'Learn fundamental techniques to verify information sources',
        duration: '15 min',
        completed: false,
        score: null
      },
      {
        id: 'source-evaluation',
        title: 'Source Evaluation',
        description: 'Understand how to assess the credibility of information sources',
        duration: '20 min',
        completed: false,
        score: null
      },
      {
        id: 'emotional-manipulation',
        title: 'Emotional Manipulation',
        description: 'Identify fear-based language and emotional triggers in content',
        duration: '18 min',
        completed: false,
        score: null
      }
    ],
    intermediate: [
      {
        id: 'statistical-misinformation',
        title: 'Statistical Misinformation',
        description: 'Spot misleading graphs, false correlations, and data manipulation',
        duration: '25 min',
        completed: false,
        score: null
      },
      {
        id: 'visual-manipulation',
        title: 'Visual Manipulation',
        description: 'Detect photo editing, context manipulation, and visual tricks',
        duration: '30 min',
        completed: false,
        score: null
      },
      {
        id: 'context-manipulation',
        title: 'Context Manipulation',
        description: 'Identify when real content is used in misleading contexts',
        duration: '22 min',
        completed: false,
        score: null
      }
    ],
    advanced: [
      {
        id: 'sophisticated-deepfakes',
        title: 'Sophisticated Deepfakes',
        description: 'Advanced techniques to identify AI-generated content',
        duration: '35 min',
        completed: false,
        score: null
      },
      {
        id: 'coordinated-campaigns',
        title: 'Coordinated Campaigns',
        description: 'Recognize patterns in organized misinformation campaigns',
        duration: '40 min',
        completed: false,
        score: null
      },
      {
        id: 'financial-scams',
        title: 'Financial Scams',
        description: 'Identify investment fraud and financial misinformation',
        duration: '28 min',
        completed: false,
        score: null
      }
    ]
  };

  const startModule = (moduleId: string) => {
    // TODO: Implement module start logic
    console.log(`Starting module: ${moduleId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">MisInfo Combat Pro</h1>
            </div>

            {/* Center - Navigation */}
            <nav className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/training"
                className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
                aria-current="page"
              >
                Training
              </Link>
              <Link
                href="/analyzer"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Analyze
              </Link>
              <Link
                href="/verifier"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Verify
              </Link>
            </nav>

            {/* Right side - Profile */}
            <div className="relative">
              <div 
                className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                onMouseEnter={() => setShowProfileDropdown(true)}
                onMouseLeave={() => setShowProfileDropdown(false)}
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">Level 3</span>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user?.photoURL && !imageError ? (
                    <img 
                      src={`/api/proxy-image?url=${encodeURIComponent(user.photoURL)}`}
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Training: Proxy image failed, trying direct URL:', user?.photoURL);
                        e.currentTarget.src = user?.photoURL || '';
                        e.currentTarget.onerror = () => {
                          console.log('Training: Direct URL also failed');
                          setImageError(true);
                        };
                      }}
                      onLoad={() => console.log('Training: Image loaded successfully via proxy')}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.displayName ? 
                          user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : 
                          user?.email?.[0]?.toUpperCase() || 'U'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div 
                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  onMouseEnter={() => setShowProfileDropdown(true)}
                  onMouseLeave={() => setShowProfileDropdown(false)}
                >
                  <Link 
                    href="/profile" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mr-3"></div>
                    Profile
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        await logout();
                        window.location.href = '/';
                      } catch (error) {
                        console.error('Error signing out:', error);
                      }
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-4 h-4 rounded-full bg-gray-400 mr-3"></div>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Master Misinformation Detection
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Practice identifying manipulation techniques through AI-generated scenarios. Build your skills progressively with gamified training modules.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <div className="text-gray-600">Modules Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
              <div className="text-gray-600">Total Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-gray-600">Achievements</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">Beginner</div>
              <div className="text-gray-600">Current Level</div>
            </div>
          </div>
        </div>

        {/* Level Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedLevel('beginner')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                selectedLevel === 'beginner'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Beginner Level
            </button>
            <button
              onClick={() => setSelectedLevel('intermediate')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                selectedLevel === 'intermediate'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Intermediate Level
            </button>
            <button
              onClick={() => setSelectedLevel('advanced')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                selectedLevel === 'advanced'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Advanced Level
            </button>
          </div>
        </div>

        {/* Training Modules */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingModules[selectedLevel].map((module) => (
            <div key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedLevel === 'beginner' ? 'bg-green-100' :
                  selectedLevel === 'intermediate' ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  <Play className={`w-6 h-6 ${
                    selectedLevel === 'beginner' ? 'text-green-600' :
                    selectedLevel === 'intermediate' ? 'text-blue-600' : 'text-red-600'
                  }`} />
                </div>
                {module.completed && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-medium">{module.score}%</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">{module.title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{module.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{module.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 text-gray-300" />
                  ))}
                </div>
              </div>

              <button
                onClick={() => startModule(module.id)}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors ${
                  module.completed
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : selectedLevel === 'beginner'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : selectedLevel === 'intermediate'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {module.completed ? 'Retake Module' : 'Start Module'}
              </button>
            </div>
          ))}
        </div>

        {/* Gamification Elements */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready for a Challenge?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Complete modules to earn achievements, unlock new levels, and climb the leaderboard. 
            Every correct identification makes you stronger against misinformation!
          </p>
          <div className="flex justify-center space-x-4">
            <div className="bg-white/20 rounded-lg p-4">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm">Achievements</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <Target className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm">Accuracy</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <Star className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm">Leaderboard</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}