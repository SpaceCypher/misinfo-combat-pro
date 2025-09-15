import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  arrayUnion,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// Helper function to convert Firestore timestamp to Date
const toDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
  return new Date(timestamp);
};

// Helper function to remove undefined properties from objects before Firebase operations
const removeUndefinedProperties = (obj: any): any => {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
        // Recursively clean nested objects
        const nestedCleaned = removeUndefinedProperties(obj[key]);
        if (Object.keys(nestedCleaned).length > 0) {
          cleaned[key] = nestedCleaned;
        }
      } else {
        cleaned[key] = obj[key];
      }
    }
  }
  return cleaned;
};

// Enhanced interfaces for comprehensive user data and gamification
export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate: Date;
  lastActive: Date;
  
  // Social links
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
  };
  
  // User preferences
  preferences?: {
    emailNotifications?: boolean;
    weeklyReports?: boolean;
    smsAlerts?: boolean;
    publicProfile?: boolean;
    shareAchievements?: boolean;
    language?: string;
    theme?: 'light' | 'dark' | 'auto';
  };
  
  // Gamification data
  level: number;
  totalPoints: number;
  currentLevelPoints: number;
  pointsToNextLevel: number;
  
  // Activity stats
  trainingStats: TrainingStats;
  analyzerStats: AnalyzerStats;
  verifierStats: VerifierStats;
  
  // Progress and achievements
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  completedModules: string[];
  achievements: Achievement[];
  streakDays: number;
  longestStreak: number;
  
  // Module progress
  moduleProgress: Record<string, ModuleProgress>;
}

export interface TrainingStats {
  modulesCompleted: number;
  totalTimeSpent: number;
  averageAccuracy: number;
  totalScenarios: number;
  perfectScores: number;
  pointsEarned: number;
}

export interface AnalyzerStats {
  totalAnalyses: number;
  misinformationDetected: number;
  accurateDetections: number;
  averageConfidence: number;
  pointsEarned: number;
}

export interface VerifierStats {
  totalVerifications: number;
  sourcesChecked: number;
  factChecksPerformed: number;
  accurateVerifications: number;
  pointsEarned: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'training' | 'analyzer' | 'verifier' | 'general';
  points: number;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserProgress {
  userId: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  completedModules: string[];
  currentScore: number;
  achievements: string[];
  totalTime: number;
  streakDays: number;
  lastActive: Date;
  moduleProgress: Record<string, ModuleProgress>;
}

export interface ModuleProgress {
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

export interface CompletedScenario {
  scenarioId: string;
  moduleId: string;
  userId: string;
  completedAt: Date;
  score: number;
  timeSpent: number;
  hintsUsed: number;
  wasCorrect: boolean;
}

export interface UserAnalysisHistory {
  userId: string;
  analyses: AnalysisRecord[];
  verifications: VerificationRecord[];
  commonMistakes: string[];
  preferredTopics: string[];
}

export interface AnalysisRecord {
  id: string;
  content: string;
  result: any;
  timestamp: Date;
  misinformationTypes: string[];
  confidence: number;
}

export interface VerificationRecord {
  id: string;
  content: string;
  result: boolean;
  timestamp: Date;
  verificationMethods: string[];
}

// Comprehensive User Profile Management
export class UserProfileManager {
  
  // Get complete user profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profileRef = doc(db, 'userProfiles', userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        return {
          ...data,
          joinedDate: toDate(data.joinedDate),
          lastActive: toDate(data.lastActive),
          achievements: data.achievements?.map((a: any) => ({
            ...a,
            unlockedAt: toDate(a.unlockedAt)
          })) || []
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
  
  // Create initial user profile
  static async createUserProfile(userId: string, userData: {
    email: string;
    displayName: string;
    photoURL?: string;
  }): Promise<UserProfile> {
    const initialProfile: UserProfile = {
      userId,
      email: userData.email,
      displayName: userData.displayName,
      ...(userData.photoURL && { photoURL: userData.photoURL }), // Only include photoURL if it exists
      bio: '',
      location: '',
      website: '',
      joinedDate: new Date(),
      lastActive: new Date(),
      
      // Social links
      socialLinks: {
        twitter: '',
        linkedin: '',
        instagram: '',
        github: ''
      },
      
      // User preferences
      preferences: {
        emailNotifications: true,
        weeklyReports: true,
        smsAlerts: false,
        publicProfile: true,
        shareAchievements: false,
        language: 'English',
        theme: 'light'
      },
      
      // Gamification
      level: 1,
      totalPoints: 0,
      currentLevelPoints: 0,
      pointsToNextLevel: 100,
      
      // Activity stats
      trainingStats: {
        modulesCompleted: 0,
        totalTimeSpent: 0,
        averageAccuracy: 0,
        totalScenarios: 0,
        perfectScores: 0,
        pointsEarned: 0
      },
      analyzerStats: {
        totalAnalyses: 0,
        misinformationDetected: 0,
        accurateDetections: 0,
        averageConfidence: 0,
        pointsEarned: 0
      },
      verifierStats: {
        totalVerifications: 0,
        sourcesChecked: 0,
        factChecksPerformed: 0,
        accurateVerifications: 0,
        pointsEarned: 0
      },
      
      // Progress
      skillLevel: 'beginner',
      completedModules: [],
      achievements: [],
      streakDays: 1,
      longestStreak: 1,
      moduleProgress: {}
    };
    
    try {
      const profileData = removeUndefinedProperties({
        ...initialProfile,
        joinedDate: serverTimestamp(),
        lastActive: serverTimestamp()
      });
      
      await setDoc(doc(db, 'userProfiles', userId), profileData);
      
      return initialProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
  
  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const profileRef = doc(db, 'userProfiles', userId);
      const cleanedUpdates = removeUndefinedProperties({
        ...updates,
        lastActive: serverTimestamp()
      });
      
      await updateDoc(profileRef, cleanedUpdates);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  // Add points and handle leveling
  static async addPoints(userId: string, points: number, category: 'training' | 'analyzer' | 'verifier'): Promise<{
    leveledUp: boolean;
    newLevel?: number;
    oldLevel?: number;
  }> {
    try {
      let profile = await this.getUserProfile(userId);
      
      // If profile doesn't exist, we can't proceed as we don't have user info
      if (!profile) {
        throw new Error('User profile not found. Please ensure user profile is initialized before adding points.');
      }
      
      const newTotalPoints = profile.totalPoints + points;
      const newCurrentLevelPoints = profile.currentLevelPoints + points;
      
      // Calculate level progression
      const { level: newLevel, currentLevelPoints, pointsToNextLevel } = this.calculateLevel(newTotalPoints);
      const leveledUp = newLevel > profile.level;
      
      // Update category-specific stats
      const categoryStats = {
        training: 'trainingStats',
        analyzer: 'analyzerStats',
        verifier: 'verifierStats'
      }[category];
      
      const updatedStats = {
        ...(profile[categoryStats as keyof UserProfile] as any || {}),
        pointsEarned: ((profile[categoryStats as keyof UserProfile] as any)?.pointsEarned || 0) + points
      };
      
      await this.updateUserProfile(userId, {
        totalPoints: newTotalPoints,
        level: newLevel,
        currentLevelPoints,
        pointsToNextLevel,
        [categoryStats]: updatedStats
      });
      
      // Add level up achievement if leveled up
      if (leveledUp) {
        await this.addAchievement(userId, {
          id: `level-${newLevel}`,
          name: `Level ${newLevel} Master`,
          description: `Reached level ${newLevel}!`,
          category: 'general',
          points: newLevel * 50,
          icon: 'trophy',
          rarity: newLevel >= 50 ? 'legendary' : newLevel >= 25 ? 'epic' : newLevel >= 10 ? 'rare' : 'common'
        });
      }
      
      return {
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined,
        oldLevel: leveledUp ? profile.level : undefined
      };
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }
  
  // Calculate level based on total points
  private static calculateLevel(totalPoints: number): {
    level: number;
    currentLevelPoints: number;
    pointsToNextLevel: number;
  } {
    // Exponential leveling: Level n requires n^1.5 * 100 points
    let level = 1;
    let pointsRequired = 0;
    
    while (true) {
      const nextLevelPoints = Math.floor(Math.pow(level, 1.5) * 100);
      if (pointsRequired + nextLevelPoints > totalPoints) break;
      pointsRequired += nextLevelPoints;
      level++;
    }
    
    const currentLevelPoints = totalPoints - pointsRequired;
    const pointsToNextLevel = Math.floor(Math.pow(level, 1.5) * 100) - currentLevelPoints;
    
    return { level, currentLevelPoints, pointsToNextLevel };
  }
  
  // Add achievement
  static async addAchievement(userId: string, achievement: Omit<Achievement, 'unlockedAt'>): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) throw new Error('User profile not found');
      
      // Check if achievement already exists
      const existingAchievement = profile.achievements.find(a => a.id === achievement.id);
      if (existingAchievement) return;
      
      const newAchievement: Achievement = {
        ...achievement,
        unlockedAt: new Date()
      };
      
      await this.updateUserProfile(userId, {
        achievements: [...profile.achievements, newAchievement],
        totalPoints: profile.totalPoints + achievement.points
      });
      
      console.log(`Achievement unlocked: ${achievement.name} (+${achievement.points} points)`);
    } catch (error) {
      console.error('Error adding achievement:', error);
      throw error;
    }
  }
}

// Training Progress Management
export class TrainingDatabase {
  
  // Get user's overall training progress
  static async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const userRef = doc(db, 'userProgress', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          ...data,
          lastActive: toDate(data.lastActive),
          moduleProgress: data.moduleProgress ? Object.keys(data.moduleProgress).reduce((acc, key) => {
            const progress = data.moduleProgress[key];
            acc[key] = {
              ...progress,
              startTime: toDate(progress.startTime),
              endTime: progress.endTime ? toDate(progress.endTime) : undefined
            };
            return acc;
          }, {} as Record<string, ModuleProgress>) : {}
        } as UserProgress;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }
  
  // Initialize new user progress
  static async initializeUserProgress(userId: string): Promise<UserProgress> {
    const initialProgress: UserProgress = {
      userId,
      skillLevel: 'beginner',
      completedModules: [],
      currentScore: 0,
      achievements: [],
      totalTime: 0,
      streakDays: 1,
      lastActive: new Date(),
      moduleProgress: {}
    };
    
    try {
      await setDoc(doc(db, 'userProgress', userId), {
        ...initialProgress,
        lastActive: serverTimestamp()
      });
      
      return initialProgress;
    } catch (error) {
      console.error('Error initializing user progress:', error);
      throw error;
    }
  }
  
  // Update user progress
  static async updateUserProgress(userId: string, updates: Partial<UserProgress>): Promise<void> {
    try {
      const userRef = doc(db, 'userProgress', userId);
      await updateDoc(userRef, {
        ...updates,
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }
  
  // Get module progress
  static async getModuleProgress(userId: string, moduleId: string): Promise<ModuleProgress | null> {
    try {
      const progress = await this.getUserProgress(userId);
      return progress?.moduleProgress[moduleId] || null;
    } catch (error) {
      console.error('Error getting module progress:', error);
      return null;
    }
  }
  
  // Save module progress
  static async saveModuleProgress(userId: string, moduleProgress: ModuleProgress): Promise<void> {
    try {
      console.log('Saving module progress:', moduleProgress); // Debug log
      
      const userRef = doc(db, 'userProgress', userId);
      const userProgress = await this.getUserProgress(userId);
      
      if (userProgress) {
        const progressToSave: any = {
          moduleId: moduleProgress.moduleId,
          currentScenario: moduleProgress.currentScenario,
          completedScenarios: moduleProgress.completedScenarios || [],
          score: moduleProgress.score || 0,
          startTime: moduleProgress.startTime instanceof Date 
            ? moduleProgress.startTime 
            : toDate(moduleProgress.startTime),
          timeSpent: moduleProgress.timeSpent || 0,
          mistakes: moduleProgress.mistakes || 0,
          hintsUsed: moduleProgress.hintsUsed || 0,
          accuracy: moduleProgress.accuracy || 0,
          attempts: moduleProgress.attempts || 1
        };
        
        // Only include endTime if it exists, is not null, and is not undefined
        if (moduleProgress.endTime !== null && moduleProgress.endTime !== undefined) {
          progressToSave.endTime = moduleProgress.endTime instanceof Date 
            ? moduleProgress.endTime 
            : toDate(moduleProgress.endTime);
        }
        
        console.log('Final progress to save:', progressToSave); // Debug log
        
        // Remove any undefined properties before saving
        const cleanedProgress = removeUndefinedProperties(progressToSave);
        console.log('Cleaned progress:', cleanedProgress); // Debug log
        
        const updatedModuleProgress = {
          ...userProgress.moduleProgress,
          [moduleProgress.moduleId]: cleanedProgress
        };
        
        // Clean the entire update object
        const cleanedUpdate = removeUndefinedProperties({
          moduleProgress: updatedModuleProgress,
          lastActive: serverTimestamp()
        });
        
        await updateDoc(userRef, cleanedUpdate);
        
        console.log('Module progress saved successfully'); // Debug log
      }
    } catch (error) {
      console.error('Error saving module progress:', error);
      throw error;
    }
  }
  
  // Record completed scenario to prevent repetition
  static async recordCompletedScenario(completedScenario: CompletedScenario): Promise<void> {
    try {
      const scenarioRef = doc(collection(db, 'completedScenarios'));
      await setDoc(scenarioRef, {
        ...completedScenario,
        completedAt: new Date() // Use regular Date instead of serverTimestamp
      });
    } catch (error) {
      console.error('Error recording completed scenario:', error);
      throw error;
    }
  }
  
  // Get completed scenarios for user to prevent repetition
  static async getCompletedScenarios(userId: string, moduleId?: string): Promise<CompletedScenario[]> {
    try {
      let q = query(
        collection(db, 'completedScenarios'),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc')
      );
      
      if (moduleId) {
        q = query(q, where('moduleId', '==', moduleId));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          completedAt: toDate(data.completedAt)
        };
      }) as CompletedScenario[];
    } catch (error) {
      console.error('Error getting completed scenarios:', error);
      return [];
    }
  }
  
  // Save user analysis history for AI content generation
  static async saveAnalysisHistory(userId: string, analysis: AnalysisRecord): Promise<void> {
    try {
      const historyRef = doc(db, 'userAnalysisHistory', userId);
      const historySnap = await getDoc(historyRef);
      
      const analysisWithTimestamp = {
        ...analysis,
        timestamp: new Date() // Use regular Date instead of serverTimestamp in arrays
      };
      
      if (historySnap.exists()) {
        await updateDoc(historyRef, {
          analyses: arrayUnion(analysisWithTimestamp),
          lastUpdated: serverTimestamp()
        });
      } else {
        await setDoc(historyRef, {
          userId,
          analyses: [analysisWithTimestamp],
          verifications: [],
          commonMistakes: [],
          preferredTopics: [],
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error saving analysis history:', error);
      throw error;
    }
  }
  
  // Get user analysis history for AI content generation
  static async getUserAnalysisHistory(userId: string): Promise<UserAnalysisHistory | null> {
    try {
      const historyRef = doc(db, 'userAnalysisHistory', userId);
      const historySnap = await getDoc(historyRef);
      
      if (historySnap.exists()) {
        const data = historySnap.data();
        return {
          ...data,
          analyses: data.analyses?.map((a: any) => ({
            ...a,
            timestamp: toDate(a.timestamp)
          })) || [],
          verifications: data.verifications?.map((v: any) => ({
            ...v,
            timestamp: toDate(v.timestamp)
          })) || []
        } as UserAnalysisHistory;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user analysis history:', error);
      return null;
    }
  }
  
  // Add achievement to user
  static async addAchievement(userId: string, achievement: string): Promise<void> {
    try {
      const userRef = doc(db, 'userProgress', userId);
      await updateDoc(userRef, {
        achievements: arrayUnion(achievement),
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding achievement:', error);
      throw error;
    }
  }
  
  // Complete module
  static async completeModule(userId: string, moduleId: string, finalScore: number, totalTime: number): Promise<void> {
    try {
      console.log('Completing module:', { userId, moduleId, finalScore, totalTime }); // Debug log
      
      const userRef = doc(db, 'userProgress', userId);
      let userProgress = await this.getUserProgress(userId);
      
      // Initialize user progress if it doesn't exist
      if (!userProgress) {
        console.log('No user progress found, initializing...'); // Debug log
        userProgress = await this.initializeUserProgress(userId);
      }
      
      const completedModules = [...(userProgress.completedModules || [])];
      const wasAlreadyCompleted = completedModules.includes(moduleId);
      
      console.log('Current completed modules:', completedModules); // Debug log
      console.log('Was already completed:', wasAlreadyCompleted); // Debug log
      
      if (!wasAlreadyCompleted) {
        completedModules.push(moduleId);
        console.log('Added module to completed list:', completedModules); // Debug log
      }
      
      // Calculate new skill level based on completed modules
      const oldSkillLevel = userProgress.skillLevel;
      const newSkillLevel = this.calculateSkillLevel(completedModules);
      
      console.log('Skill level progression:', { oldSkillLevel, newSkillLevel }); // Debug log
      
      const updateData = {
        completedModules,
        currentScore: (userProgress.currentScore || 0) + finalScore,
        totalTime: (userProgress.totalTime || 0) + totalTime,
        skillLevel: newSkillLevel,
        lastActive: serverTimestamp()
      };
      
      // Clean undefined properties before update
      const cleanedUpdate = removeUndefinedProperties(updateData);
      console.log('Cleaned module completion update:', cleanedUpdate); // Debug log
      
      await updateDoc(userRef, cleanedUpdate);
      
      console.log('Module completion saved successfully'); // Debug log
      
      // Add achievements if conditions are met
      if (!wasAlreadyCompleted) {
        await this.checkAndAddAchievements(userId, completedModules, oldSkillLevel, newSkillLevel);
      }

      // Add points for module completion using UserProfileManager
      if (!wasAlreadyCompleted) {
        const basePoints = 100; // Base points for completing a module
        const accuracyBonus = Math.floor(finalScore * 0.5); // Bonus based on score
        const timeBonus = totalTime < 300 ? 25 : 0; // Bonus for completing under 5 minutes
        const totalPoints = basePoints + accuracyBonus + timeBonus;
        
        await UserProfileManager.addPoints(userId, totalPoints, 'training');
      }
    } catch (error) {
      console.error('Error completing module:', error);
      throw error;
    }
  }
  
  // Check and add achievements based on progress
  private static async checkAndAddAchievements(
    userId: string, 
    completedModules: string[], 
    oldSkillLevel: string, 
    newSkillLevel: string
  ): Promise<void> {
    try {
      const beginnerModules = ['basic-fact-checking', 'source-evaluation', 'emotional-manipulation'];
      const intermediateModules = ['statistical-misinformation', 'visual-manipulation', 'context-manipulation'];
      const advancedModules = ['deepfake-detection', 'coordinated-campaigns', 'financial-scams'];
      
      // First module completion
      if (completedModules.length === 1) {
        await this.addAchievement(userId, 'first-module');
      }
      
      // Level progression
      if (oldSkillLevel !== newSkillLevel) {
        await this.addAchievement(userId, 'level-up');
      }
      
      // All beginner modules completed
      const completedBeginner = beginnerModules.filter(m => completedModules.includes(m));
      if (completedBeginner.length === beginnerModules.length) {
        await this.addAchievement(userId, 'all-beginner');
      }
      
      // All intermediate modules completed
      const completedIntermediate = intermediateModules.filter(m => completedModules.includes(m));
      if (completedIntermediate.length === intermediateModules.length) {
        await this.addAchievement(userId, 'all-intermediate');
      }
      
      // All advanced modules completed
      const completedAdvanced = advancedModules.filter(m => completedModules.includes(m));
      if (completedAdvanced.length === advancedModules.length) {
        await this.addAchievement(userId, 'all-advanced');
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }
  
  // Calculate skill level based on completed modules
  private static calculateSkillLevel(completedModules: string[]): 'beginner' | 'intermediate' | 'advanced' {
    const beginnerModules = ['basic-fact-checking', 'source-evaluation', 'emotional-manipulation'];
    const intermediateModules = ['statistical-misinformation', 'visual-manipulation', 'context-manipulation'];
    const advancedModules = ['deepfake-detection', 'coordinated-campaigns', 'financial-scams'];
    
    const completedAdvanced = advancedModules.filter(m => completedModules.includes(m)).length;
    const completedIntermediate = intermediateModules.filter(m => completedModules.includes(m)).length;
    const completedBeginner = beginnerModules.filter(m => completedModules.includes(m)).length;
    
    // Advanced level: completed at least 2 advanced modules
    if (completedAdvanced >= 2) return 'advanced';
    
    // Intermediate level: completed all beginner modules and at least 2 intermediate
    if (completedBeginner >= 3 && completedIntermediate >= 2) return 'intermediate';
    
    // Default to beginner
    return 'beginner';
  }
  
  // Get leaderboard data
  static async getLeaderboard(limit_count: number = 10): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'userProfiles'),
        orderBy('totalPoints', 'desc'),
        limit(limit_count)
      );
      
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const userData = {
          uid: doc.id,
          displayName: data.displayName || data.email?.split('@')[0] || 'Anonymous User',
          email: data.email,
          photoURL: data.photoURL,
          totalPoints: data.totalPoints || 0,
          level: data.level || 1,
          // Calculate activities completed
          activitiesCompleted: (data.trainingStats?.modulesCompleted || 0) + 
                              (data.analyzerStats?.totalAnalyses || 0) + 
                              (data.verifierStats?.totalVerifications || 0),
          ...data
        };
        return userData;
      });
      
      console.log('Leaderboard query results:', results);
      return results;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Record analyzer activity and award points
  static async recordAnalyzerActivity(userId: string, analysisType: string, accuracy?: number): Promise<void> {
    try {
      // Ensure user profile exists before awarding points
      let profile = await UserProfileManager.getUserProfile(userId);
      if (!profile) {
        console.log('User profile not found, attempting to initialize...');
        // We can't initialize without user data, so just return
        console.warn('Cannot award points: User profile not found and cannot be initialized without user auth data');
        return;
      }
      
      // Base points for using analyzer
      let points = 25;
      
      // Bonus points for high accuracy
      if (accuracy && accuracy > 0.8) {
        points += 15; // Bonus for high accuracy
      }
      
      await UserProfileManager.addPoints(userId, points, 'analyzer');
      
      // Update analyzer stats
      await UserProfileManager.updateUserProfile(userId, {
        analyzerStats: {
          totalAnalyses: 1, // This will be incremented by the updateUserProfile method
          misinformationDetected: 0, // Will be updated based on analysis result
          accurateDetections: accuracy && accuracy > 0.8 ? 1 : 0,
          averageConfidence: accuracy || 0,
          pointsEarned: points
        }
      });
    } catch (error) {
      console.error('Error recording analyzer activity:', error);
      throw error;
    }
  }

  // Record verifier activity and award points
  static async recordVerifierActivity(userId: string, verificationResult: boolean, confidence: number): Promise<void> {
    try {
      // Ensure user profile exists before awarding points
      let profile = await UserProfileManager.getUserProfile(userId);
      if (!profile) {
        console.log('User profile not found, attempting to initialize...');
        // We can't initialize without user data, so just return
        console.warn('Cannot award points: User profile not found and cannot be initialized without user auth data');
        return;
      }
      
      // Base points for using verifier
      let points = 20;
      
      // Bonus points for high confidence
      if (confidence > 0.8) {
        points += 10;
      }
      
      await UserProfileManager.addPoints(userId, points, 'verifier');
      
      // Update verifier stats
      await UserProfileManager.updateUserProfile(userId, {
        verifierStats: {
          totalVerifications: 1, // This will be incremented by the updateUserProfile method
          sourcesChecked: 1,
          factChecksPerformed: 1,
          accurateVerifications: verificationResult ? 1 : 0,
          pointsEarned: points
        }
      });
    } catch (error) {
      console.error('Error recording verifier activity:', error);
      throw error;
    }
  }

  // Get user's full profile including points and level
  static async getUserFullProfile(userId: string): Promise<UserProfile | null> {
    try {
      return await UserProfileManager.getUserProfile(userId);
    } catch (error) {
      console.error('Error getting user full profile:', error);
      return null;
    }
  }

  // Initialize or update user profile
  static async initializeUserProfile(userId: string, userData: {
    email: string;
    displayName?: string;
    photoURL?: string;
  }): Promise<UserProfile> {
    try {
      const profileData = {
        email: userData.email,
        displayName: userData.displayName || userData.email.split('@')[0],
        photoURL: userData.photoURL
      };
      return await UserProfileManager.createUserProfile(userId, profileData);
    } catch (error) {
      console.error('Error initializing user profile:', error);
      throw error;
    }
  }
}