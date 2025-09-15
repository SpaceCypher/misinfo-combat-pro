// Import from existing gemini.ts file
import { generateContent } from './gemini';
import { TrainingDatabase, UserAnalysisHistory, AnalysisRecord } from './training-db';

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

interface ScenarioGenerationRequest {
  userId: string;
  moduleId: string;
  difficulty: number;
  excludeScenarioIds: string[];
  userHistory?: UserAnalysisHistory;
}

export class AIContentGenerator {
  
  // Generate personalized training scenarios based on user history
  static async generatePersonalizedScenarios(request: ScenarioGenerationRequest): Promise<TrainingScenario[]> {
    try {
      // Check if API key is available
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        console.warn('Gemini API key not configured, using static scenarios');
        return this.getFallbackScenarios(request.moduleId, request.difficulty);
      }
      
      // Get user's analysis history
      const userHistory = request.userHistory || await TrainingDatabase.getUserAnalysisHistory(request.userId);
      
      // Build context from user's previous analyses
      const userContext = this.buildUserContext(userHistory);
      
      // Get module-specific prompt
      const modulePrompt = this.getModulePrompt(request.moduleId, request.difficulty);
      
      const prompt = `
      You are an expert in creating misinformation detection training scenarios. Generate exactly 2 training scenarios for the "${request.moduleId}" module at difficulty level ${request.difficulty}.

      User Context:
      ${userContext}

      Module Requirements:
      ${modulePrompt}

      Exclude these scenario IDs: ${request.excludeScenarioIds.join(', ')}

      IMPORTANT: Return ONLY a valid JSON array with NO markdown code blocks, explanations, or additional text.

      Use this EXACT structure:
      [
        {
          "id": "ai-generated-1",
          "type": "multiple-choice",
          "title": "Clear Scenario Title",
          "content": "Specific content to analyze related to the module topic",
          "question": "Clear question asking what to do or identify",
          "options": [
            "First option",
            "Second option", 
            "Third option",
            "Fourth option"
          ],
          "correctAnswer": "One of the exact options above",
          "explanation": "Detailed explanation of why the correct answer is right and others are wrong",
          "difficulty": ${request.difficulty},
          "points": ${request.difficulty * 10},
          "hints": [
            "First helpful hint",
            "Second helpful hint"
          ]
        },
        {
          "id": "ai-generated-2",
          "type": "multiple-choice",
          "title": "Second Scenario Title",
          "content": "Different content for analysis",
          "question": "Different question",
          "options": [
            "Option A",
            "Option B",
            "Option C", 
            "Option D"
          ],
          "correctAnswer": "One of the exact options above",
          "explanation": "Clear explanation",
          "difficulty": ${request.difficulty},
          "points": ${request.difficulty * 10},
          "hints": [
            "Helpful hint 1",
            "Helpful hint 2"
          ]
        }
      ]`;
      
      const text = await generateContent(prompt);
      
      // Parse and validate the JSON response
      try {
        // Clean the response text to remove markdown code blocks
        let cleanedText = text.trim();
        
        // Remove markdown code blocks if present
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Remove any extra whitespace
        cleanedText = cleanedText.trim();
        
        console.log('Cleaned AI response:', cleanedText);
        
        const scenarios = JSON.parse(cleanedText);
        return this.validateScenarios(scenarios);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('Raw AI response:', text);
        // Fallback to static scenarios if AI generation fails
        return this.getFallbackScenarios(request.moduleId, request.difficulty);
      }
      
    } catch (error) {
      console.error('Error generating AI scenarios:', error);
      // Fallback to static scenarios if AI generation fails
      return this.getFallbackScenarios(request.moduleId, request.difficulty);
    }
  }
  
  // Build user context from analysis history
  private static buildUserContext(userHistory: UserAnalysisHistory | null): string {
    if (!userHistory) {
      return "New user with no analysis history.";
    }
    
    const recentAnalyses = userHistory.analyses.slice(0, 10);
    const commonTypes = this.extractCommonMisinformationTypes(recentAnalyses);
    const weakAreas = this.identifyWeakAreas(userHistory);
    
    return `
    User has completed ${recentAnalyses.length} analyses.
    Common misinformation types encountered: ${commonTypes.join(', ')}
    Areas needing improvement: ${weakAreas.join(', ')}
    Recent analysis topics: ${recentAnalyses.map(a => a.content.substring(0, 100)).join('; ')}
    `;
  }
  
  // Extract common misinformation types from user's analysis history
  private static extractCommonMisinformationTypes(analyses: AnalysisRecord[]): string[] {
    const typeMap: Record<string, number> = {};
    
    analyses.forEach(analysis => {
      analysis.misinformationTypes?.forEach(type => {
        typeMap[type] = (typeMap[type] || 0) + 1;
      });
    });
    
    return Object.entries(typeMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  }
  
  // Identify areas where user needs improvement
  private static identifyWeakAreas(userHistory: UserAnalysisHistory): string[] {
    const weakAreas: string[] = [];
    
    // Analyze low confidence scores
    const lowConfidenceAnalyses = userHistory.analyses.filter(a => a.confidence < 0.7);
    if (lowConfidenceAnalyses.length > userHistory.analyses.length * 0.3) {
      weakAreas.push("confidence in analysis");
    }
    
    // Add more weak area detection logic based on common mistakes
    if (userHistory.commonMistakes.includes('source-verification')) {
      weakAreas.push("source verification");
    }
    
    if (userHistory.commonMistakes.includes('emotional-manipulation')) {
      weakAreas.push("recognizing emotional manipulation");
    }
    
    return weakAreas;
  }
  
  // Get module-specific prompts
  private static getModulePrompt(moduleId: string, difficulty: number): string {
    const modulePrompts: Record<string, string> = {
      'basic-fact-checking': `
        Create scenarios about verifying basic information, checking sources, and identifying credible vs non-credible sources.
        Focus on practical fact-checking steps and common verification mistakes.
      `,
      'source-evaluation': `
        Generate scenarios about evaluating website credibility, domain authority, author expertise, and institutional backing.
        Include examples of misleading domains and credibility indicators.
      `,
      'emotional-manipulation': `
        Create scenarios identifying fear appeals, urgency tactics, anger manipulation, and emotional language.
        Focus on psychological triggers and how emotions bypass rational thinking.
      `,
      'statistical-misinformation': `
        Generate scenarios about misleading statistics, correlation vs causation, sample bias, and context manipulation.
        Include examples of misleading graphs and statistical fallacies.
      `,
      'visual-misinformation': `
        Create scenarios about manipulated images, misleading graphs, deepfakes, and visual context manipulation.
        Focus on technical indicators and verification methods.
      `,
      'deepfake-detection': `
        Generate scenarios about AI-generated content, deepfake indicators, synthetic media, and technical artifacts.
        Focus on advanced detection techniques and emerging AI manipulation.
      `,
      'social-media-verification': `
        Create scenarios about verifying social media accounts, viral content, coordinated campaigns, and platform-specific verification.
        Focus on account analysis and viral content verification.
      `,
      'context-verification': `
        Generate scenarios about out-of-context content, timing manipulation, geographic verification, and circumstantial analysis.
        Focus on context clues and temporal verification.
      `,
      'advanced-verification': `
        Create scenarios about cross-platform verification, bot detection, sophisticated manipulation campaigns, and advanced tools.
        Focus on coordinated behavior and network analysis.
      `
    };
    
    return modulePrompts[moduleId] || 'Create general misinformation detection scenarios.';
  }
  
  // Validate generated scenarios
  private static validateScenarios(scenarios: any[]): TrainingScenario[] {
    return scenarios.filter(scenario => {
      return scenario.id && 
             scenario.title && 
             scenario.content && 
             scenario.question && 
             scenario.correctAnswer && 
             scenario.explanation && 
             typeof scenario.difficulty === 'number' && 
             typeof scenario.points === 'number';
    });
  }
  
  // Get fallback scenarios if AI generation fails
  private static getFallbackScenarios(moduleId: string, difficulty: number): TrainingScenario[] {
    const fallbackScenarios: Record<string, TrainingScenario[]> = {
      'basic-fact-checking': [
        {
          id: 'fallback-1',
          type: 'multiple-choice',
          title: 'Quick Fact Check',
          content: 'You see a news claim that needs verification.',
          question: 'What should be your first step?',
          options: ['Share immediately', 'Check official sources', 'Ask friends', 'Ignore it'],
          correctAnswer: 'Check official sources',
          explanation: 'Always verify claims through official sources first.',
          difficulty,
          points: difficulty * 10,
          hints: ['Think about reliability', 'Official sources are most trustworthy']
        }
      ]
    };
    
    return fallbackScenarios[moduleId] || fallbackScenarios['basic-fact-checking'];
  }
  
  // Generate adaptive scenarios based on user performance
  static async generateAdaptiveContent(userId: string, moduleId: string, userPerformance: any): Promise<TrainingScenario[]> {
    // Analyze user performance to adjust difficulty
    const targetDifficulty = this.calculateAdaptiveDifficulty(userPerformance);
    
    // Get scenarios user hasn't completed
    const completedScenarios = await TrainingDatabase.getCompletedScenarios(userId, moduleId);
    const excludeIds = completedScenarios.map(s => s.scenarioId);
    
    return this.generatePersonalizedScenarios({
      userId,
      moduleId,
      difficulty: targetDifficulty,
      excludeScenarioIds: excludeIds
    });
  }
  
  // Calculate adaptive difficulty based on user performance
  private static calculateAdaptiveDifficulty(performance: any): number {
    const accuracy = performance.accuracy || 0;
    const avgTime = performance.averageTime || 30;
    
    if (accuracy > 0.8 && avgTime < 20) {
      return 3; // Increase difficulty
    } else if (accuracy < 0.6) {
      return 1; // Decrease difficulty
    } else {
      return 2; // Maintain current difficulty
    }
  }
  
  // Save user interaction for future content generation
  static async recordUserInteraction(userId: string, interaction: {
    scenarioId: string;
    moduleId: string;
    wasCorrect: boolean;
    timeSpent: number;
    hintsUsed: number;
    misinformationType: string;
  }): Promise<void> {
    try {
      // Update user's analysis history with this interaction
      const analysisRecord: AnalysisRecord = {
        id: interaction.scenarioId,
        content: `Training scenario: ${interaction.misinformationType}`,
        result: { correct: interaction.wasCorrect, timeSpent: interaction.timeSpent },
        timestamp: new Date(),
        misinformationTypes: [interaction.misinformationType],
        confidence: interaction.wasCorrect ? 1.0 : 0.3
      };
      
      await TrainingDatabase.saveAnalysisHistory(userId, analysisRecord);
    } catch (error) {
      console.error('Error recording user interaction:', error);
    }
  }
}