'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Image,
  Video,
  Link as LinkIcon,
  BarChart3,
  ExternalLink,
  Copy,
  Download,
  Share2,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/lib/simple-auth-context';
import { getAnalysisById, AnalysisHistoryItem } from '@/lib/analysis-service';

const AnalysisDetailContent = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get('id');
  const [analysis, setAnalysis] = useState<AnalysisHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Load analysis from Firestore
  useEffect(() => {
    const loadAnalysis = async () => {
      if (!analysisId) {
        setLoading(false);
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getAnalysisById(analysisId, user.uid);
        if (data) {
          setAnalysis(data);
        }
      } catch (error) {
        console.error('Error loading analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [analysisId, user]);

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-600 bg-green-100 border-green-200';
    if (score <= 70) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getRiskIcon = (score: number) => {
    if (score <= 30) return <CheckCircle className="w-6 h-6" />;
    if (score <= 70) return <AlertTriangle className="w-6 h-6" />;
    return <Shield className="w-6 h-6" />;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-6 h-6" />;
      case 'image': return <Image className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'url': return <LinkIcon className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const formatDate = (timestamp: Date) => {
    return timestamp.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyResults = () => {
    if (!analysis) return;
    
    const sourcesText = analysis.sources && analysis.sources.length > 0 
      ? `\n\nSources:\n${analysis.sources.map((source: string, index: number) => 
          `${index + 1}. ${source}`
        ).join('\n')}`
      : '';
    
    const resultText = `Analysis Result:\nRisk Score: ${analysis.score}/100\nSummary: ${analysis.score >= 80 ? 'High Risk' : analysis.score >= 60 ? 'Medium Risk' : analysis.score >= 40 ? 'Low Risk' : 'Very Low Risk'}\n\nContent Analyzed:\n${analysis.content}\n\nDetailed Analysis:\n${analysis.explanation}\n\nRecommendations:\n${analysis.recommendations}${sourcesText}`;
    
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/analysis-detail?id=${analysis?.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!analysis) return;
    
    const dataToExport = {
      id: analysis.id,
      timestamp: analysis.timestamp,
      type: analysis.type,
      content: analysis.content,
      score: analysis.score,
      explanation: analysis.explanation,
      recommendations: analysis.recommendations,
      sources: analysis.sources
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${analysis.id}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis details...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Not Found</h2>
          <p className="text-gray-600 mb-6">The requested analysis could not be found.</p>
          <Link
            href="/history"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to History</span>
          </Link>
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
                href="/history"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to History</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={handleCopyResults}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analysis Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                {getTypeIcon(analysis.type)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {analysis.score >= 80 ? 'High Risk Content Detected' :
                   analysis.score >= 60 ? 'Medium Risk Content' :
                   analysis.score >= 40 ? 'Low Risk Content' : 'Content Appears Safe'}
                </h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-700">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(analysis.timestamp instanceof Date ? analysis.timestamp : analysis.timestamp.toDate())}</span>
                  </div>
                  <span className="capitalize">{analysis.type} Analysis</span>
                </div>
              </div>
            </div>
            
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getRiskColor(analysis.score)}`}>
              {getRiskIcon(analysis.score)}
              <span className="font-semibold">{analysis.score}% Risk</span>
            </div>
          </div>

          {/* Content Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Content Analyzed:</h3>
            <p className="text-gray-700 leading-relaxed">
              {analysis.type === 'url' ? (
                <a href={analysis.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  {analysis.content}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              ) : (
                analysis.content
              )}
            </p>
          </div>

          {/* Metadata */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Analysis Metadata:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-700 font-medium">Word Count:</span>
                <span className="ml-2 font-semibold text-gray-900">{analysis.type === 'text' ? analysis.content.split(' ').length : 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-700 font-medium">Content Type:</span>
                <span className="ml-2 font-semibold text-gray-900 capitalize">{analysis.type}</span>
              </div>
              <div>
                <span className="text-gray-700 font-medium">Risk Score:</span>
                <span className="ml-2 font-semibold text-gray-900">{analysis.score}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Detailed Analysis</h2>
          
          {/* Explanation */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">AI Analysis Results</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{analysis.explanation}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recommendations</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-900 leading-relaxed">{analysis.recommendations}</p>
            </div>
          </div>
        </div>

        {/* Sources */}
        {analysis.sources && analysis.sources.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Sources Verified</h2>
            <div className="space-y-4">
              {analysis.sources.map((source: string, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <p className="text-gray-700 flex-1">{source}</p>
                    {source.startsWith('http') && (
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 ml-3 flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default function AnalysisDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analysis details...</p>
        </div>
      </div>
    }>
      <AnalysisDetailContent />
    </Suspense>
  );
}
