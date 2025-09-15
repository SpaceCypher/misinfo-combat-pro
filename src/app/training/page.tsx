'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Brain, 
  Target, 
  Trophy, 
  Play, 
  Lock, 
  CheckCircle, 
  Star,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Clock,
  Zap,
  Eye,
  BarChart3,
  AlertTriangle,
  Camera,
  DollarSign,
  Globe
} from 'lucide-react';
import { useAuth } from '@/lib/simple-auth-context';
import ProtectedRoute from '@/components/protected-route';
import { TrainingDatabase, UserProgress as DBUserProgress } from '@/lib/training-db';

interface UserProgress {
  userId: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  completedModules: string[];
  currentScore: number;
  achievements: string[];
  totalTime: number;
  streakDays: number;
  lastActive: Date;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  icon: any;
  estimatedTime: number;
  difficulty: number;
  scenarios: number;
  unlockRequirements?: string[];
  keySkills: string[];
  completionReward: {
    points: number;
    badge?: string;
  };
}

const trainingModules: TrainingModule[] = [
  // Beginner Level
  {
    id: 'basic-fact-checking',
    title: 'Basic Fact-Checking Fundamentals',
    description: 'Learn the essential principles of verifying information and identifying reliable sources.',
    level: 'beginner',
    icon: CheckCircle,
    estimatedTime: 15,
    difficulty: 1,
    scenarios: 3,
    keySkills: ['Source verification', 'Primary vs secondary sources', 'Citation analysis', 'Basic red flags'],
    completionReward: { points: 100, badge: 'Fact Checker' }
  },
  {
    id: 'source-evaluation',
    title: 'Source Evaluation Basics',
    description: 'Master the fundamentals of assessing source credibility and reliability.',
    level: 'beginner',
    icon: Eye,
    estimatedTime: 20,
    difficulty: 2,
    scenarios: 2,
    keySkills: ['Domain analysis', 'Author credibility', 'Publication standards', 'Bias identification'],
    completionReward: { points: 120, badge: 'Source Detective' }
  },
  {
    id: 'emotional-manipulation',
    title: 'Emotional Manipulation Recognition',
    description: 'Identify emotional appeals and psychological manipulation techniques in content.',
    level: 'beginner',
    icon: Brain,
    estimatedTime: 18,
    difficulty: 2,
    scenarios: 2,
    keySkills: ['Fear appeals', 'Urgency tactics', 'Confirmation bias', 'Emotional language'],
    completionReward: { points: 150, badge: 'Mind Guardian' }
  },
  // Intermediate Level
  {
    id: 'statistical-misinformation',
    title: 'Statistical Misinformation Detection',
    description: 'Learn to identify misleading statistics, graphs, and data manipulation.',
    level: 'intermediate',
    icon: BarChart3,
    estimatedTime: 25,
    difficulty: 3,
    scenarios: 2,
    unlockRequirements: ['basic-fact-checking', 'source-evaluation'],
    keySkills: ['Graph analysis', 'Correlation vs causation', 'Sample size evaluation', 'Statistical significance'],
    completionReward: { points: 200, badge: 'Data Analyst' }
  },
  {
    id: 'visual-manipulation',
    title: 'Visual Manipulation Identification',
    description: 'Detect image and video manipulation, deepfakes, and visual misinformation.',
    level: 'intermediate',
    icon: Camera,
    estimatedTime: 30,
    difficulty: 4,
    scenarios: 2,
    unlockRequirements: ['emotional-manipulation'],
    keySkills: ['Photo forensics', 'Deepfake detection', 'Context verification', 'Reverse image search'],
    completionReward: { points: 250, badge: 'Visual Investigator' }
  },
  {
    id: 'context-manipulation',
    title: 'Context Manipulation Analysis',
    description: 'Understand how real information can be manipulated through misleading context.',
    level: 'intermediate',
    icon: Globe,
    estimatedTime: 22,
    difficulty: 3,
    scenarios: 1,
    unlockRequirements: ['source-evaluation'],
    keySkills: ['Temporal context', 'Geographic context', 'Selective editing', 'Cherry picking'],
    completionReward: { points: 180, badge: 'Context Master' }
  },
  // Advanced Level
  {
    id: 'deepfake-detection',
    title: 'Sophisticated Deepfake Detection',
    description: 'Advanced techniques for identifying high-quality deepfakes and AI-generated content.',
    level: 'advanced',
    icon: Zap,
    estimatedTime: 35,
    difficulty: 5,
    scenarios: 1,
    unlockRequirements: ['visual-manipulation', 'statistical-misinformation'],
    keySkills: ['AI artifact detection', 'Facial inconsistencies', 'Audio-visual sync', 'Technical forensics'],
    completionReward: { points: 300, badge: 'Deepfake Hunter' }
  },
  {
    id: 'coordinated-campaigns',
    title: 'Coordinated Campaign Recognition',
    description: 'Identify systematic misinformation campaigns and organized manipulation efforts.',
    level: 'advanced',
    icon: Users,
    estimatedTime: 40,
    difficulty: 5,
    scenarios: 1,
    unlockRequirements: ['context-manipulation', 'emotional-manipulation'],
    keySkills: ['Network analysis', 'Bot detection', 'Coordinated behavior', 'Campaign patterns'],
    completionReward: { points: 350, badge: 'Campaign Analyst' }
  },
  {
    id: 'financial-scams',
    title: 'Financial Scam Pattern Analysis',
    description: 'Detect sophisticated financial misinformation and investment scams.',
    level: 'advanced',
    icon: DollarSign,
    estimatedTime: 30,
    difficulty: 4,
    scenarios: 1,
    unlockRequirements: ['statistical-misinformation', 'source-evaluation'],
    keySkills: ['Investment fraud', 'Ponzi schemes', 'Market manipulation', 'Regulatory compliance'],
    completionReward: { points: 280, badge: 'Financial Guardian' }
  }
];

const achievements = [
  { id: 'first-module', name: 'Getting Started', description: 'Complete your first training module', icon: Play },
  { id: 'level-up', name: 'Level Up', description: 'Advance to the next difficulty level', icon: TrendingUp },
  { id: 'perfect-score', name: 'Perfectionist', description: 'Score 100% on any module', icon: Star },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Complete a module in under 10 minutes', icon: Zap },
  { id: 'week-streak', name: 'Dedicated Learner', description: 'Train for 7 days in a row', icon: Trophy },
  { id: 'all-beginner', name: 'Foundation Master', description: 'Complete all beginner modules', icon: Shield },
  { id: 'all-intermediate', name: 'Skill Builder', description: 'Complete all intermediate modules', icon: Target },
  { id: 'all-advanced', name: 'Expert Detective', description: 'Complete all advanced modules', icon: Award }
];

function TrainingContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProgress();
  }, [user]);

  // Refresh progress when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      if (user?.uid) {
        loadUserProgress();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // Refresh progress when URL changes (for forced refresh)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh') && user?.uid) {
      loadUserProgress();
    }
  }, [user]);

  const loadUserProgress = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    try {
      let progress = await TrainingDatabase.getUserProgress(user.uid);
      
      if (!progress) {
        // Initialize new user progress
        progress = await TrainingDatabase.initializeUserProgress(user.uid);
      }
      
      console.log('Loaded user progress:', progress); // Debug log
      setUserProgress(progress);
    } catch (error) {
      console.error('Error loading user progress:', error);
      // Fallback to localStorage for backwards compatibility
      try {
        const saved = localStorage.getItem(`training_progress_${user?.uid}`);
        if (saved) {
          const localProgress = JSON.parse(saved);
          setUserProgress({
            ...localProgress,
            lastActive: new Date(localProgress.lastActive)
          });
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  const isModuleUnlocked = (module: TrainingModule): boolean => {
    if (!module.unlockRequirements || !userProgress) return true;
    return module.unlockRequirements.every(req => 
      userProgress.completedModules.includes(req)
    );
  };

  const getModuleProgress = (moduleId: string): number => {
    if (!userProgress) return 0;
    return userProgress.completedModules.includes(moduleId) ? 100 : 0;
  };

  const startModule = (moduleId: string) => {
    router.push(`/training/module/${moduleId}`);
  };

  const getLevelModules = (level: 'beginner' | 'intermediate' | 'advanced') => {
    return trainingModules.filter(module => module.level === level);
  };

  const getLevelProgress = (level: 'beginner' | 'intermediate' | 'advanced') => {
    if (!userProgress) return 0;
    const levelModules = getLevelModules(level);
    const completed = levelModules.filter(module => 
      userProgress.completedModules.includes(module.id)
    ).length;
    return Math.round((completed / levelModules.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your training progress...</p>
        </div>
      </div>
    );
  }

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
                <Shield className="w-5 h-5 mr-2" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Training Hub</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {userProgress?.currentScore || 0} Points
                </div>
                <div className="text-xs text-gray-600 capitalize">
                  {userProgress?.skillLevel || 'Beginner'} Level
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userProgress?.achievements.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome to Interactive Training, {user?.displayName?.split(' ')[0] || 'Detective'}!
              </h1>
              <p className="text-blue-100 text-lg">
                Master misinformation detection through hands-on practice with AI-generated scenarios
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">🔰 Beginner</h3>
              <span className="text-sm text-gray-600">{getLevelProgress('beginner')}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getLevelProgress('beginner')}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {getLevelModules('beginner').filter(m => userProgress?.completedModules.includes(m.id)).length} of {getLevelModules('beginner').length} completed
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">🎯 Intermediate</h3>
              <span className="text-sm text-gray-600">{getLevelProgress('intermediate')}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getLevelProgress('intermediate')}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {getLevelModules('intermediate').filter(m => userProgress?.completedModules.includes(m.id)).length} of {getLevelModules('intermediate').length} completed
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">🏆 Advanced</h3>
              <span className="text-sm text-gray-600">{getLevelProgress('advanced')}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getLevelProgress('advanced')}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {getLevelModules('advanced').filter(m => userProgress?.completedModules.includes(m.id)).length} of {getLevelModules('advanced').length} completed
            </p>
          </div>
        </div>

        {/* Training Modules by Level */}
        {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
          <div key={level} className="mb-12">
            <div className="flex items-center mb-6">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 ${
                level === 'beginner' ? 'bg-green-100' :
                level === 'intermediate' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                {level === 'beginner' ? <Shield className="w-5 h-5 text-green-600" /> :
                 level === 'intermediate' ? <Target className="w-5 h-5 text-yellow-600" /> :
                 <Trophy className="w-5 h-5 text-red-600" />}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {level} Level Training
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getLevelModules(level).map((module) => {
                const isUnlocked = isModuleUnlocked(module);
                const isCompleted = getModuleProgress(module.id) === 100;
                const IconComponent = module.icon;

                return (
                  <div 
                    key={module.id}
                    className={`bg-white rounded-xl border-2 p-6 transition-all duration-200 ${
                      isUnlocked 
                        ? 'border-gray-200 hover:border-blue-300 hover:shadow-lg cursor-pointer' 
                        : 'border-gray-200 opacity-60 cursor-not-allowed'
                    } ${isCompleted ? 'ring-2 ring-green-200 bg-green-50' : ''}`}
                    onClick={() => isUnlocked && startModule(module.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isCompleted ? 'bg-green-100' : 
                        isUnlocked ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : isUnlocked ? (
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Lock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(module.difficulty)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {module.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {module.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {module.estimatedTime} min
                        </span>
                        <span className="flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          {module.scenarios} scenarios
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {module.keySkills.slice(0, 2).map((skill) => (
                          <span key={skill} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                        {module.keySkills.length > 2 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            +{module.keySkills.length - 2}
                          </span>
                        )}
                      </div>

                      {!isUnlocked && module.unlockRequirements && (
                        <div className="text-xs text-gray-500 mt-2">
                          Requires: {module.unlockRequirements.map(req => 
                            trainingModules.find(m => m.id === req)?.title
                          ).join(', ')}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Award className="w-4 h-4 mr-1" />
                          {module.completionReward.points} pts
                        </div>
                        <div className="flex items-center">
                          {isCompleted ? (
                            <span className="text-green-600 text-sm font-medium">Completed</span>
                          ) : isUnlocked ? (
                            <ArrowRight className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Achievements Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
            Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement) => {
              const isEarned = userProgress?.achievements.includes(achievement.id);
              const IconComponent = achievement.icon;
              
              return (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isEarned 
                      ? 'border-yellow-300 bg-yellow-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    isEarned ? 'bg-yellow-200' : 'bg-gray-200'
                  }`}>
                    <IconComponent className={`w-4 h-4 ${
                      isEarned ? 'text-yellow-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <h4 className={`font-medium text-sm ${
                    isEarned ? 'text-yellow-900' : 'text-gray-600'
                  }`}>
                    {achievement.name}
                  </h4>
                  <p className={`text-xs mt-1 ${
                    isEarned ? 'text-yellow-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TrainingPage() {
  return (
    <ProtectedRoute>
      <TrainingContent />
    </ProtectedRoute>
  );
}