'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { Shield, Upload, FileText, Image, Video, Link as LinkIcon, ArrowLeft, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/simple-auth-context';
import { saveAnalysis } from '@/lib/analysis-service';

export default function Analyzer() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const analysisResultRef = useRef<HTMLDivElement>(null);
  
  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.photoURL]);
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'text'>('text');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    risk_score: number;
    summary_title: string;
    explanation_html: string;
    sources?: Array<{
      title: string;
      link: string;
      snippet: string;
      source: string;
    }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-scroll to results when analysis completes
  useEffect(() => {
    if (analysisResult && analysisResultRef.current) {
      setTimeout(() => {
        analysisResultRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [analysisResult]);

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

  const handleAnalyze = async () => {
    if (!textInput.trim() && !urlInput.trim() && !selectedFile) {
      setError('Please enter text, URL, or upload a file to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      let requestBody: any = {};

      if (activeTab === 'text' && textInput.trim()) {
        requestBody = { text: textInput.trim() };
      } else if (activeTab === 'upload' && selectedFile) {
        // Convert file to base64
        const fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        requestBody = {
          file: {
            data: fileData,
            type: selectedFile.type,
            name: selectedFile.name
          }
        };
      } else if (activeTab === 'url' && urlInput.trim()) {
        requestBody = { url: urlInput.trim() };
      } else {
        setError('Please provide valid input for analysis.');
        return;
      }

      const response = await fetch('https://us-central1-optical-habitat-470918-f2.cloudfunctions.net/misinfo-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          setError('Service is temporarily busy due to high demand. Please try again in a few minutes.');
        } else {
          throw new Error(`Analysis failed: ${response.status} - ${result.error || 'Unknown error'}`);
        }
        return;
      }

      setAnalysisResult(result);
      
      // Save to analysis history in Firestore
      if (user?.uid) {
        try {
          // Map activeTab to proper type
          const getContentType = (): 'text' | 'image' | 'video' | 'url' => {
            if (activeTab === 'upload') {
              if (selectedFile?.type.startsWith('image/')) return 'image';
              if (selectedFile?.type.startsWith('video/')) return 'video';
              return 'text'; // fallback for other file types
            }
            return activeTab as 'text' | 'url';
          };

          const historyItem = {
            userId: user.uid,
            type: getContentType(),
            content: activeTab === 'text' ? textInput : 
                    activeTab === 'url' ? urlInput : 
                    selectedFile?.name || 'Unknown file',
            score: result.risk_score,
            explanation: result.explanation_html?.replace(/<[^>]*>/g, '') || result.summary_title || 'Analysis completed',
            recommendations: 'Please verify this information from reliable sources before sharing.',
            sources: Array.isArray(result.sources) ? result.sources.map((s: any) => typeof s === 'string' ? s : s.link || s.title || 'Unknown source') : []
          };
          
          await saveAnalysis(historyItem);
          console.log('Analysis saved to Firestore successfully');
        } catch (error) {
          console.error('Failed to save analysis to Firestore:', error);
          // Continue execution even if save fails
        }
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">MisInfo Combat Pro</h1>
            </div>

            {/* Center - Navigation */}
            <nav className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/training"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Training
              </Link>
              <Link
                href="/analyzer"
                className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
                aria-current="page"
              >
                Analyze
              </Link>
              <Link
                href="/verifier"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Verify
              </Link>
            </nav>

            {/* Right side - Profile */}
            <div className="relative">
              <div 
                className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                onMouseEnter={() => setShowProfileDropdown(true)}
                onMouseLeave={() => setShowProfileDropdown(false)}
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-gray-700">Level 3</span>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user?.photoURL && !imageError ? (
                    <img 
                      src={`/api/proxy-image?url=${encodeURIComponent(user.photoURL)}`}
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Proxy image failed, trying direct URL:', user?.photoURL);
                        e.currentTarget.src = user?.photoURL || '';
                        e.currentTarget.onerror = () => {
                          console.log('Direct URL also failed');
                          setImageError(true);
                        };
                      }}
                      onLoad={() => console.log('Image loaded successfully via proxy')}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.displayName ? 
                          user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : 
                          user?.email?.[0]?.toUpperCase() || 'U'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div 
                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  onMouseEnter={() => setShowProfileDropdown(true)}
                  onMouseLeave={() => setShowProfileDropdown(false)}
                >
                  <Link 
                    href="/profile" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mr-3"></div>
                    Profile
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        await logout();
                        window.location.href = '/';
                      } catch (error) {
                        console.error('Error signing out:', error);
                      }
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-4 h-4 rounded-full bg-gray-400 mr-3"></div>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI-Powered Misinformation Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload content or paste a URL to get instant analysis with detailed explanations of potential misinformation patterns.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Analysis Input (2/3 width) */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'upload'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab('url')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'url'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 inline mr-2" />
                  Paste URL
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'text'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Paste Text
                </button>
              </div>
            </div>

        {/* Content Input Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {activeTab === 'upload' && (
            <div>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
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
                      {selectedFile.type.startsWith('image/') ? (
                        <Image className="w-8 h-8 text-green-600" />
                      ) : selectedFile.type.startsWith('video/') ? (
                        <Video className="w-8 h-8 text-green-600" />
                      ) : (
                        <FileText className="w-8 h-8 text-green-600" />
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
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-gray-600 mt-2">
                        Supports text files, images (JPG, PNG, GIF, WebP), and videos (MP4, MOV, AVI, MKV)
                      </p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".txt,.pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.mkv"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg cursor-pointer inline-block transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4">
              <label htmlFor="url-input" className="block text-lg font-medium text-gray-900">
                Enter URL to analyze
              </label>
              <input
                id="url-input"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600"
              />
              <p className="text-gray-600">
                We'll analyze the content from the webpage, including text, images, and metadata.
              </p>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-4">
              <label htmlFor="text-input" className="block text-lg font-medium text-gray-900">
                Paste text content to analyze
              </label>
              <textarea
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste the text content you want to analyze for misinformation patterns..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-600"
              />
              <p className="text-gray-600">
                Our AI will analyze the text for emotional manipulation, false statistics, and other misinformation patterns.
              </p>
            </div>
          )}

          {/* Analyze Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleAnalyze}
              disabled={(!selectedFile && !urlInput.trim() && !textInput.trim()) || isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center mx-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Content'
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Analysis Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div 
            ref={analysisResultRef}
            className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-lg p-8 relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full transform translate-x-16 -translate-y-16 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-50 to-blue-50 rounded-full transform -translate-x-12 translate-y-12 opacity-60"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-8">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl mr-4 shadow-lg">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Analysis Complete</h2>
                  <p className="text-gray-600 mt-1">Your content has been thoroughly analyzed</p>
                </div>
              </div>

            <div className="space-y-8">
              {/* Risk Score */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  Risk Assessment
                </h3>
                
                {/* Score Display */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div className="flex items-center space-x-6 mb-4 lg:mb-0">
                    <div className="relative">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                        analysisResult.risk_score <= 30 
                          ? 'bg-gradient-to-br from-green-400 to-green-600' 
                          : analysisResult.risk_score <= 70 
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                          : 'bg-gradient-to-br from-red-400 to-red-600'
                      }`}>
                        {analysisResult.risk_score}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-full shadow border">
                          /100
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`inline-flex px-4 py-2 rounded-lg text-base font-semibold shadow-sm ${
                        analysisResult.risk_score <= 30 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : analysisResult.risk_score <= 70 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {analysisResult.summary_title}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">
                        {analysisResult.risk_score <= 30 
                          ? 'Low risk of misinformation' 
                          : analysisResult.risk_score <= 70 
                          ? 'Moderate risk detected'
                          : 'High risk of misinformation'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-700 font-medium">
                    <span>Risk Level</span>
                    <span className="font-semibold">{analysisResult.risk_score}% Risk Score</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-300 rounded-full h-4 shadow-inner">
                      <div 
                        className={`h-4 rounded-full transition-all duration-1000 ease-out shadow-sm ${
                          analysisResult.risk_score <= 30 
                            ? 'bg-gradient-to-r from-green-400 to-green-500' 
                            : analysisResult.risk_score <= 70 
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                            : 'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ width: `${Math.max(analysisResult.risk_score, 8)}%` }}
                      ></div>
                    </div>
                    {/* Risk level markers */}
                    <div className="flex justify-between mt-2 text-xs text-gray-600 font-medium">
                      <span className="flex flex-col items-center">
                        <div className="w-1 h-2 bg-green-400 rounded-full mb-1"></div>
                        Low
                      </span>
                      <span className="flex flex-col items-center">
                        <div className="w-1 h-2 bg-yellow-400 rounded-full mb-1"></div>
                        Medium
                      </span>
                      <span className="flex flex-col items-center">
                        <div className="w-1 h-2 bg-red-400 rounded-full mb-1"></div>
                        High
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  Detailed Analysis
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                  <div 
                    className="text-gray-800 leading-relaxed prose max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:mb-4 prose-ul:my-4 prose-li:mb-2 prose-strong:text-gray-900 prose-p:text-gray-800"
                    dangerouslySetInnerHTML={{ __html: analysisResult.explanation_html }}
                  />
                </div>
              </div>

              {/* Sources Section */}
              {analysisResult.sources && analysisResult.sources.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    Sources & References
                  </h3>
                  <div className="space-y-4">
                    {analysisResult.sources.map((source, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-base font-semibold text-gray-900 line-clamp-2">
                                <a 
                                  href={source.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {source.title}
                                </a>
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                              {source.snippet}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700 bg-gray-200 px-2 py-1 rounded-full font-medium">
                                {source.source}
                              </span>
                              <a 
                                href={source.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                              >
                                View Source →
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <button
                  onClick={() => {
                    setAnalysisResult(null);
                    setTextInput('');
                    setUrlInput('');
                    setSelectedFile(null);
                    setError(null);
                  }}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Analyze Another
                </button>
                <button
                  onClick={() => {
                    const sourcesText = analysisResult.sources && analysisResult.sources.length > 0 
                      ? `\n\nSources:\n${analysisResult.sources.map((source, index) => 
                          `${index + 1}. ${source.title}\n   ${source.link}\n   ${source.snippet}`
                        ).join('\n\n')}`
                      : '';
                    
                    const resultText = `Analysis Result:\nRisk Score: ${analysisResult.risk_score}/100\nSummary: ${analysisResult.summary_title}\n\nDetailed Analysis:\n${analysisResult.explanation_html.replace(/<[^>]*>/g, '')}${sourcesText}`;
                    navigator.clipboard.writeText(resultText);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Copy Results
                </button>
              </div>
            </div>
            </div>
          </div>
        )}
          </div>

          {/* Right Column - Analysis Cards (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Tools</h2>
              
              {/* Text Analysis Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-4">Text Analysis</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Detects emotional manipulation, false statistics, and misleading language patterns
                </p>
              </div>

              {/* Image Verification Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Image className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-4">Image Verification</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Identifies manipulated images, deepfakes, and visual inconsistencies
                </p>
              </div>

              {/* Video Analysis Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-4">Video Analysis</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Detects video manipulation, deepfakes, and suspicious editing patterns
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}