'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, 
  Star, 
  Clock, 
  Target, 
  Award, 
  TrendingUp,
  Share2,
  Download,
  Brain,
  CheckCircle,
  Zap,
  Users,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useAuth } from '@/lib/simple-auth-context';
import ProtectedRoute from '@/components/protected-route';

interface CompletionStats {
  score: number;
  accuracy: number;
  timeSpent: number;
  moduleId: string;
  achievements: string[];
  rank: string;
}

const moduleData = {
  'basic-fact-checking': {
    title: 'Basic Fact-Checking Fundamentals',
    badge: 'Fact Checker',
    nextModule: 'source-evaluation',
    description: 'You\'ve mastered the fundamentals of information verification!'
  },
  'source-evaluation': {
    title: 'Source Evaluation Basics',
    badge: 'Source Detective',
    nextModule: 'emotional-manipulation',
    description: 'You can now assess source credibility like a pro!'
  },
  'emotional-manipulation': {
    title: 'Emotional Manipulation Recognition',
    badge: 'Mind Guardian',
    nextModule: 'statistical-misinformation',
    description: 'You\'re immune to emotional manipulation techniques!'
  },
  'statistical-misinformation': {
    title: 'Statistical Misinformation Detection',
    badge: 'Data Analyst',
    nextModule: 'visual-manipulation',
    description: 'You can spot misleading statistics from miles away!'
  },
  'visual-manipulation': {
    title: 'Visual Manipulation Identification',
    badge: 'Visual Investigator',
    nextModule: 'context-manipulation',
    description: 'You\'re a master at detecting visual deception!'
  },
  'context-manipulation': {
    title: 'Context Manipulation Analysis',
    badge: 'Context Master',
    nextModule: 'deepfake-detection',
    description: 'You understand how context can mislead!'
  },
  'deepfake-detection': {
    title: 'Sophisticated Deepfake Detection',
    badge: 'Deepfake Hunter',
    nextModule: 'coordinated-campaigns',
    description: 'You can identify even the most sophisticated AI-generated content!'
  },
  'coordinated-campaigns': {
    title: 'Coordinated Campaign Recognition',
    badge: 'Campaign Analyst',
    nextModule: 'financial-scams',
    description: 'You can spot organized misinformation campaigns!'
  },
  'financial-scams': {
    title: 'Financial Scam Pattern Analysis',
    badge: 'Financial Guardian',
    nextModule: null,
    description: 'You\'re protected against financial misinformation!'
  }
};

const achievementsList = [
  { id: 'first-module', name: 'Getting Started', description: 'Complete your first training module', icon: Trophy },
  { id: 'perfect-score', name: 'Perfectionist', description: 'Score 100% on any module', icon: Star },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Complete a module in under 10 minutes', icon: Zap },
  { id: 'all-beginner', name: 'Foundation Master', description: 'Complete all beginner modules', icon: CheckCircle },
  { id: 'all-intermediate', name: 'Skill Builder', description: 'Complete all intermediate modules', icon: Target },
  { id: 'all-advanced', name: 'Expert Detective', description: 'Complete all advanced modules', icon: Award }
];

function CompletionContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const moduleId = params.moduleId as string;
  const score = Math.max(0, parseInt(searchParams.get('score') || '0'));
  const accuracy = Math.min(100, Math.max(0, parseInt(searchParams.get('accuracy') || '0')));
  const timeSpent = Math.min(120, Math.max(1, parseInt(searchParams.get('time') || '1')));

  console.log('Completion screen values:', { score, accuracy, timeSpent }); // Debug log

  const [completionStats, setCompletionStats] = useState<CompletionStats | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (moduleId && user) {
      loadCompletionData();
    }
  }, [moduleId, user, score, accuracy, timeSpent]);

  const loadCompletionData = () => {
    // Get user's updated training progress
    const trainingProgress = JSON.parse(localStorage.getItem(`training_progress_${user?.uid}`) || '{}');
    
    // Calculate rank based on accuracy
    const getRank = (accuracy: number): string => {
      if (accuracy >= 95) return 'Master Detective';
      if (accuracy >= 85) return 'Expert Investigator';
      if (accuracy >= 75) return 'Skilled Analyst';
      if (accuracy >= 65) return 'Competent Verifier';
      return 'Learning Detective';
    };

    // Check for new achievements
    const previousAchievements = JSON.parse(localStorage.getItem(`previous_achievements_${user?.uid}`) || '[]');
    const currentAchievements = trainingProgress.achievements || [];
    const newAchievements = currentAchievements.filter((a: string) => !previousAchievements.includes(a));
    
    // Update previous achievements
    localStorage.setItem(`previous_achievements_${user?.uid}`, JSON.stringify(currentAchievements));

    setCompletionStats({
      score,
      accuracy,
      timeSpent,
      moduleId,
      achievements: newAchievements,
      rank: getRank(accuracy)
    });

    setNewAchievements(newAchievements);
    setLoading(false);
  };

  const shareCompletion = async () => {
    const module = moduleData[moduleId as keyof typeof moduleData];
    const shareText = `🎯 Just completed "${module?.title}" training on MisInfo Combat Pro!\n\n📊 Score: ${score} points\n🎯 Accuracy: ${accuracy}%\n⏱️ Time: ${timeSpent} minutes\n🏆 Rank: ${completionStats?.rank}\n\nMastering misinformation detection one module at a time! 🛡️`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Achievement copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadCertificate = () => {
    const module = moduleData[moduleId as keyof typeof moduleData];
    const certificateText = `CERTIFICATE OF COMPLETION\n\nMisInfo Combat Pro Training\n\n${module?.title}\n\nAwarded to: ${user?.displayName || user?.email}\nDate: ${new Date().toLocaleDateString()}\nScore: ${score} points\nAccuracy: ${accuracy}%\nRank: ${completionStats?.rank}\n\nBadge Earned: ${module?.badge}\n\n---\nThis certifies that the above named individual has successfully completed the training module and demonstrated proficiency in misinformation detection techniques.`;

    const blob = new Blob([certificateText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${moduleId}-completion-certificate.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your results...</p>
        </div>
      </div>
    );
  }

  const module = moduleData[moduleId as keyof typeof moduleData];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">MisInfo Combat Pro</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/training"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Training
              </Link>
              <Link
                href="/verifier"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Verifier
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Congratulations! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            You've successfully completed
          </p>
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            {module?.title}
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            {module?.description}
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{score}</h3>
            <p className="text-gray-600">Points Earned</p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{accuracy}%</h3>
            <p className="text-gray-600">Accuracy</p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{timeSpent}</h3>
            <p className="text-gray-600">Minutes</p>
          </div>
        </div>

        {/* Badge Earned */}
        <div className="bg-white rounded-xl p-8 mb-8 text-center shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Badge Earned</h3>
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h4 className="text-2xl font-bold text-yellow-600 mb-2">{module?.badge}</h4>
          <p className="text-gray-600">
            Rank: <span className="font-semibold text-gray-900">{completionStats?.rank}</span>
          </p>
        </div>

        {/* New Achievements */}
        {newAchievements.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              New Achievements Unlocked!
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newAchievements.map((achievementId) => {
                const achievement = achievementsList.find(a => a.id === achievementId);
                if (!achievement) return null;
                
                const IconComponent = achievement.icon;
                
                return (
                  <div key={achievementId} className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center mr-4">
                      <IconComponent className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-900">{achievement.name}</h4>
                      <p className="text-sm text-yellow-700">{achievement.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={shareCompletion}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Achievement
          </button>
          
          <button
            onClick={downloadCertificate}
            className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Certificate
          </button>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h3>
          
          <div className="space-y-4">
            {module?.nextModule && (
              <Link
                href={`/training/module/${module.nextModule}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">Continue Learning</h4>
                  <p className="text-gray-600 text-sm">
                    Take the next module: {moduleData[module.nextModule as keyof typeof moduleData]?.title}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </Link>
            )}
            
            <button
              onClick={() => {
                // Force a refresh by using router and adding timestamp
                router.push(`/training?refresh=${Date.now()}`);
              }}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-gray-900">Training Hub</h4>
                <p className="text-gray-600 text-sm">Return to the training hub to explore all modules</p>
              </div>
              <Brain className="w-5 h-5 text-blue-600" />
            </button>
            
            <Link
              href="/verifier"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-gray-900">Practice Real Analysis</h4>
                <p className="text-gray-600 text-sm">Apply your new skills with the content verifier</p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </Link>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Strengths</h4>
              <ul className="text-gray-700 text-sm space-y-1">
                {accuracy >= 90 && <li>• Excellent pattern recognition</li>}
                {timeSpent < 15 && <li>• Quick decision making</li>}
                {score > 150 && <li>• Strong analytical skills</li>}
                <li>• Successfully completed all scenarios</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Areas for Growth</h4>
              <ul className="text-gray-700 text-sm space-y-1">
                {accuracy < 80 && <li>• Review core concepts</li>}
                {timeSpent > 25 && <li>• Practice faster analysis</li>}
                <li>• Continue with advanced modules</li>
                <li>• Apply skills in real-world scenarios</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CompletionPage() {
  return (
    <ProtectedRoute>
      <CompletionContent />
    </ProtectedRoute>
  );
}