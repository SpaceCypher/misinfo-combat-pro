'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  FileText, 
  Image, 
  Video, 
  Link as LinkIcon, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Calendar,
  BarChart3,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/simple-auth-context';
import { 
  getUserAnalyses, 
  getUserAnalysisStats, 
  deleteAnalysis, 
  deleteMultipleAnalyses,
  searchUserAnalyses,
  exportUserAnalyses,
  AnalysisHistoryItem,
  AnalysisStats
} from '@/lib/analysis-service';
import { testFirebaseConnection } from '@/lib/firebase-test';

export default function HistoryPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'image' | 'video' | 'url'>('all');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'risk-high' | 'risk-low'>('newest');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 10;

  // Real data from Firestore
  const [historyData, setHistoryData] = useState<AnalysisHistoryItem[]>([]);
  const [stats, setStats] = useState<AnalysisStats>({
    totalAnalyses: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.photoURL]);

  // Load data from Firestore
  const loadData = async (showRefresh = false) => {
    if (!user?.uid) return;
    
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);

      // Load analyses and stats in parallel
      const [analyses, userStats] = await Promise.all([
        getUserAnalyses(user.uid, 1000, filterType, filterRisk, sortBy),
        getUserAnalysisStats(user.uid)
      ]);

      setHistoryData(analyses);
      setStats(userStats);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load analysis history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data when component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user?.uid]);

  // Reload when filters change
  useEffect(() => {
    if (user?.uid && !loading) {
      loadData();
    }
  }, [filterType, filterRisk, sortBy]);

  // Handle search with debouncing
  useEffect(() => {
    if (!user?.uid) return;

    const searchTimeout = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          setLoading(true);
          const searchResults = await searchUserAnalyses(user.uid, searchTerm, 100);
          setHistoryData(searchResults);
        } catch (err) {
          console.error('Search error:', err);
          setError('Search failed. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        loadData();
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, user?.uid]);

  // Apply client-side risk filtering (since we might have search results)
  const filteredData = historyData.filter(item => {
    const matchesRisk = filterRisk === 'all' || 
                       (filterRisk === 'low' && item.score <= 30) ||
                       (filterRisk === 'medium' && item.score > 30 && item.score <= 70) ||
                       (filterRisk === 'high' && item.score > 70);
    
    return matchesRisk;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'url': return <LinkIcon className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-600 bg-green-100';
    if (score <= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskIcon = (score: number) => {
    if (score <= 30) return <CheckCircle className="w-4 h-4" />;
    if (score <= 70) return <AlertTriangle className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  const formatDate = (timestamp: Date) => {
    return timestamp.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const validIds = paginatedData.map(item => item.id).filter(Boolean) as string[];
    if (selectedItems.length === validIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(validIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (!user?.uid || selectedItems.length === 0) return;
    
    try {
      setDeleting(true);
      await deleteMultipleAnalyses(selectedItems, user.uid);
      setSelectedItems([]);
      await loadData(); // Refresh data
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete analyses. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSingle = async (id: string) => {
    if (!user?.uid) return;
    
    try {
      await deleteAnalysis(id, user.uid);
      await loadData(); // Refresh data
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete analysis. Please try again.');
    }
  };

  const handleExportData = async () => {
    if (!user?.uid) return;
    
    try {
      const exportContent = await exportUserAnalyses(user.uid);
      const blob = new Blob([exportContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-history-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data. Please try again.');
    }
  };

  // Show loading state
  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your analysis history...</p>
        </div>
      </div>
    );
  }

  // Show error if user not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your analysis history.</p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left side - Logo and back button */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                <span className="font-semibold text-gray-900">MisInfo Combat</span>
              </Link>
            </div>

            {/* Center - Navigation */}
            <nav className="hidden md:flex space-x-8">
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
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
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
                  <span className="text-xs text-gray-500">Level 3</span>
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
                        console.error('Logout failed:', error);
                      }
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
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
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Clock className="w-8 h-8 mr-3 text-blue-600" />
                Analysis History
              </h1>
              <p className="text-gray-600 mt-2">
                View and manage your misinformation analysis history
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              {selectedItems.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete ({selectedItems.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Total Analyses</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAnalyses}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">High Risk</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.highRisk}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Medium Risk</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.mediumRisk}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Low Risk</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.lowRisk}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-700">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search content or summaries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="all" className="text-gray-900">All Types</option>
                <option value="text" className="text-gray-900">Text</option>
                <option value="image" className="text-gray-900">Image</option>
                <option value="video" className="text-gray-900">Video</option>
                <option value="url" className="text-gray-900">URL</option>
              </select>
            </div>

            {/* Risk Filter */}
            <div>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="all" className="text-gray-900">All Risk Levels</option>
                <option value="low" className="text-gray-900">Low Risk</option>
                <option value="medium" className="text-gray-900">Medium Risk</option>
                <option value="high" className="text-gray-900">High Risk</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="newest" className="text-gray-900">Newest First</option>
                <option value="oldest" className="text-gray-900">Oldest First</option>
                <option value="risk-high" className="text-gray-900">Risk: High to Low</option>
                <option value="risk-low" className="text-gray-900">Risk: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={item.id ? selectedItems.includes(item.id) : false}
                        onChange={() => item.id && handleSelectItem(item.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getTypeIcon(item.type)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 truncate">
                          {item.score >= 80 ? 'High Risk Content Detected' :
                           item.score >= 60 ? 'Medium Risk Content' :
                           item.score >= 40 ? 'Low Risk Content' : 'Content Appears Safe'}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {item.type === 'url' ? item.content : `${item.content.substring(0, 60)}...`}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(item.score)}`}>
                          {getRiskIcon(item.score)}
                          <span>{item.score}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(item.timestamp instanceof Date ? item.timestamp : item.timestamp.toDate())}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            // Navigate to analysis detail page with this item's data
                            router.push(`/analysis-detail?id=${item.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-700 p-1 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const updatedHistory = historyData.filter(h => h.id !== item.id);
                            setHistoryData(updatedHistory);
                            
                            // Update localStorage (only non-mock items)
                            const realHistory = updatedHistory.filter(item => item.id && !item.id.startsWith('mock-'));
                            localStorage.setItem('analysisHistory', JSON.stringify(realHistory));
                          }}
                          className="text-red-600 hover:text-red-700 p-1 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analysis history found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all' || filterRisk !== 'all' 
                ? 'Try adjusting your search filters to find what you\'re looking for.'
                : 'Start analyzing content to build your history.'
              }
            </p>
            <Link
              href="/analyzer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Start Analyzing</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
