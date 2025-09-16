'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Brain, 
  Shield, 
  Award, 
  Crown,
  Medal,
  Gem,
  Lock,
  Calendar,
  BarChart3,
  CheckCircle,
  Play,
  Eye,
  Users,
  TrendingUp,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { useAuth } from '@/lib/simple-auth-context';
import ProtectedRoute from '@/components/protected-route';
import { TrainingDatabase, Achievement as AchievementType, UserProfile } from '@/lib/training-db';

// Comprehensive achievement definitions
const ACHIEVEMENT_CATALOG = {
  // Training Achievements
  training: [
    {
      id: 'first-module',
      name: 'Getting Started',
      description: 'Complete your first training module',
      category: 'training' as const,
      points: 50,
      icon: Play,
      rarity: 'common' as const
    },
    {
      id: 'perfect-score',
      name: 'Perfectionist',
      description: 'Score 100% on any training module',
      category: 'training' as const,
      points: 100,
      icon: Star,
      rarity: 'rare' as const
    },
    {
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Complete a module in under 10 minutes',
      category: 'training' as const,
      points: 75,
      icon: Zap,
      rarity: 'rare' as const
    },
    {
      id: 'flawless-victory',
      name: 'Flawless Victory',
      description: 'Complete a module without any mistakes',
      category: 'training' as const,
      points: 100,
      icon: Trophy,
      rarity: 'epic' as const
    },
    {
      id: 'training-master',
      name: 'Training Master',
      description: 'Complete all beginner training modules',
      category: 'training' as const,
      points: 200,
      icon: Medal,
      rarity: 'epic' as const
    },
    {
      id: 'advanced-scholar',
      name: 'Advanced Scholar',
      description: 'Complete all advanced training modules',
      category: 'training' as const,
      points: 500,
      icon: Crown,
      rarity: 'legendary' as const
    }
  ],

  // Analyzer Achievements
  analyzer: [
    {
      id: 'first-analysis',
      name: 'First Analysis',
      description: 'Complete your first content analysis',
      category: 'analyzer' as const,
      points: 25,
      icon: Eye,
      rarity: 'common' as const
    },
    {
      id: 'keen-eye',
      name: 'Keen Eye',
      description: 'Analyze 10 pieces of content',
      category: 'analyzer' as const,
      points: 100,
      icon: Target,
      rarity: 'rare' as const
    },
    {
      id: 'truth-seeker',
      name: 'Truth Seeker',
      description: 'Analyze 50 pieces of content',
      category: 'analyzer' as const,
      points: 250,
      icon: Brain,
      rarity: 'epic' as const
    },
    {
      id: 'analysis-expert',
      name: 'Analysis Expert',
      description: 'Analyze 100 pieces of content',
      category: 'analyzer' as const,
      points: 500,
      icon: Gem,
      rarity: 'legendary' as const
    }
  ],

  // Verifier Achievements
  verifier: [
    {
      id: 'first-verification',
      name: 'First Verification',
      description: 'Complete your first fact verification',
      category: 'verifier' as const,
      points: 25,
      icon: Shield,
      rarity: 'common' as const
    },
    {
      id: 'fact-checker',
      name: 'Fact Checker',
      description: 'Verify 10 claims or statements',
      category: 'verifier' as const,
      points: 100,
      icon: CheckCircle,
      rarity: 'rare' as const
    },
    {
      id: 'truth-guardian',
      name: 'Truth Guardian',
      description: 'Verify 50 claims or statements',
      category: 'verifier' as const,
      points: 250,
      icon: Shield,
      rarity: 'epic' as const
    },
    {
      id: 'verification-master',
      name: 'Verification Master',
      description: 'Verify 100 claims or statements',
      category: 'verifier' as const,
      points: 500,
      icon: Crown,
      rarity: 'legendary' as const
    }
  ],

  // General Achievements
  general: [
    {
      id: 'level-up-5',
      name: 'Rising Star',
      description: 'Reach level 5',
      category: 'general' as const,
      points: 100,
      icon: TrendingUp,
      rarity: 'rare' as const
    },
    {
      id: 'level-up-10',
      name: 'Expert Fighter',
      description: 'Reach level 10',
      category: 'general' as const,
      points: 250,
      icon: Medal,
      rarity: 'epic' as const
    },
    {
      id: 'level-up-20',
      name: 'Misinformation Slayer',
      description: 'Reach level 20',
      category: 'general' as const,
      points: 500,
      icon: Crown,
      rarity: 'legendary' as const
    },
    {
      id: 'points-milestone-1000',
      name: 'Point Collector',
      description: 'Earn 1,000 total points',
      category: 'general' as const,
      points: 100,
      icon: Award,
      rarity: 'rare' as const
    },
    {
      id: 'points-milestone-5000',
      name: 'Point Master',
      description: 'Earn 5,000 total points',
      category: 'general' as const,
      points: 250,
      icon: Gem,
      rarity: 'epic' as const
    },
    {
      id: 'streak-week',
      name: 'Consistent Learner',
      description: 'Maintain a 7-day learning streak',
      category: 'general' as const,
      points: 150,
      icon: Calendar,
      rarity: 'rare' as const
    },
    {
      id: 'community-contributor',
      name: 'Community Contributor',
      description: 'Share achievements and progress',
      category: 'general' as const,
      points: 75,
      icon: Users,
      rarity: 'common' as const
    }
  ]
};

// Get all achievements as a flat array
const getAllAchievements = () => {
  return [
    ...ACHIEVEMENT_CATALOG.training,
    ...ACHIEVEMENT_CATALOG.analyzer,
    ...ACHIEVEMENT_CATALOG.verifier,
    ...ACHIEVEMENT_CATALOG.general
  ];
};

// Helper function to get rarity color
const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'text-gray-600 bg-gray-100';
    case 'rare': return 'text-blue-600 bg-blue-100';
    case 'epic': return 'text-purple-600 bg-purple-100';
    case 'legendary': return 'text-yellow-600 bg-yellow-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

// Helper function to get rarity border
const getRarityBorder = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'border-gray-300';
    case 'rare': return 'border-blue-300';
    case 'epic': return 'border-purple-300';
    case 'legendary': return 'border-yellow-300 shadow-lg';
    default: return 'border-gray-300';
  }
};

function AchievementsContent() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  useEffect(() => {
    if (user?.uid) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const profile = await TrainingDatabase.getUserFullProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  // Get user's unlocked achievements
  const userAchievements = userProfile?.achievements || [];
  const allAchievements = getAllAchievements();
  
  // For UserProfile, achievements are already full objects
  const unlockedAchievements = userAchievements;
  
  // Filter achievements based on category and rarity
  const filteredAchievements = allAchievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  // Calculate statistics
  const totalAchievements = allAchievements.length;
  const unlockedCount = unlockedAchievements.length;
  const unlockedPercentage = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;
  const totalPointsFromAchievements = unlockedAchievements.reduce((sum, userAch) => {
    return sum + (userAch.points || 0);
  }, 0);

  // Group achievements by rarity for stats
  const rarityStats = {
    common: unlockedAchievements.filter(ua => ua.rarity === 'common').length,
    rare: unlockedAchievements.filter(ua => ua.rarity === 'rare').length,
    epic: unlockedAchievements.filter(ua => ua.rarity === 'epic').length,
    legendary: unlockedAchievements.filter(ua => ua.rarity === 'legendary').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <h1 className="text-xl font-semibold text-gray-900">Achievements</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {unlockedCount}/{totalAchievements}
                </div>
                <div className="text-xs text-gray-600">
                  {unlockedPercentage}% Complete
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Achievements</p>
                <p className="text-2xl font-bold text-gray-900">{unlockedCount}</p>
                <p className="text-xs text-gray-500">of {totalAchievements}</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${unlockedPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Achievement Points</p>
                <p className="text-2xl font-bold text-gray-900">{totalPointsFromAchievements}</p>
                <p className="text-xs text-gray-500">from achievements</p>
              </div>
              <Star className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rarest Achievement</p>
                <p className="text-lg font-bold text-gray-900">
                  {rarityStats.legendary > 0 ? 'Legendary' : 
                   rarityStats.epic > 0 ? 'Epic' : 
                   rarityStats.rare > 0 ? 'Rare' : 
                   rarityStats.common > 0 ? 'Common' : 'None'}
                </p>
                <p className="text-xs text-gray-500">highest rarity unlocked</p>
              </div>
              <Crown className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-lg font-bold text-gray-900">
                  {userAchievements.length > 0 ? 'Active' : 'Getting Started'}
                </p>
                <p className="text-xs text-gray-500">
                  {unlockedAchievements.length > 0 
                    ? `Last: ${new Date(unlockedAchievements[unlockedAchievements.length - 1]?.unlockedAt || new Date()).toLocaleDateString()}`
                    : 'Start earning achievements!'
                  }
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="training">Training</option>
                <option value="analyzer">Analyzer</option>
                <option value="verifier">Verifier</option>
                <option value="general">General</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rarity</label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const isUnlocked = unlockedAchievements.some(ua => ua.id === achievement.id);
            const userAchievement = unlockedAchievements.find(ua => ua.id === achievement.id);
            const IconComponent = achievement.icon;

            return (
              <div
                key={achievement.id}
                className={`bg-white rounded-xl border-2 p-6 transition-all duration-200 ${
                  isUnlocked 
                    ? `${getRarityBorder(achievement.rarity)} hover:shadow-lg` 
                    : 'border-gray-200 hover:border-gray-300 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    isUnlocked 
                      ? getRarityColor(achievement.rarity)
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isUnlocked ? (
                      <IconComponent className="w-6 h-6" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getRarityColor(achievement.rarity)
                    }`}>
                      {achievement.rarity}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      {achievement.points}pts
                    </span>
                  </div>
                </div>

                <h3 className={`text-lg font-semibold mb-2 ${
                  isUnlocked ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {achievement.name}
                </h3>
                
                <p className={`text-sm mb-4 ${
                  isUnlocked ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {achievement.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    achievement.category === 'training' ? 'bg-blue-100 text-blue-600' :
                    achievement.category === 'analyzer' ? 'bg-green-100 text-green-600' :
                    achievement.category === 'verifier' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {achievement.category}
                  </span>
                  
                  {isUnlocked && userAchievement && (
                    <span className="text-xs text-gray-500">
                      {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more achievements.</p>
          </div>
        )}

        {/* Progress Encouragement */}
        {unlockedCount < totalAchievements && (
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-8 text-center">
            <Trophy className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Keep Going!
            </h3>
            <p className="text-gray-600 mb-4">
              You have {totalAchievements - unlockedCount} more achievements to unlock. 
              Continue training, analyzing, and verifying to earn more badges!
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/training"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Continue Training
              </Link>
              <Link
                href="/analyzer"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Analyze Content
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <ProtectedRoute>
      <AchievementsContent />
    </ProtectedRoute>
  );
}