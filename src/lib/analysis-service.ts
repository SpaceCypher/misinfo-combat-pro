import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  deleteDoc, 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

export interface AnalysisHistoryItem {
  id?: string;
  userId?: string;
  type: 'text' | 'image' | 'video' | 'url';
  content: string;
  score: number;
  explanation: string;
  recommendations: string;
  sources: string[];
  timestamp: Date | Timestamp;
}export interface AnalysisStats {
  totalAnalyses: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

const COLLECTION_NAME = 'analysisHistory';

/**
 * Save a new analysis to Firestore
 */
export async function saveAnalysis(analysis: Omit<AnalysisHistoryItem, 'id' | 'timestamp'>): Promise<string> {
  try {
    const analysisData = {
      ...analysis,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), analysisData);
    console.log('Analysis saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw new Error('Failed to save analysis');
  }
}

/**
 * Get all analyses for a specific user
 */
export async function getUserAnalyses(
  userId: string, 
  limitParam: number = 50,
  filterType?: 'all' | 'text' | 'image' | 'video' | 'url',
  filterRisk?: 'all' | 'low' | 'medium' | 'high',
  sortBy: 'newest' | 'oldest' | 'risk-high' | 'risk-low' = 'newest'
): Promise<AnalysisHistoryItem[]> {
  try {
    // Simplified query - just filter by userId, sort client-side to avoid index requirements
    let q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      limit(Math.max(limitParam, 100)) // Get more to allow for client-side filtering
    );

    const querySnapshot = await getDocs(q);
    let analyses: AnalysisHistoryItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const analysis: AnalysisHistoryItem = {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        content: data.content,
        score: data.score || data.risk_score || 0,
        explanation: data.explanation || data.explanation_html || '',
        recommendations: data.recommendations || '',
        sources: data.sources || [],
        timestamp: data.timestamp?.toDate() || new Date()
      };
      analyses.push(analysis);
    });

    // Client-side filtering and sorting
    // Filter by type
    if (filterType && filterType !== 'all') {
      analyses = analyses.filter(analysis => analysis.type === filterType);
    }

    // Filter by risk level
    if (filterRisk && filterRisk !== 'all') {
      analyses = analyses.filter(analysis => {
        switch (filterRisk) {
          case 'low':
            return analysis.score <= 30;
          case 'medium':
            return analysis.score > 30 && analysis.score <= 70;
          case 'high':
            return analysis.score > 70;
          default:
            return true;
        }
      });
    }

    // Sort analyses
    analyses.sort((a, b) => {
      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : a.timestamp.toDate().getTime();
      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : b.timestamp.toDate().getTime();
      
      switch (sortBy) {
        case 'newest':
          return bTime - aTime;
        case 'oldest':
          return aTime - bTime;
        case 'risk-high':
          return b.score - a.score;
        case 'risk-low':
          return a.score - b.score;
        default:
          return bTime - aTime;
      }
    });

    // Apply final limit
    return analyses.slice(0, limitParam);
  } catch (error) {
    console.error('Error fetching user analyses:', error);
    throw new Error('Failed to fetch analyses');
  }
}

/**
 * Get a specific analysis by ID
 */
export async function getAnalysisById(analysisId: string, userId: string): Promise<AnalysisHistoryItem | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, analysisId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Verify the analysis belongs to the user
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to analysis');
      }

      return {
        id: docSnap.id,
        userId: data.userId,
        type: data.type,
        content: data.content,
        score: data.score || data.risk_score || 0,
        explanation: data.explanation || data.explanation_html || '',
        recommendations: data.recommendations || '',
        sources: data.sources || [],
        timestamp: data.timestamp?.toDate() || new Date()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching analysis:', error);
    throw new Error('Failed to fetch analysis');
  }
}

/**
 * Delete an analysis
 */
export async function deleteAnalysis(analysisId: string, userId: string): Promise<void> {
  try {
    // First verify the analysis belongs to the user
    const analysis = await getAnalysisById(analysisId, userId);
    if (!analysis) {
      throw new Error('Analysis not found or unauthorized');
    }

    await deleteDoc(doc(db, COLLECTION_NAME, analysisId));
    console.log('Analysis deleted:', analysisId);
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw new Error('Failed to delete analysis');
  }
}

/**
 * Delete multiple analyses
 */
export async function deleteMultipleAnalyses(analysisIds: string[], userId: string): Promise<void> {
  try {
    const deletePromises = analysisIds.map(id => deleteAnalysis(id, userId));
    await Promise.all(deletePromises);
    console.log('Multiple analyses deleted:', analysisIds);
  } catch (error) {
    console.error('Error deleting multiple analyses:', error);
    throw new Error('Failed to delete analyses');
  }
}

/**
 * Get analysis statistics for a user
 */
export async function getUserAnalysisStats(userId: string): Promise<AnalysisStats> {
  try {
    const analyses = await getUserAnalyses(userId, 1000); // Get all analyses for stats

    const stats: AnalysisStats = {
      totalAnalyses: analyses.length,
      highRisk: analyses.filter(a => a.score > 70).length,
      mediumRisk: analyses.filter(a => a.score > 30 && a.score <= 70).length,
      lowRisk: analyses.filter(a => a.score <= 30).length
    };

    return stats;
  } catch (error) {
    console.error('Error fetching analysis stats:', error);
    throw new Error('Failed to fetch analysis statistics');
  }
}

/**
 * Search analyses by content or summary
 */
export async function searchUserAnalyses(
  userId: string, 
  searchTerm: string, 
  limit: number = 50
): Promise<AnalysisHistoryItem[]> {
  try {
    // Get all user analyses first (Firestore doesn't support text search natively)
    const allAnalyses = await getUserAnalyses(userId, 1000);
    
    // Filter by search term
    const searchTermLower = searchTerm.toLowerCase();
    const filteredAnalyses = allAnalyses.filter(analysis => 
      analysis.content.toLowerCase().includes(searchTermLower) ||
      analysis.explanation.toLowerCase().includes(searchTermLower)
    );

    return filteredAnalyses.slice(0, limit);
  } catch (error) {
    console.error('Error searching analyses:', error);
    throw new Error('Failed to search analyses');
  }
}

/**
 * Update an existing analysis
 */
export async function updateAnalysis(
  analysisId: string, 
  userId: string, 
  updates: Partial<AnalysisHistoryItem>
): Promise<void> {
  try {
    // First verify the analysis belongs to the user
    const analysis = await getAnalysisById(analysisId, userId);
    if (!analysis) {
      throw new Error('Analysis not found or unauthorized');
    }

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, COLLECTION_NAME, analysisId), updateData);
    console.log('Analysis updated:', analysisId);
  } catch (error) {
    console.error('Error updating analysis:', error);
    throw new Error('Failed to update analysis');
  }
}

/**
 * Export user analyses to JSON
 */
export async function exportUserAnalyses(userId: string): Promise<string> {
  try {
    const analyses = await getUserAnalyses(userId, 1000);
    
    const exportData = {
      exportDate: new Date().toISOString(),
      userId: userId,
      totalAnalyses: analyses.length,
      analyses: analyses.map(analysis => ({
        ...analysis,
        timestamp: analysis.timestamp instanceof Date ? analysis.timestamp.toISOString() : analysis.timestamp
      }))
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting analyses:', error);
    throw new Error('Failed to export analyses');
  }
}
