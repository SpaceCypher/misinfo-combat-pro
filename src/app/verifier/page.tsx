'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Search, FileText, Link as LinkIcon, CheckCircle, XCircle, AlertCircle, ExternalLink, Upload, Image, Video, Play, Download, Share2, Save } from 'lucide-react';

export default function Verifier() {
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'image' | 'video'>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleVerify = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      setResults({
        overallCredibility: '67% Reliable',
        claims: [
          {
            id: 1,
            text: "The new government policy will reduce unemployment by 15% within six months, according to official statistics released yesterday.",
            status: 'verified',
            confidence: 88,
            sources: [
              { name: 'Official Government Portal', type: 'Government', credibility: 'high' },
              { name: 'Times of India', type: 'Media', credibility: 'medium' }
            ],
            explanation: "Confirmed by official government sources and verified against PMO announcements."
          },
          {
            id: 2,
            text: "The program has already created 50,000 jobs in major cities.",
            status: 'unverified',
            confidence: 94,
            sources: [],
            explanation: "No official sources found to support this specific job creation number."
          },
          {
            id: 3,
            text: "Statistics released yesterday.",
            status: 'partial',
            confidence: 94,
            sources: [
              { name: 'Released 3 days ago', type: 'Timing', credibility: 'medium' }
            ],
            explanation: "Date discrepancy found in the claim."
          }
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'VERIFIED';
      case 'unverified':
        return 'UNVERIFIED';
      case 'partial':
        return 'PARTIAL';
      default:
        return 'UNKNOWN';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unverified':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'partial':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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
                <span className="text-xl font-bold text-gray-900">Real-Time Claim Verifier</span>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
              <Link href="/training" className="text-gray-600 hover:text-gray-900 transition-colors">Training</Link>
              <Link href="/analyzer" className="text-gray-600 hover:text-gray-900 transition-colors">Analyze</Link>
              <Link href="/verifier" className="text-purple-600 font-medium border-b-2 border-purple-600">Verify</Link>
            </nav>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">Level 3</span>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Real-Time Claim Verifier</h1>
          <p className="text-lg text-gray-600">Extract and verify factual claims from any content. Get instant credibility scores and source verification.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Submit Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Submit Content Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Content for Verification</h2>

              {/* Tab Navigation */}
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 py-2 px-4 text-center font-medium rounded-md transition-all ${
                    activeTab === 'text'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Paste Text Content
                </button>
                <button
                  onClick={() => setActiveTab('url')}
                  className={`flex-1 py-2 px-4 text-center font-medium rounded-md transition-all ${
                    activeTab === 'url'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 inline mr-2" />
                  Or Analyze Article URL
                </button>
                <button
                  onClick={() => setActiveTab('image')}
                  className={`flex-1 py-2 px-4 text-center font-medium rounded-md transition-all ${
                    activeTab === 'image'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Image className="w-4 h-4 inline mr-2" />
                  Upload Image
                </button>
                <button
                  onClick={() => setActiveTab('video')}
                  className={`flex-1 py-2 px-4 text-center font-medium rounded-md transition-all ${
                    activeTab === 'video'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Video className="w-4 h-4 inline mr-2" />
                  Upload Video
                </button>
              </div>

              {/* Input Areas */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste Text Content
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste content here for claim verification..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none placeholder-gray-600 text-gray-900"
                  />
                </div>
              )}

              {activeTab === 'url' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Analyze Article URL
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/article"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-600 text-gray-900"
                    />
                    <button className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Analyze Article</span>
                    </button>
                  </div>
                </div>
              )}

              {(activeTab === 'image' || activeTab === 'video') && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload {activeTab === 'image' ? 'Image' : 'Video'} File
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-purple-500 bg-purple-50'
                        : selectedFile
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          {activeTab === 'image' ? (
                            <Image className="w-8 h-8 text-green-600" />
                          ) : (
                            <Video className="w-8 h-8 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-gray-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Drag and drop your {activeTab} here, or click to browse
                          </p>
                          <p className="text-gray-600 mt-2">
                            {activeTab === 'image' ? 'Supports JPG, PNG, GIF up to 10MB' : 'Supports MP4, MOV, AVI up to 100MB'}
                          </p>
                        </div>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept={activeTab === 'image' ? 'image/*' : 'video/*'}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg cursor-pointer inline-block transition-colors"
                        >
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={isAnalyzing || (!textInput.trim() && !urlInput.trim() && !selectedFile)}
                className="w-full mt-6 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>{isAnalyzing ? 'Analyzing Content...' : 'Start Verification'}</span>
              </button>
            </div>

            {/* Analyzing Content Status */}
            {isAnalyzing && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Analyzing Content...</h3>
                </div>
                <p className="text-gray-600 mb-4">Extracting claims and verifying sources</p>
                <div className="bg-gray-100 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '67%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Processing claims... 67%</p>
              </div>
            )}

            {/* Verification Results */}
            {results && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Verification Results</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Overall Credibility:</span>
                    <span className="font-semibold text-blue-600">{results.overallCredibility}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Extracted Claims</h4>
                  {results.claims.map((claim: any) => (
                    <div key={claim.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(claim.status)}
                          <span className={`font-semibold text-sm ${claim.status === 'verified' ? 'text-green-600' : claim.status === 'unverified' ? 'text-red-600' : 'text-yellow-600'}`}>
                            Claim {claim.id}: {getStatusText(claim.status)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">Credibility: {claim.confidence}%</span>
                      </div>
                      
                      <p className="text-gray-800 mb-3 italic">"{claim.text}"</p>
                      
                      {claim.sources.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Sources:</p>
                          <div className="space-y-1">
                            {claim.sources.map((source: any, index: number) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <span className="text-gray-700">{source.name}</span>
                                {source.type && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                    {source.type}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600">{claim.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How to Verify This Yourself */}
            {results && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">How to Verify This Yourself</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Check Official Sources</h4>
                      <p className="text-gray-600 text-sm">Visit government websites and official press releases for policy announcements.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Cross-Reference Statistics</h4>
                      <p className="text-gray-600 text-sm">Look for employment data from multiple reliable sources like labor departments.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Verify Timelines</h4>
                      <p className="text-gray-600 text-sm">Check publication dates and ensure claims match announcement dates.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Methodology & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Our Methodology */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Our Methodology</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Search className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Claim Extraction</h4>
                    <p className="text-gray-600 text-sm">AI identifies factual statements that can be verified</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Source Checking</h4>
                    <p className="text-gray-600 text-sm">Cross-references against trusted databases and official sources</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Credibility Scoring</h4>
                    <p className="text-gray-600 text-sm">Assigns reliability scores based on source quality and evidence</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {results && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export Report</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span>Share Results</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Save className="w-4 h-4" />
                    <span>Save Analysis</span>
                  </button>
                </div>
              </div>
            )}

            {/* Verification Tips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Verification Tips</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                  <p className="text-gray-600 text-sm">Always check multiple sources for important claims</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                  <p className="text-gray-600 text-sm">Verify dates and timelines for accuracy</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                  <p className="text-gray-600 text-sm">Look for author credentials and source reputation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}