'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  ArrowLeft, 
  Share2, 
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Globe,
  Lock,
  Copy,
  FileText
} from 'lucide-react';

interface SharedReport {
  id: string;
  timestamp: Date | string;
  type: string;
  content: string;
  overallCredibility: string;
  claims: any[];
  summary: string;
  sharedBy: string;
  sharedAt: Date | string;
  analysisType: string;
  claimsFound: number;
}

export default function SharedReportPage() {
  const searchParams = useSearchParams();
  const [report, setReport] = useState<SharedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const reportId = searchParams.get('id');
    if (reportId) {
      loadSharedReport(reportId);
    } else {
      setError('No report ID provided');
      setLoading(false);
    }
  }, [searchParams]);

  const loadSharedReport = (reportId: string) => {
    try {
      const sharedReports = JSON.parse(localStorage.getItem('sharedReports') || '[]');
      const foundReport = sharedReports.find((r: SharedReport) => r.id === reportId);
      
      if (foundReport) {
        // Convert timestamp strings back to Date objects
        const reportWithDates = {
          ...foundReport,
          timestamp: typeof foundReport.timestamp === 'string' ? new Date(foundReport.timestamp) : foundReport.timestamp,
          sharedAt: typeof foundReport.sharedAt === 'string' ? new Date(foundReport.sharedAt) : foundReport.sharedAt
        };
        setReport(reportWithDates);
      } else {
        setError('Report not found or link has expired');
      }
    } catch (error) {
      console.error('Error loading shared report:', error);
      setError('Failed to load shared report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!report) return;

    try {
      let reportText = `SHARED VERIFICATION REPORT\n`;
      reportText += `Generated: ${new Date(report.timestamp).toLocaleString()}\n`;
      reportText += `Shared: ${new Date(report.sharedAt).toLocaleString()}\n`;
      reportText += `Content Type: ${report.type.toUpperCase()}\n`;
      reportText += `Overall Credibility: ${report.overallCredibility}\n\n`;

      if (report.summary) {
        reportText += `SUMMARY:\n${report.summary}\n\n`;
      }

      reportText += `CONTENT ANALYZED:\n"${report.content}"\n\n`;

      if (report.claims && report.claims.length > 0) {
        reportText += `EXTRACTED CLAIMS (${report.claims.length} found):\n\n`;
        
        report.claims.forEach((claim: any, index: number) => {
          reportText += `CLAIM ${index + 1}: ${claim.status?.toUpperCase() || 'UNKNOWN'}\n`;
          reportText += `Text: "${claim.text}"\n`;
          reportText += `Credibility: ${claim.confidence}%\n`;
          
          if (claim.type) {
            reportText += `Type: ${claim.type}\n`;
          }
          
          if (claim.explanation || claim.detailedExplanation) {
            reportText += `Analysis: ${claim.detailedExplanation || claim.explanation}\n`;
          }

          reportText += `\n`;
        });
      }

      reportText += `\n---\nShared via MisInfo Combat Pro`;

      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shared-verification-report-${report.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link to clipboard');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'unverified':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCredibilityColor = (credibility: string) => {
    if (credibility.includes('High')) return 'text-green-700 bg-green-100 border-green-200';
    if (credibility.includes('Medium')) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    if (credibility.includes('Low') || credibility.includes('Very Low')) return 'text-red-700 bg-red-100 border-red-200';
    return 'text-gray-700 bg-gray-100 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Available</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>Go to MisInfo Combat Pro</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to Home</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Shared Report</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleCopyLink}
                className={`flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg transition-colors ${
                  copySuccess 
                    ? 'bg-green-50 border-green-300 text-green-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
              </button>
              
              <button
                onClick={handleExportReport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
        {/* Report Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getCredibilityColor(report.overallCredibility)}`}>
                  {report.overallCredibility}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                  {report.type}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {report.summary || 'Verification Analysis Report'}
              </h2>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Analyzed: {new Date(report.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Share2 className="w-4 h-4" />
                  <span>Shared: {new Date(report.sharedAt).toLocaleString()}</span>
                </div>
                {report.claimsFound !== undefined && (
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>Claims: {report.claimsFound}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Analyzed */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Analyzed</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-800 leading-relaxed">{report.content}</p>
            </div>
          </div>
        </div>

        {/* Claims Analysis */}
        {report.claims && report.claims.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Claims Analysis ({report.claims.length} claims found)
            </h3>
            <div className="space-y-4">
              {report.claims.map((claim: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-1">
                      {getStatusIcon(claim.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          Claim {index + 1}: {claim.status?.toUpperCase() || 'UNKNOWN'}
                        </h4>
                        <span className="text-sm font-medium text-gray-600">
                          Credibility: {claim.confidence}%
                        </span>
                      </div>
                      
                      <blockquote className="text-gray-800 italic mb-3 border-l-4 border-blue-200 pl-4">
                        "{claim.text}"
                      </blockquote>
                      
                      {claim.type && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Type:</span> {claim.type}
                        </p>
                      )}
                      
                      {(claim.explanation || claim.detailedExplanation) && (
                        <div className="bg-white rounded p-3 border border-gray-200">
                          <h5 className="font-medium text-gray-900 mb-2">Analysis:</h5>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {claim.detailedExplanation || claim.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Public Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Eye className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-1">Public Report</h4>
              <p className="text-sm text-amber-700">
                This verification report has been shared publicly. Anyone with this link can view the analysis results. 
                The report was generated using MisInfo Combat Pro's AI-powered verification system.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Powered by</span>
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-700">
              MisInfo Combat Pro
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            AI-powered misinformation detection and fact verification platform
          </p>
        </div>
      </main>
    </div>
  );
}
