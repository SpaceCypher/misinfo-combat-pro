'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Clock, 
  Brain, 
  Eye, 
  Shield, 
  Trophy, 
  Calendar,
  BarChart3,
  CheckCircle,
  Star,
  Award,
  Zap,
  BookOpen,
  Activity,
  Users,
  Filter
} from 'lucide-react';
import { useAuth } from '@/lib/simple-auth-context';
import ProtectedRoute from '@/components/protected-route';
import { TrainingDatabase, UserProfile, CompletedScenario, UserAnalysisHistory, ModuleProgress, AnalysisRecord, VerificationRecord } from '@/lib/training-db';

// Type definitions for detailed stats
interface DetailedStats {
  trainingProgress: {
    totalModulesCompleted: number;
    moduleAccuracies: { moduleId: string; name: string; accuracy: number; completedAt: Date; score: number; timeSpent: number }[];
    totalTimeSpent: number;
    averageAccuracy: number;
    perfectScores: number;
    improvementTrend: number;
    weakestSkills: string[];
    strongestSkills: string[];
  };
  analyzerStats: {
    totalAnalyses: number;
    accurateAnalyses: number;
    recentActivity: { date: Date; type: string; accuracy: number }[];
    categoryBreakdown: { category: string; count: number; accuracy: number }[];
  };
  verifierStats: {
    totalVerifications: number;
    accurateVerifications: number;
    recentActivity: { date: Date; claim: string; result: string }[];
    speedMetrics: { averageTime: number; fastestTime: number; slowestTime: number };
  };
  levelingProgress: {
    currentLevel: number;
    currentXP: number;
    xpToNextLevel: number;
    levelHistory: { level: number; achievedAt: Date; totalXP: number }[];
    xpSources: { source: string; xp: number; percentage: number }[];
  };
}

// Helper functions to calculate real statistics from user data
const calculateModuleAccuracies = (
  completedScenarios: CompletedScenario[], 
  moduleProgress: Record<string, ModuleProgress>
): { moduleId: string; name: string; accuracy: number; completedAt: Date; score: number; timeSpent: number }[] => {
  const moduleStats: Record<string, { scores: number[]; times: number[]; lastCompleted: Date; totalScore: number }> = {};
  
  completedScenarios.forEach(scenario => {
    if (!moduleStats[scenario.moduleId]) {
      moduleStats[scenario.moduleId] = {
        scores: [],
        times: [],
        lastCompleted: scenario.completedAt,
        totalScore: 0
      };
    }
    
    moduleStats[scenario.moduleId].scores.push(scenario.score);
    moduleStats[scenario.moduleId].times.push(scenario.timeSpent);
    moduleStats[scenario.moduleId].totalScore += scenario.score;
    
    if (scenario.completedAt > moduleStats[scenario.moduleId].lastCompleted) {
      moduleStats[scenario.moduleId].lastCompleted = scenario.completedAt;
    }
  });
  
  return Object.entries(moduleStats).map(([moduleId, stats]) => ({
    moduleId,
    name: getModuleName(moduleId),
    accuracy: Math.round((stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length) || 0),
    completedAt: stats.lastCompleted,
    score: stats.totalScore,
    timeSpent: stats.times.reduce((a, b) => a + b, 0)
  }));
};

const getModuleName = (moduleId: string): string => {
  const moduleNames: Record<string, string> = {
    'basic-detection': 'Basic Misinformation Detection',
    'source-verification': 'Source Verification',
    'statistical-analysis': 'Statistical Analysis',
    'visual-content': 'Visual Content Analysis',
    'advanced-techniques': 'Advanced Detection Techniques'
  };
  return moduleNames[moduleId] || `Module ${moduleId}`;
};

const calculateSkillAssessment = (
  completedScenarios: CompletedScenario[], 
  moduleProgress: Record<string, ModuleProgress>
): { strongest: string[]; weakest: string[] } => {
  const skillPerformance: Record<string, number[]> = {
    'Fact Checking': [],
    'Source Evaluation': [],
    'Statistical Analysis': [],
    'Visual Analysis': [],
    'Basic Detection': []
  };
  
  // Map modules to skills and collect scores
  completedScenarios.forEach(scenario => {
    const skill = mapModuleToSkill(scenario.moduleId);
    if (skillPerformance[skill]) {
      skillPerformance[skill].push(scenario.score);
    }
  });
  
  // Calculate average performance per skill
  const skillAverages = Object.entries(skillPerformance)
    .map(([skill, scores]) => ({
      skill,
      average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    }))
    .filter(s => s.average > 0)
    .sort((a, b) => b.average - a.average);
  
  const strongest = skillAverages.slice(0, 2).map(s => s.skill);
  const weakest = skillAverages.slice(-2).map(s => s.skill);
  
  return {
    strongest: strongest.length > 0 ? strongest : ['Fact Checking', 'Basic Detection'],
    weakest: weakest.length > 0 ? weakest : ['Source Evaluation', 'Statistical Analysis']
  };
};

const mapModuleToSkill = (moduleId: string): string => {
  const moduleToSkill: Record<string, string> = {
    'basic-detection': 'Basic Detection',
    'source-verification': 'Source Evaluation',
    'statistical-analysis': 'Statistical Analysis',
    'visual-content': 'Visual Analysis',
    'advanced-techniques': 'Fact Checking'
  };
  return moduleToSkill[moduleId] || 'Basic Detection';
};

const calculateAnalyzerCategories = (analysisHistory: UserAnalysisHistory | null): { category: string; count: number; accuracy: number }[] => {
  if (!analysisHistory?.analyses || analysisHistory.analyses.length === 0) {
    return [
      { category: 'Text Analysis', count: 0, accuracy: 0 },
      { category: 'Image Verification', count: 0, accuracy: 0 },
      { category: 'Source Checking', count: 0, accuracy: 0 }
    ];
  }
  
  const categoryStats: Record<string, { total: number; accurate: number }> = {
    'Text Analysis': { total: 0, accurate: 0 },
    'Image Verification': { total: 0, accurate: 0 },
    'Source Checking': { total: 0, accurate: 0 }
  };
  
  analysisHistory.analyses.forEach(analysis => {
    // Determine category based on content or misinformation types
    let category = 'Text Analysis';
    if (analysis.misinformationTypes.some(type => type.includes('image') || type.includes('visual'))) {
      category = 'Image Verification';
    } else if (analysis.misinformationTypes.some(type => type.includes('source') || type.includes('credibility'))) {
      category = 'Source Checking';
    }
    
    categoryStats[category].total++;
    // Consider high confidence (>0.7) as accurate
    if (analysis.confidence > 0.7) {
      categoryStats[category].accurate++;
    }
  });
  
  return Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    count: stats.total,
    accuracy: stats.total > 0 ? Math.round((stats.accurate / stats.total) * 100) : 0
  }));
};

const calculateSpeedMetrics = (analysisHistory: UserAnalysisHistory | null): { averageTime: number; fastestTime: number; slowestTime: number } => {
  // Since timeSpent is not available in AnalysisRecord, we'll use simulated data based on complexity
  if (!analysisHistory?.analyses || analysisHistory.analyses.length === 0) {
    return { averageTime: 0, fastestTime: 0, slowestTime: 0 };
  }
  
  // Estimate time based on content length and complexity
  const times = analysisHistory.analyses.map(analysis => {
    const baseTime = Math.min(analysis.content.length / 10, 120); // 10 chars per second, max 2 minutes
    const complexityMultiplier = analysis.misinformationTypes.length > 2 ? 1.5 : 1;
    return Math.round(baseTime * complexityMultiplier);
  }).filter(t => t > 0);
  
  if (times.length === 0) {
    return { averageTime: 0, fastestTime: 0, slowestTime: 0 };
  }
  
  return {
    averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    fastestTime: Math.min(...times),
    slowestTime: Math.max(...times)
  };
};

const calculateImprovementTrend = (completedScenarios: CompletedScenario[]): number => {
  if (completedScenarios.length < 2) return 0;
  
  const sortedScenarios = completedScenarios.sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
  const recentScenarios = sortedScenarios.slice(-5);
  const earlierScenarios = sortedScenarios.slice(0, 5);
  
  const recentAvg = recentScenarios.reduce((sum, s) => sum + s.score, 0) / recentScenarios.length;
  const earlierAvg = earlierScenarios.reduce((sum, s) => sum + s.score, 0) / earlierScenarios.length;
  
  return Math.round(((recentAvg - earlierAvg) / earlierAvg) * 100) || 0;
};

const getRecentAnalysisActivity = (analysisHistory: UserAnalysisHistory | null): { date: Date; type: string; accuracy: number }[] => {
  if (!analysisHistory?.analyses) return [];
  
  return analysisHistory.analyses
    .slice(-10)
    .map(analysis => {
      // Determine type based on misinformation types
      let type = 'Text Analysis';
      if (analysis.misinformationTypes.some(t => t.includes('image') || t.includes('visual'))) {
        type = 'Image Verification';
      } else if (analysis.misinformationTypes.some(t => t.includes('source') || t.includes('credibility'))) {
        type = 'Source Checking';
      }
      
      return {
        date: analysis.timestamp,
        type: type,
        accuracy: Math.round(analysis.confidence * 100)
      };
    });
};

const getRecentVerificationActivity = (analysisHistory: UserAnalysisHistory | null): { date: Date; claim: string; result: string }[] => {
  if (!analysisHistory?.verifications) return [];
  
  return analysisHistory.verifications
    .slice(-10)
    .map(verification => ({
      date: verification.timestamp,
      claim: verification.content.substring(0, 50) + '...',
      result: verification.result ? 'Verified' : 'False'
    }));
};

const calculateXPSources = (profile: UserProfile): { source: string; xp: number; percentage: number }[] => {
  const trainingXP = profile.trainingStats?.pointsEarned || 0;
  const analyzerXP = profile.analyzerStats?.pointsEarned || 0;
  const verifierXP = profile.verifierStats?.pointsEarned || 0;
  const totalXP = profile.totalPoints || 1; // Avoid division by zero
  
  return [
    { 
      source: 'Training Modules', 
      xp: trainingXP, 
      percentage: Math.round((trainingXP / totalXP) * 100) 
    },
    { 
      source: 'Content Analysis', 
      xp: analyzerXP, 
      percentage: Math.round((analyzerXP / totalXP) * 100) 
    },
    { 
      source: 'Fact Verification', 
      xp: verifierXP, 
      percentage: Math.round((verifierXP / totalXP) * 100) 
    }
  ];
};

function DetailedProgressContent() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'training' | 'analyzer' | 'verifier' | 'leveling'>('training');
  const [timeFilter, setTimeFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');

  useEffect(() => {
    if (user?.uid) {
      loadDetailedProgress();
    }
  }, [user, timeFilter]);

  const loadDetailedProgress = async () => {
    if (!user?.uid) return;
    
    try {
      // Load all user data
      const [profile, completedScenarios, analysisHistory] = await Promise.all([
        TrainingDatabase.getUserFullProfile(user.uid),
        TrainingDatabase.getCompletedScenarios(user.uid),
        TrainingDatabase.getUserAnalysisHistory(user.uid)
      ]);
      
      setUserProfile(profile);

      if (!profile) return;

      // Calculate module accuracies from actual completed scenarios
      const moduleAccuracies = calculateModuleAccuracies(completedScenarios, profile.moduleProgress);
      
      // Calculate skill assessment from actual performance
      const skillAssessment = calculateSkillAssessment(completedScenarios, profile.moduleProgress);
      
      // Calculate analyzer category breakdown from actual analysis history
      const analyzerCategoryBreakdown = calculateAnalyzerCategories(analysisHistory);
      
      // Calculate accurate analyses and verifications from real data
      const accurateAnalyses = profile.analyzerStats?.accurateDetections || 0;
      const accurateVerifications = profile.verifierStats?.accurateVerifications || 0;
      
      // Calculate speed metrics from analysis history
      const speedMetrics = calculateSpeedMetrics(analysisHistory);

      // Calculate detailed statistics using real data
      const stats: DetailedStats = {
        trainingProgress: {
          totalModulesCompleted: profile.completedModules?.length || 0,
          moduleAccuracies: moduleAccuracies,
          totalTimeSpent: profile.trainingStats?.totalTimeSpent || 0,
          averageAccuracy: profile.trainingStats?.averageAccuracy || 0,
          perfectScores: profile.trainingStats?.perfectScores || 0,
          improvementTrend: calculateImprovementTrend(completedScenarios),
          weakestSkills: skillAssessment.weakest,
          strongestSkills: skillAssessment.strongest
        },
        analyzerStats: {
          totalAnalyses: profile.analyzerStats?.totalAnalyses || 0,
          accurateAnalyses: accurateAnalyses,
          recentActivity: getRecentAnalysisActivity(analysisHistory),
          categoryBreakdown: analyzerCategoryBreakdown
        },
        verifierStats: {
          totalVerifications: profile.verifierStats?.totalVerifications || 0,
          accurateVerifications: accurateVerifications,
          recentActivity: getRecentVerificationActivity(analysisHistory),
          speedMetrics: speedMetrics
        },
        levelingProgress: {
          currentLevel: profile.level || 1,
          currentXP: profile.totalPoints || 0,
          xpToNextLevel: calculateXPToNextLevel(profile.level || 1, profile.totalPoints || 0),
          levelHistory: [],
          xpSources: calculateXPSources(profile)
        }
      };

      setDetailedStats(stats);
    } catch (error) {
      console.error('Error loading detailed progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateXPToNextLevel = (currentLevel: number, currentXP: number): number => {
    const xpPerLevel = 100;
    const nextLevelXP = currentLevel * xpPerLevel;
    return Math.max(0, nextLevelXP - (currentXP % xpPerLevel));
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading detailed progress...</p>
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
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Detailed Progress</h1>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Level</p>
                <p className="text-2xl font-bold text-gray-900">{userProfile?.level || 1}</p>
                <p className="text-xs text-gray-500">
                  {detailedStats?.levelingProgress.currentXP || 0} XP / {detailedStats?.levelingProgress.xpToNextLevel || 100} to next
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((detailedStats?.levelingProgress.currentXP || 0) / ((detailedStats?.levelingProgress.currentXP || 0) + (detailedStats?.levelingProgress.xpToNextLevel || 100))) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{userProfile?.totalPoints || 0}</p>
                <p className="text-xs text-gray-500">across all activities</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(userProfile?.trainingStats?.averageAccuracy || 0)}%
                </p>
                <p className="text-xs text-gray-500">training modules</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Invested</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(userProfile?.trainingStats?.totalTimeSpent || 0)}
                </p>
                <p className="text-xs text-gray-500">learning time</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'training', label: 'Training Progress', icon: Brain },
                { id: 'analyzer', label: 'Analysis Activity', icon: Eye },
                { id: 'verifier', label: 'Verification Stats', icon: Shield },
                { id: 'leveling', label: 'Level & XP', icon: Trophy }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Training Progress Tab */}
            {activeTab === 'training' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Completion</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Modules Completed</span>
                        <span className="font-semibold text-black ">{detailedStats?.trainingProgress.totalModulesCompleted || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Perfect Scores</span>
                        <span className="font-semibold text-black">{detailedStats?.trainingProgress.perfectScores || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Study Time</span>
                        <span className="font-semibold text-black">{formatTime(detailedStats?.trainingProgress.totalTimeSpent || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Assessment</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Strongest Skills</h4>
                        <div className="space-y-1">
                          {detailedStats?.trainingProgress.strongestSkills.map((skill, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-600">{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Areas for Improvement</h4>
                        <div className="space-y-1">
                          {detailedStats?.trainingProgress.weakestSkills.map((skill, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Target className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-gray-600">{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Training Activity</h3>
                  {detailedStats?.trainingProgress.moduleAccuracies && detailedStats.trainingProgress.moduleAccuracies.length > 0 ? (
                    <div className="space-y-3">
                      {detailedStats.trainingProgress.moduleAccuracies.map((module, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900">{module.name}</h4>
                            <span className="text-sm text-gray-500">
                              {module.completedAt.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600">
                                Score: <span className="font-medium text-black">{module.score}</span>
                              </span>
                              <span className="text-sm text-gray-600">
                                Accuracy: <span className="font-medium text-black">{module.accuracy}%</span>
                              </span>
                              <span className="text-sm text-gray-600">
                                Time: <span className="font-medium text-black">{formatTime(module.timeSpent)}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>Complete more training modules to see detailed activity here</p>
                      <Link href="/training" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                        Continue Training →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analyzer Stats Tab */}
            {activeTab === 'analyzer' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Overview</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Analyses</span>
                        <span className="font-semibold text-black">{detailedStats?.analyzerStats.totalAnalyses || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Accurate Analyses</span>
                        <span className="font-semibold text-black">{detailedStats?.analyzerStats.accurateAnalyses || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="font-semibold text-black">
                          {detailedStats?.analyzerStats.totalAnalyses ? 
                            Math.round((detailedStats.analyzerStats.accurateAnalyses / detailedStats.analyzerStats.totalAnalyses) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                    <div className="space-y-3">
                      {detailedStats?.analyzerStats.categoryBreakdown.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{category.category}</span>
                            <span className="font-medium text-black" >{category.count} analyses</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${category.accuracy}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">{category.accuracy}% accuracy</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analysis Activity</h3>
                  {detailedStats?.analyzerStats.recentActivity && detailedStats.analyzerStats.recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {detailedStats.analyzerStats.recentActivity.map((activity, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600">{activity.type}</span>
                              <span className="text-sm text-gray-600">
                                Confidence: <span className="font-medium text-black">{activity.accuracy}%</span>
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {activity.date.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Eye className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>Start analyzing content to build your verification skills</p>
                      <Link href="/analyzer" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                        Try Content Analyzer →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verifier Stats Tab */}
            {activeTab === 'verifier' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Overview</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Verifications</span>
                        <span className="font-semibold text-black">{detailedStats?.verifierStats.totalVerifications || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Accurate Verifications</span>
                        <span className="font-semibold text-black">{detailedStats?.verifierStats.accurateVerifications || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 ">Success Rate</span>
                        <span className="font-semibold text-black">
                          {detailedStats?.verifierStats.totalVerifications ? 
                            Math.round((detailedStats.verifierStats.accurateVerifications / detailedStats.verifierStats.totalVerifications) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Speed Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average Time</span>
                        <span className="font-semibold text-black">{detailedStats?.verifierStats.speedMetrics.averageTime || 0}s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fastest Verification</span>
                        <span className="font-semibold text-green-600">{detailedStats?.verifierStats.speedMetrics.fastestTime || 0}s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Slowest Verification</span>
                        <span className="font-semibold text-orange-600">{detailedStats?.verifierStats.speedMetrics.slowestTime || 0}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Verification Activity</h3>
                  {detailedStats?.verifierStats.recentActivity && detailedStats.verifierStats.recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {detailedStats.verifierStats.recentActivity.map((activity, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 mb-1">{activity.claim}</p>
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                activity.result === 'Verified' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {activity.result}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 ml-4">
                              {activity.date.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>Begin verifying claims to track your fact-checking progress</p>
                      <Link href="/verifier" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                        Try Claim Verifier →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Leveling Tab */}
            {activeTab === 'leveling' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">XP Sources</h3>
                    <div className="space-y-4">
                      {detailedStats?.levelingProgress.xpSources.map((source, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{source.source}</span>
                            <span className="font-medium">{source.xp} XP</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${source.percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">{source.percentage}% of total XP</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Level Progress</h3>
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-200"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - ((detailedStats?.levelingProgress.currentXP || 0) / ((detailedStats?.levelingProgress.currentXP || 0) + (detailedStats?.levelingProgress.xpToNextLevel || 100))))}`}
                            className="text-blue-600"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{userProfile?.level || 1}</div>
                            <div className="text-xs text-gray-500">Level</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {detailedStats?.levelingProgress.xpToNextLevel || 0} XP to Level {(userProfile?.level || 1) + 1}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Keep Earning XP</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/training" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                      <Brain className="w-8 h-8 text-blue-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Training Modules</h4>
                      <p className="text-sm text-gray-600">Earn 10-50 XP per module</p>
                    </Link>
                    <Link href="/analyzer" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                      <Eye className="w-8 h-8 text-green-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Content Analysis</h4>
                      <p className="text-sm text-gray-600">Earn 5-25 XP per analysis</p>
                    </Link>
                    <Link href="/verifier" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                      <Shield className="w-8 h-8 text-purple-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Fact Verification</h4>
                      <p className="text-sm text-gray-600">Earn 5-30 XP per verification</p>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DetailedProgressPage() {
  return (
    <ProtectedRoute>
      <DetailedProgressContent />
    </ProtectedRoute>
  );
}