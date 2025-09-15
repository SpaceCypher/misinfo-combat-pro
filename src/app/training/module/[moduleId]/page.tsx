'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Target, 
  Star,
  Brain,
  Award,
  Play,
  SkipForward,
  Lightbulb,
  Book,
  Zap,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/lib/simple-auth-context';
import ProtectedRoute from '@/components/protected-route';
import { TrainingDatabase, ModuleProgress as DBModuleProgress } from '@/lib/training-db';
import { AIContentGenerator } from '@/lib/ai-content-generator';

interface TrainingScenario {
  id: string;
  type: 'multiple-choice' | 'identify-regions' | 'drag-drop' | 'text-analysis';
  title: string;
  content: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: number;
  points: number;
  hints?: string[];
}

interface ModuleProgress {
  moduleId: string;
  currentScenario: number;
  completedScenarios: string[];
  score: number;
  startTime: Date;
  endTime?: Date;
  timeSpent: number;
  mistakes: number;
  hintsUsed: number;
  accuracy: number;
  attempts: number;
}

// AI-Generated Training Scenarios with Comprehensive Content
const generateTrainingScenarios = (moduleId: string): TrainingScenario[] => {
  const scenarioSets: Record<string, TrainingScenario[]> = {
    'basic-fact-checking': [
      {
        id: 'scenario-1',
        type: 'multiple-choice',
        title: 'Source Credibility Assessment',
        content: `Breaking: Local politician announces major infrastructure project worth ₹500 crores.\n\nSource: WhatsApp forward from "Delhi News Updates" account`,
        question: 'What should be your first step in verifying this claim?',
        options: [
          'Share immediately as it sounds important',
          'Check official government websites and press releases',
          'Look for the same news on social media',
          'Ask friends if they\'ve heard about it'
        ],
        correctAnswer: 'Check official government websites and press releases',
        explanation: 'Official government sources like PIB, ministry websites, or official press releases are the most reliable first step for verifying government announcements. WhatsApp forwards are not credible sources.',
        difficulty: 1,
        points: 10,
        hints: ['Think about where official government announcements are typically made', 'WhatsApp forwards are not reliable sources']
      },
      {
        id: 'scenario-2',
        type: 'multiple-choice',
        title: 'Citation Analysis',
        content: `"Studies show that 90% of people who drink coffee live longer lives. Research conducted by leading scientists proves this fact." - Health Blog Post`,
        question: 'What information is missing that would help verify this claim?',
        options: [
          'The author\'s coffee preferences',
          'Specific study names, publication dates, and journal sources',
          'More statistics about coffee',
          'Pictures of the research lab'
        ],
        correctAnswer: 'Specific study names, publication dates, and journal sources',
        explanation: 'Credible claims should include specific citations: study names, researchers, publication dates, journal names, and sample sizes. Vague references like "studies show" or "scientists prove" are red flags.',
        difficulty: 2,
        points: 15,
        hints: ['What specific information would help you find and verify the actual research?', 'Think about how academic papers cite their sources']
      },
      {
        id: 'scenario-3',
        type: 'multiple-choice',
        title: 'Primary vs Secondary Sources',
        content: `Claim: "World Health Organization declares new treatment effective"\n\nSources found:\nA) WHO official website statement\nB) News article about WHO statement\nC) Social media post referencing news article`,
        question: 'Which is the best primary source to verify this claim?',
        options: [
          'The social media post (most recent)',
          'The news article (detailed coverage)', 
          'WHO official website statement',
          'All sources are equally reliable'
        ],
        correctAnswer: 'WHO official website statement',
        explanation: 'Primary sources are original, firsthand accounts. The WHO official statement is the primary source, while news articles and social media posts are secondary sources that interpret or report on the primary source.',
        difficulty: 1,
        points: 10,
        hints: ['Which source is closest to the original information?', 'Think about the chain of information transmission']
      }
    ],
    'source-evaluation': [
      {
        id: 'scenario-1',
        type: 'multiple-choice',
        title: 'Website Authority Assessment',
        content: `You find a health article on "HealthTruthRevealed.net". The about page shows:\n\n- No author credentials listed\n- Domain registered 2 months ago\n- Articles have no citations\n- Sidebar filled with ads for "miracle cures"`,
        question: 'How would you rate this source\'s credibility?',
        options: [
          'Highly credible - recent domain means fresh information',
          'Moderately credible - health topics are always reliable',
          'Low credibility - multiple red flags present',
          'Cannot determine without reading more articles'
        ],
        correctAnswer: 'Low credibility - multiple red flags present',
        explanation: 'Multiple red flags indicate low credibility: no author expertise, new domain, lack of citations, and commercial bias from "miracle cure" ads. Credible health sources have clear authorship, established history, and proper citations.',
        difficulty: 2,
        points: 15,
        hints: ['Count the warning signs you can identify', 'Think about what makes medical information trustworthy']
      },
      {
        id: 'scenario-2',
        type: 'multiple-choice',
        title: 'Domain Analysis',
        content: `Three articles about climate change:\n\nA) nature.com/articles/climate-study-2024\nB) climatetruthexposed.org/hoax-revealed\nC) nasa.gov/climate/evidence`,
        question: 'Rank these domains by credibility for climate science:',
        options: [
          'B > A > C (expose sites reveal hidden truths)',
          'A > C > B (peer-reviewed journal, then government, then advocacy)',
          'C > A > B (government, then journal, then advocacy)',
          'All equal (information is information)'
        ],
        correctAnswer: 'C > A > B (government, then journal, then advocacy)',
        explanation: 'NASA.gov is a trusted government scientific agency. Nature.com is a top-tier peer-reviewed journal. Sites with "truth exposed" in the domain often indicate bias or conspiracy theories rather than objective analysis.',
        difficulty: 2,
        points: 20,
        hints: ['Consider the institutional backing of each domain', 'What does the domain name suggest about potential bias?']
      }
    ],
    'emotional-manipulation': [
      {
        id: 'scenario-1',
        type: 'identify-regions',
        title: 'Fear-Based Language Detection',
        content: `URGENT WARNING: Deadly virus spreading rapidly across major cities! Thousands already infected! Government hiding the truth! Share immediately to save lives! Don't let your family become victims!`,
        question: 'Click on all the words or phrases that use fear-based emotional manipulation:',
        correctAnswer: ['URGENT WARNING', 'Deadly', 'rapidly', 'Thousands already infected', 'Government hiding', 'save lives', 'Don\'t let your family become victims'],
        explanation: 'Fear-based manipulation uses urgent language (URGENT, rapidly), dramatic terms (deadly, thousands), conspiracy suggestions (government hiding), and personal threats (your family become victims) to bypass rational thinking.',
        difficulty: 2,
        points: 20,
        hints: ['Look for words that create urgency or panic', 'Notice language that suggests immediate personal danger']
      },
      {
        id: 'scenario-2',
        type: 'multiple-choice',
        title: 'Anger and Outrage Appeals',
        content: `"They don't want you to know this SHOCKING truth! Big corporations are STEALING from hardworking families while politicians do NOTHING! Are you going to let them get away with this OUTRAGE?"`,
        question: 'What emotional manipulation techniques are being used?',
        options: [
          'Only providing factual information',
          'Appeal to curiosity and learning',
          'Anger amplification and us-vs-them framing',
          'Encouraging careful consideration'
        ],
        correctAnswer: 'Anger amplification and us-vs-them framing',
        explanation: 'This content uses anger amplification (SHOCKING, OUTRAGE, STEALING) and creates an us-vs-them dynamic (you vs. corporations/politicians) to provoke emotional rather than rational responses.',
        difficulty: 2,
        points: 15,
        hints: ['What emotions is this trying to make you feel?', 'Notice how it positions different groups']
      }
    ],
    'statistical-misinformation': [
      {
        id: 'scenario-1',
        type: 'multiple-choice',
        title: 'Misleading Statistics',
        content: `Chart showing: "Crime Rate Increase"\nYear 1: 100 crimes\nYear 2: 150 crimes\n\nHeadline: "CRIME SKYROCKETS 50% - CITY IN CRISIS!"`,
        question: 'What additional information would you need to properly evaluate this statistic?',
        options: [
          'The exact time these crimes occurred',
          'Population growth, crime types, reporting changes, and baseline context',
          'Names of all the criminals',
          'Weather data for those years'
        ],
        correctAnswer: 'Population growth, crime types, reporting changes, and baseline context',
        explanation: 'Raw numbers can be misleading without context. A 50% increase might be normal if population grew, reporting improved, or definitions changed. Always ask: increase relative to what? Is this normal variation?',
        difficulty: 3,
        points: 25,
        hints: ['Think about what factors could affect crime reporting', 'Consider whether the baseline year was typical']
      },
      {
        id: 'scenario-2',
        type: 'multiple-choice',
        title: 'Correlation vs Causation',
        content: `"Ice cream sales and drowning deaths both increase in summer months. Therefore, ice cream causes drowning deaths!"`,
        question: 'What logical fallacy is this demonstrating?',
        options: [
          'Correct causal reasoning',
          'Correlation being confused with causation',
          'Valid statistical analysis',
          'Proper experimental design'
        ],
        correctAnswer: 'Correlation being confused with causation',
        explanation: 'This is a classic correlation vs causation error. Both ice cream sales and drowning deaths increase in summer due to hot weather and more people swimming, not because ice cream causes drowning.',
        difficulty: 2,
        points: 20,
        hints: ['Are these two things really directly connected?', 'What third factor might explain both increases?']
      }
    ],
    'visual-misinformation': [
      {
        id: 'scenario-1',
        type: 'multiple-choice',
        title: 'Manipulated Image Detection',
        content: `You see a viral photo showing a politician shaking hands with a controversial figure. The lighting on their faces doesn't match, and there's a subtle outline around one person.`,
        question: 'What should you do first?',
        options: [
          'Share immediately - photos don\'t lie',
          'Use reverse image search and look for editing artifacts',
          'Assume it\'s real if it confirms your beliefs',
          'Check if the politician denied it'
        ],
        correctAnswer: 'Use reverse image search and look for editing artifacts',
        explanation: 'Visual inconsistencies like mismatched lighting and outlines suggest photo manipulation. Reverse image search can reveal the original images used, and technical analysis can confirm editing.',
        difficulty: 3,
        points: 25,
        hints: ['What do the visual clues suggest?', 'What tools can help verify image authenticity?']
      },
      {
        id: 'scenario-2',
        type: 'multiple-choice',
        title: 'Misleading Graph Analysis',
        content: `Bar chart titled "Company Profits Soar!" shows:\nQ1: $100M (bar height 1 unit)\nQ2: $110M (bar height 5 units)`,
        question: 'What makes this graph misleading?',
        options: [
          'The data is completely accurate',
          'The visual scale doesn\'t match the numerical scale',
          'There\'s not enough data shown',
          'The title is too exciting'
        ],
        correctAnswer: 'The visual scale doesn\'t match the numerical scale',
        explanation: 'The graph exaggerates a 10% increase by making the Q2 bar 5 times taller than Q1. This visual manipulation makes a modest increase appear dramatic.',
        difficulty: 2,
        points: 20,
        hints: ['Compare the actual numbers to the visual representation', 'What impression does the chart give vs reality?']
      }
    ],
    'deepfake-detection': [
      {
        id: 'scenario-1',
        type: 'multiple-choice',
        title: 'Video Authenticity Red Flags',
        content: `A video shows a celebrity making controversial statements. You notice:\n- Slight lip-sync issues\n- Unnatural eye movements\n- Face seems to "float" over the body\n- Audio quality doesn't match video quality`,
        question: 'These signs most likely indicate:',
        options: [
          'Poor video compression',
          'Live streaming technical issues',
          'Possible deepfake manipulation',
          'Natural camera movement'
        ],
        correctAnswer: 'Possible deepfake manipulation',
        explanation: 'These are classic deepfake indicators: lip-sync problems, unnatural facial movements, face-body misalignment, and audio-video quality mismatches are common artifacts of AI-generated videos.',
        difficulty: 3,
        points: 30,
        hints: ['What technologies could cause these specific artifacts?', 'Think about how AI generates faces vs bodies']
      }
    ],
    'social-media-verification': [
      {
        id: 'scenario-1',
        type: 'multiple-choice',
        title: 'Account Verification Analysis',
        content: `A Twitter account "@RealNewsUpdate" shares breaking news. Profile shows:\n- Created last week\n- 50K followers gained in 3 days\n- Profile photo is a stock image\n- Bio claims "Official News Source"`,
        question: 'How would you assess this account\'s credibility?',
        options: [
          'Highly credible - lots of followers',
          'Suspicious - multiple red flags present',
          'Credible if the news seems accurate',
          'Neutral - need more information'
        ],
        correctAnswer: 'Suspicious - multiple red flags present',
        explanation: 'Multiple red flags indicate a potentially fake account: extremely rapid follower growth, new creation date, stock photo, and self-proclaimed authority without verification.',
        difficulty: 2,
        points: 20,
        hints: ['How realistic is gaining 50K followers in 3 days?', 'What do these profile elements suggest?']
      }
    ],
    'context-verification': [
      {
        id: 'scenario-1',
        type: 'multiple-choice',
        title: 'Out-of-Context Content',
        content: `Viral video shows people celebrating in streets with caption: "Citizens celebrate new government policy!"\n\nReverse search reveals: This is actually footage from a sports championship celebration from 2019.`,
        question: 'This is an example of:',
        options: [
          'Accurate reporting',
          'Context manipulation with authentic content',
          'Completely fabricated content',
          'Minor reporting error'
        ],
        correctAnswer: 'Context manipulation with authentic content',
        explanation: 'This is context manipulation - using real footage but providing false context about when, where, or why it happened. The content itself is authentic but the narrative is fabricated.',
        difficulty: 2,
        points: 20,
        hints: ['Is the video real or fake?', 'What changed about the video?']
      }
    ],
    'advanced-verification': [
      {
        id: 'scenario-1',
        type: 'multiple-choice',
        title: 'Cross-Platform Verification',
        content: `A major claim appears across multiple platforms:\n- Same exact wording on 50+ social media accounts\n- Posted within 1-hour window\n- All accounts created recently\n- Similar follower patterns`,
        question: 'This pattern most likely indicates:',
        options: [
          'Organic viral spread of true information',
          'Coordinated inauthentic behavior/bot network',
          'Natural information sharing',
          'Coincidental timing'
        ],
        correctAnswer: 'Coordinated inauthentic behavior/bot network',
        explanation: 'Identical content, synchronized timing, new accounts, and similar patterns strongly suggest coordinated inauthentic behavior - likely a bot network or organized manipulation campaign.',
        difficulty: 3,
        points: 30,
        hints: ['How likely is exact identical wording across 50+ accounts?', 'What do the timing and account patterns suggest?']
      }
    ]
  };

  return scenarioSets[moduleId] || [];
};

const moduleData = {
  'basic-fact-checking': {
    title: 'Basic Fact-Checking Fundamentals',
    description: 'Learn essential techniques to verify information and identify reliable sources',
    totalScenarios: 3,
    estimatedTime: 15,
    skills: ['Source verification', 'Citation analysis', 'Red flag identification', 'Primary source evaluation']
  },
  'source-evaluation': {
    title: 'Source Evaluation Basics',
    description: 'Master the fundamentals of assessing source credibility and reliability',
    totalScenarios: 2,
    estimatedTime: 20,
    skills: ['Website authority', 'Domain analysis', 'Credibility assessment', 'Institutional backing']
  },
  'emotional-manipulation': {
    title: 'Emotional Manipulation Recognition',
    description: 'Identify emotional appeals and psychological manipulation techniques',
    totalScenarios: 2,
    estimatedTime: 18,
    skills: ['Fear appeals', 'Urgency tactics', 'Emotional language', 'Psychological triggers']
  },
  'statistical-misinformation': {
    title: 'Statistical Misinformation Detection',
    description: 'Learn to identify misleading statistics and data manipulation',
    totalScenarios: 2,
    estimatedTime: 25,
    skills: ['Graph analysis', 'Correlation vs causation', 'Sample evaluation', 'Context analysis']
  },
  'visual-misinformation': {
    title: 'Visual Content Analysis',
    description: 'Detect manipulated images, videos, and misleading visual content',
    totalScenarios: 2,
    estimatedTime: 30,
    skills: ['Image manipulation', 'Graph analysis', 'Visual artifacts', 'Technical verification']
  },
  'deepfake-detection': {
    title: 'Deepfake & AI Content Detection',
    description: 'Identify AI-generated content and sophisticated media manipulation',
    totalScenarios: 1,
    estimatedTime: 35,
    skills: ['Deepfake indicators', 'AI artifacts', 'Technical analysis', 'Video verification']
  },
  'social-media-verification': {
    title: 'Social Media Verification',
    description: 'Verify social media content, accounts, and viral information',
    totalScenarios: 1,
    estimatedTime: 25,
    skills: ['Account verification', 'Viral content analysis', 'Platform-specific checks', 'Network analysis']
  },
  'context-verification': {
    title: 'Context & Timing Verification',
    description: 'Verify the context, timing, and circumstances of information',
    totalScenarios: 1,
    estimatedTime: 20,
    skills: ['Context manipulation', 'Timeline verification', 'Geographic verification', 'Circumstantial analysis']
  },
  'advanced-verification': {
    title: 'Advanced Verification Techniques',
    description: 'Master sophisticated verification methods and cross-platform analysis',
    totalScenarios: 1,
    estimatedTime: 40,
    skills: ['Cross-platform verification', 'Bot detection', 'Coordinated behavior', 'Advanced tools']
  }
};

// Helper function to convert to Date
const toDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
  return new Date(timestamp);
};

function TrainingModuleContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;

  const [scenarios, setScenarios] = useState<TrainingScenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionStartTime] = useState(new Date()); // Track actual session start time

  useEffect(() => {
    if (moduleId && user) {
      initializeModule();
    }
  }, [moduleId, user]);

  const initializeModule = async () => {
    if (!user?.uid) return;
    
    try {
      // Get static scenarios first as fallback
      const staticScenarios = generateTrainingScenarios(moduleId);
      
      // Get completed scenarios to avoid repetition
      const completedScenarios = await TrainingDatabase.getCompletedScenarios(user.uid, moduleId);
      const excludeIds = completedScenarios.map(s => s.scenarioId);
      
      // Try to generate AI content based on user history (only if API key is available)
      let finalScenarios = staticScenarios.filter(s => !excludeIds.includes(s.id));
      
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        try {
          const aiScenarios = await AIContentGenerator.generatePersonalizedScenarios({
            userId: user.uid,
            moduleId,
            difficulty: 2, // Default difficulty
            excludeScenarioIds: excludeIds
          });
          
          // Combine AI-generated and static scenarios, prioritizing AI content
          const combinedScenarios = [
            ...aiScenarios.filter(s => !excludeIds.includes(s.id)),
            ...staticScenarios.filter(s => !excludeIds.includes(s.id))
          ];
          
          finalScenarios = combinedScenarios.slice(0, 5); // Limit to 5 scenarios per session
        } catch (aiError) {
          console.warn('AI content generation failed, using static content:', aiError);
          // Keep using static scenarios
        }
      } else {
        console.warn('Gemini API key not configured, using static scenarios only');
      }
      
      setScenarios(finalScenarios);
      
      // Load or create module progress from Firestore
      let savedProgress = await TrainingDatabase.getModuleProgress(user.uid, moduleId);
      
      if (savedProgress) {
        const progressToSet: any = {
          ...savedProgress,
          startTime: toDate(savedProgress.startTime)
        };
        
        // Only include endTime if it exists and is not null/undefined
        if (savedProgress.endTime && savedProgress.endTime !== null) {
          progressToSet.endTime = toDate(savedProgress.endTime);
        }
        
        setModuleProgress(progressToSet);
      } else {
        const newProgress: ModuleProgress = {
          moduleId,
          currentScenario: 0,
          completedScenarios: [],
          score: 0,
          startTime: new Date(),
          timeSpent: 0,
          mistakes: 0,
          hintsUsed: 0,
          accuracy: 0,
          attempts: 1
        };
        setModuleProgress(newProgress);
        await TrainingDatabase.saveModuleProgress(user.uid, newProgress);
      }
      
    } catch (error) {
      console.error('Error initializing module:', error);
      // Fallback to static scenarios
      const staticScenarios = generateTrainingScenarios(moduleId);
      setScenarios(staticScenarios);
    }
    
    setLoading(false);
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !scenarios[currentScenario] || !user?.uid || !moduleProgress) return;

    let correct = false;
    
    // Handle different scenario types
    if (scenarios[currentScenario].type === 'identify-regions') {
      // For identify-regions, we'll consider it correct if they clicked the analyze button
      correct = selectedAnswer === 'simulated-answer';
    } else {
      // For multiple-choice and text-analysis
      correct = selectedAnswer === scenarios[currentScenario].correctAnswer;
    }
    
    setIsCorrect(correct);
    setShowExplanation(true);

    // Update progress
    const updatedProgress = {
      ...moduleProgress,
      score: correct ? moduleProgress.score + scenarios[currentScenario].points : moduleProgress.score,
      mistakes: correct ? moduleProgress.mistakes : moduleProgress.mistakes + 1,
      hintsUsed: moduleProgress.hintsUsed + hintsUsed,
      completedScenarios: [...moduleProgress.completedScenarios, scenarios[currentScenario].id],
      // Remove accuracy calculation from here - will calculate at completion
    };
    
    setModuleProgress(updatedProgress);
    
    // Save to Firestore
    try {
      await TrainingDatabase.saveModuleProgress(user.uid, updatedProgress);
      
      // Record completed scenario to prevent repetition
      await TrainingDatabase.recordCompletedScenario({
        scenarioId: scenarios[currentScenario].id,
        moduleId,
        userId: user.uid,
        completedAt: new Date(),
        score: correct ? scenarios[currentScenario].points : 0,
        timeSpent: 30, // Approximate time - in real implementation, track actual time
        hintsUsed,
        wasCorrect: correct
      });
      
      // Record user interaction for AI content generation
      await AIContentGenerator.recordUserInteraction(user.uid, {
        scenarioId: scenarios[currentScenario].id,
        moduleId,
        wasCorrect: correct,
        timeSpent: 30,
        hintsUsed,
        misinformationType: getScenarioMisinformationType(scenarios[currentScenario])
      });
      
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };
  
  // Helper function to determine misinformation type from scenario
  const getScenarioMisinformationType = (scenario: TrainingScenario): string => {
    // Map scenario to misinformation type for AI learning
    const typeMap: Record<string, string> = {
      'basic-fact-checking': 'fact-checking',
      'source-evaluation': 'source-credibility',
      'emotional-manipulation': 'emotional-manipulation',
      'statistical-misinformation': 'statistical-misuse',
      'visual-misinformation': 'visual-manipulation',
      'deepfake-detection': 'deepfake',
      'social-media-verification': 'social-media',
      'context-verification': 'context-manipulation',
      'advanced-verification': 'coordinated-behavior'
    };
    
    return typeMap[moduleId] || 'general-misinformation';
  };

  const handleNextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setSelectedAnswer('');
      setShowExplanation(false);
      setIsCorrect(null);
      setShowHint(false);
      setHintsUsed(0);
    } else {
      // Module completed
      handleModuleCompletion();
    }
  };

  const handleModuleCompletion = async () => {
    if (!moduleProgress || !user?.uid) return;

    // Calculate final score and time
    const endTime = new Date();
    
    // Calculate time spent in this session (in minutes) using session start time
    const sessionTime = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 1000 / 60);
    
    // Calculate accuracy based on correct answers vs total scenarios completed
    const totalScenariosCompleted = moduleProgress.completedScenarios.length;
    const totalMistakes = moduleProgress.mistakes;
    const correctAnswers = totalScenariosCompleted - totalMistakes;
    let accuracy = totalScenariosCompleted > 0 ? Math.round((correctAnswers / totalScenariosCompleted) * 100) : 0;
    
    // Ensure accuracy is within valid bounds (0-100%)
    accuracy = Math.min(100, Math.max(0, accuracy));
    
    console.log('Accuracy calculation debug:', {
      totalScenariosCompleted,
      totalMistakes,
      correctAnswers,
      calculatedAccuracy: accuracy
    });
    
    // Ensure realistic time bounds (minimum 1 minute, maximum reasonable time)
    const totalTime = Math.max(1, Math.min(sessionTime, 60)); // Cap at 1 hour max for a single session
    
    console.log('Completion calculations:', {
      sessionTime,
      totalTime,
      accuracy,
      correctAnswers,
      totalScenariosCompleted,
      totalMistakes,
      mistakes: moduleProgress.mistakes,
      score: moduleProgress.score,
      completedScenarios: moduleProgress.completedScenarios
    }); // Debug log

    try {
      // Update module progress with completion - only include endTime if it's valid
      const completedProgress: any = {
        ...moduleProgress,
        timeSpent: totalTime,
        accuracy: accuracy // Already bounded to 0-100
      };
      
      // Only add endTime if it's a valid Date
      if (endTime && endTime instanceof Date && !isNaN(endTime.getTime())) {
        completedProgress.endTime = endTime;
      }
      
      await TrainingDatabase.saveModuleProgress(user.uid, completedProgress);
      
      // Complete the module in user's overall progress
      await TrainingDatabase.completeModule(user.uid, moduleId, moduleProgress.score, totalTime);
      
      // Check for and add new achievements
      const userProgress = await TrainingDatabase.getUserProgress(user.uid);
      const achievements = [];
      
      if (!userProgress?.completedModules?.length) {
        achievements.push('first-module');
      }
      if (accuracy === 100) {
        achievements.push('perfect-score');
      }
      if (totalTime < 10) {
        achievements.push('speed-demon');
      }
      if (moduleProgress.mistakes === 0) {
        achievements.push('flawless-victory');
      }
      
      // Add achievements to user profile
      for (const achievement of achievements) {
        await TrainingDatabase.addAchievement(user.uid, achievement);
      }
      
      // Navigate to completion screen with corrected values
      router.push(`/training/complete/${moduleId}?score=${moduleProgress.score}&accuracy=${accuracy}&time=${totalTime}`);
      
    } catch (error) {
      console.error('Error completing module:', error);
      // Fallback navigation with corrected values
      router.push(`/training/complete/${moduleId}?score=${moduleProgress.score}&accuracy=${accuracy}&time=${totalTime}`);
    }
  };

  const getCurrentModule = () => {
    return moduleData[moduleId as keyof typeof moduleData];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading training module...</p>
        </div>
      </div>
    );
  }

  if (!scenarios.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Module Not Found</h2>
          <p className="text-gray-600 mb-6">This training module is not available yet.</p>
          <Link
            href="/training"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Training Hub
          </Link>
        </div>
      </div>
    );
  }

  const currentScenarioData = scenarios[currentScenario];
  const module = getCurrentModule();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/training"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to Training</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">{module?.title}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  Score: {moduleProgress?.score || 0}
                </div>
                <div className="text-xs text-gray-600">
                  {currentScenario + 1} of {scenarios.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Scenario {currentScenario + 1} of {scenarios.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentScenario + 1) / scenarios.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentScenario + 1) / scenarios.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Scenario Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Scenario Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{currentScenarioData.title}</h2>
              <div className="flex items-center space-x-1">
                {[...Array(currentScenarioData.difficulty)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                {currentScenarioData.points} points
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                ~2 min
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Content to Analyze:</h3>
              <div className="text-gray-800 whitespace-pre-line font-mono text-sm bg-white p-3 rounded border">
                {currentScenarioData.content}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">{currentScenarioData.question}</h3>
              
              {currentScenarioData.type === 'multiple-choice' && (
                <div className="space-y-3">
                  {currentScenarioData.options?.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAnswer === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={selectedAnswer === option}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        className="mr-3 text-blue-600"
                        disabled={showExplanation}
                      />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentScenarioData.type === 'text-analysis' && (
                <div className="space-y-3">
                  {currentScenarioData.options?.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAnswer === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={selectedAnswer === option}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        className="mr-3 text-blue-600"
                        disabled={showExplanation}
                      />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentScenarioData.type === 'identify-regions' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 text-sm mb-3">
                    <strong>Note:</strong> This is an identify-regions exercise. In a full implementation, 
                    you would click on text regions. For now, the correct regions are shown in the explanation.
                  </p>
                  <div className="text-gray-800 p-3 bg-white rounded border">
                    {currentScenarioData.content}
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => setSelectedAnswer('simulated-answer')}
                      className={`px-4 py-2 rounded-lg ${
                        selectedAnswer === 'simulated-answer'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      disabled={showExplanation}
                    >
                      Mark as Analyzed
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hint System */}
            {!showExplanation && currentScenarioData.hints && (
              <div className="mb-6">
                {!showHint ? (
                  <button
                    onClick={() => {
                      setShowHint(true);
                      setHintsUsed(hintsUsed + 1);
                    }}
                    className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Need a hint?
                  </button>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-1">Hint:</h4>
                        <p className="text-yellow-700 text-sm">
                          {currentScenarioData.hints[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Explanation */}
            {showExplanation && (
              <div className={`rounded-lg p-4 mb-6 ${
                isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start">
                  <CheckCircle className={`w-5 h-5 mr-2 mt-0.5 ${
                    isCorrect ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <div>
                    <h4 className={`font-medium mb-2 ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {isCorrect ? 'Correct!' : 'Not quite right.'}
                    </h4>
                    <p className={`text-sm leading-relaxed ${
                      isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {currentScenarioData.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => router.push('/training')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Exit Training
              </button>

              <div className="space-x-3">
                {!showExplanation ? (
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextScenario}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
                  >
                    {currentScenario < scenarios.length - 1 ? (
                      <>
                        Next Scenario
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </>
                    ) : (
                      <>
                        Complete Module
                        <Trophy className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Module Skills */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Book className="w-5 h-5 mr-2" />
            Skills You're Learning
          </h3>
          <div className="flex flex-wrap gap-2">
            {module?.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TrainingModulePage() {
  return (
    <ProtectedRoute>
      <TrainingModuleContent />
    </ProtectedRoute>
  );
}