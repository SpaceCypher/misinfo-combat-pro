import { Timestamp } from 'firebase/firestore';

export interface AnalysisHistoryItem {
  id?: string;
  type: 'text' | 'image' | 'video' | 'url';
  content: string;
  score: number;
  explanation: string;
  recommendations: string;
  sources: string[];
  timestamp: Date | Timestamp;
  userId?: string;
}