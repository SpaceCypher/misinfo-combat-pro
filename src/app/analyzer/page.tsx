'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Upload, FileText, Image, Video, Link as LinkIcon, ArrowLeft, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function Analyzer() {
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
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      // For now, we'll only handle text analysis since that's what we deployed
      if (activeTab === 'text' && textInput.trim()) {
        const response = await fetch('https://us-central1-optical-habitat-470918-f2.cloudfunctions.net/misinfo-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: textInput.trim()
          }),
        });

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.status}`);
        }

        const result = await response.json();
        setAnalysisResult(result);
      } else {
        // Placeholder for URL and file upload functionality
        setError('URL and file upload analysis will be available soon. Please use text analysis for now.');
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
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Smart Analyzer</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI-Powered Misinformation Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload content or paste a URL to get instant analysis with detailed explanations of potential misinformation patterns.
          </p>
        </div>

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
                        Supports text files, images (JPG, PNG), and videos (MP4, MOV)
                      </p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".txt,.pdf,.jpg,.jpeg,.png,.mp4,.mov"
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

        {/* Feature Highlights */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Text Analysis</h3>
            <p className="text-gray-600">
              Detects emotional manipulation, false statistics, and misleading language patterns
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Image className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Image Verification</h3>
            <p className="text-gray-600">
              Identifies manipulated images, deepfakes, and visual inconsistencies
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Analysis</h3>
            <p className="text-gray-600">
              Detects video manipulation, deepfakes, and suspicious editing patterns
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}