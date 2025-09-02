'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Search, FileText, Link as LinkIcon, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function Verifier() {
  const [activeTab, setActiveTab] = useState<'text' | 'url'>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleVerify = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      setResults({
        claims: [
          {
            id: 1,
            text: "PM announced 15% GDP growth",
            confidence: 0.95,
            status: 'unverified',
            sources: [],
            explanation: "No official announcement found in PMO press releases or RBI statements."
          },
          {
            id: 2,
            text: "India's economy is growing rapidly",
            confidence: 0.87,
            status: 'verified',
            sources: [
              { name: 'RBI Official Report', url: 'https://rbi.org.in', credibility: 'high' },
              { name: 'Ministry of Finance', url: 'https://finmin.nic.in', credibility: 'high' }
            ],
            explanation: "Confirmed by multiple government sources and economic indicators."
          }
        ],
        overallCredibility: 'mixed',
        riskScore: 65
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'unverified':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unverified':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Claim Verifier</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Real-Time Claim Verification
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Extract and verify factual claims from any content. Get instant verification against trusted Indian sources with educational context.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Input Content</h2>

            {/* Tab Navigation */}
            <div className="flex mb-6">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 px-4 text-center font-medium rounded-l-lg border transition-colors ${
                  activeTab === 'text'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Text Input
              </button>
              <button
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 px-4 text-center font-medium rounded-r-lg border-t border-r border-b transition-colors ${
                  activeTab === 'url'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <LinkIcon className="w-4 h-4 inline mr-2" />
                URL Input
              </button>
            </div>

            {/* Input Areas */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste the content you want to fact-check. Our AI will extract claims and verify them against trusted sources..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            )}

            {activeTab === 'url' && (
              <div className="space-y-4">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-gray-600 text-sm">
                  We'll extract and verify claims from the webpage content.
                </p>
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={isAnalyzing || (!textInput.trim() && !urlInput.trim())}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isAnalyzing ? 'Verifying Claims...' : 'Verify Claims'}
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Verification Results</h2>

            {!results && !isAnalyzing && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Enter content above and click "Verify Claims" to see results
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing claims and checking sources...</p>
              </div>
            )}

            {results && (
              <div className="space-y-6">
                {/* Overall Assessment */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Overall Risk Score</span>
                    <span className={`font-bold ${results.riskScore > 70 ? 'text-red-600' : results.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {results.riskScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${results.riskScore > 70 ? 'bg-red-600' : results.riskScore > 40 ? 'bg-yellow-600' : 'bg-green-600'}`}
                      style={{ width: `${results.riskScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Individual Claims */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Extracted Claims</h3>
                  {results.claims.map((claim: any) => (
                    <div key={claim.id} className={`border rounded-lg p-4 ${getStatusColor(claim.status)}`}>
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(claim.status)}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">"{claim.text}"</p>
                          <p className="text-sm text-gray-700 mb-3">{claim.explanation}</p>
                          
                          {claim.sources.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-2">Sources:</p>
                              <div className="space-y-1">
                                {claim.sources.map((source: any, index: number) => (
                                  <div key={index} className="flex items-center space-x-2 text-sm">
                                    <ExternalLink className="w-3 h-3" />
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {source.name}
                                    </a>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      source.credibility === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {source.credibility} credibility
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-2 text-xs text-gray-600">
                            Confidence: {Math.round(claim.confidence * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Educational Context */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">How to Verify Similar Claims</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Check official government websites (PIB, RBI, Election Commission)</li>
                    <li>• Cross-reference with multiple credible news sources</li>
                    <li>• Look for primary sources and official statements</li>
                    <li>• Be cautious of claims without verifiable sources</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trusted Sources */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Our Trusted Sources</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">PIB Fact Check</h3>
              <p className="text-sm text-gray-600">Government fact-checking</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">RBI</h3>
              <p className="text-sm text-gray-600">Financial information</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Election Commission</h3>
              <p className="text-sm text-gray-600">Electoral information</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900">Alt News</h3>
              <p className="text-sm text-gray-600">Independent fact-checking</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}