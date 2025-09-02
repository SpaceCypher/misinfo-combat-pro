'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Play, Trophy, Target, Clock, Star } from 'lucide-react';

export default function Training() {
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
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Interactive Trainer</span>
              </div>
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