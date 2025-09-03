'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/simple-auth-context';
import Link from 'next/link';
import ProtectedRoute from '@/components/protected-route';
import { 
  Shield, Brain, Search, Upload, TrendingUp, Clock, LogOut, User, 
  BarChart3, GraduationCap, CheckCircle, Star, Award, Target,
  Calendar, Users, Zap, Eye, FileText, AlertTriangle, Menu, X
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            {/* Mobile Sidebar Content */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">MisInfo Combat Pro</span>
                </Link>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="flex-1 p-4">
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Main Features
                </h3>
                <div className="space-y-1">
                  <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2 text-gray-900 bg-gray-100 rounded-lg">
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <Link href="/analyzer" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <Search className="w-5 h-5" />
                    <span>Smart Analyzer</span>
                  </Link>
                  <Link href="/training" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <GraduationCap className="w-5 h-5" />
                    <span>Training Hub</span>
                  </Link>
                  <Link href="/verifier" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <CheckCircle className="w-5 h-5" />
                    <span>Claim Verifier</span>
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white shadow-sm border-r border-gray-200 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">MisInfo Combat Pro</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main Features
            </h3>
            <div className="space-y-1">
              <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2 text-gray-900 bg-gray-100 rounded-lg">
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link href="/analyzer" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
                <span>Smart Analyzer</span>
              </Link>
              <Link href="/training" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <GraduationCap className="w-5 h-5" />
                <span>Training Hub</span>
              </Link>
              <Link href="/verifier" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <CheckCircle className="w-5 h-5" />
                <span>Claim Verifier</span>
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Activity
            </h3>
            <div className="space-y-1">
              <Link href="/history" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Clock className="w-5 h-5" />
                <span>Analysis History</span>
              </Link>
              <Link href="/achievements" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Star className="w-5 h-5" />
                <span>Achievements</span>
              </Link>
              <Link href="/reports" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <FileText className="w-5 h-5" />
                <span>Saved Reports</span>
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Account
            </h3>
            <div className="space-y-1">
              <Link href="/profile" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <Link href="/settings" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Target className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </div>
          </div>

          {/* Streak Widget */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-gray-900">15-day streak!</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Keep analyzing content daily to maintain your streak
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-500">4/5 analyses today</p>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="relative hidden sm:block">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search content, articles, or training modules..."
                  className="pl-10 pr-4 py-2 w-64 lg:w-96 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span className="font-medium text-blue-600">Level 3</span>
              </div>
              <Link href="/profile" className="flex items-center space-x-2 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                <User className="w-5 h-5 text-gray-400" />
                <span className="hidden sm:block text-gray-700 font-medium">
                  {user?.displayName || 'Priya'}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.displayName || 'Priya'}!
                </h1>
                <p className="text-gray-600">
                  Ready to combat misinformation? Let's keep the truth flowing.
                </p>
              </div>
              <div className="text-left lg:text-right">
                <p className="text-sm text-gray-500">Today's Date</p>
                <p className="font-semibold text-gray-900">{currentDate}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Quick Actions & Statistics */}
              <div className="lg:col-span-2 space-y-8">
                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Smart Analyzer Card */}
                    <Link href="/analyzer" className="block group">
                      <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 group-hover:border-blue-300 h-full flex flex-col">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                          <Search className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Smart Analyzer</h3>
                        <p className="text-sm text-gray-600 mb-4 flex-grow">
                          Upload content for instant AI-powered misinformation detection
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-4 group-hover:border-blue-300 transition-colors">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                          <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                            Drag & drop or click to upload<br />
                            <span className="text-xs">Text, images, videos supported</span>
                          </p>
                        </div>
                        <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                          Start Analysis
                        </button>
                      </div>
                    </Link>

                    {/* Training Hub Card */}
                    <Link href="/training" className="block group">
                      <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 group-hover:border-green-300 h-full flex flex-col">
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                          <GraduationCap className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Training Hub</h3>
                        <p className="text-sm text-gray-600 mb-4 flex-grow">
                          Practice identifying fake news patterns with interactive modules
                        </p>
                        <div className="mb-4 bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Current Module</span>
                            <span className="font-medium text-green-600">75% Complete</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Intermediate Analysis - Lesson 9/12</p>
                        </div>
                        <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                          Continue Training
                        </button>
                      </div>
                    </Link>

                    {/* Claim Verifier Card */}
                    <Link href="/verifier" className="block group">
                      <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 group-hover:border-purple-300 h-full flex flex-col">
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                          <CheckCircle className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Claim Verifier</h3>
                        <p className="text-sm text-gray-600 mb-4 flex-grow">
                          Extract and verify factual claims from articles and posts
                        </p>
                        <div className="mb-4">
                          <input
                            type="text"
                            placeholder="Paste URL or text to verify..."
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                            onClick={(e) => e.preventDefault()}
                          />
                        </div>
                        <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                          Verify Claims
                        </button>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Your Statistics */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Statistics</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-gray-900 mb-1">247</div>
                      <div className="text-sm text-gray-600 mb-1">Total Analyses</div>
                      <div className="text-xs text-green-600 font-medium">+12 this week</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-gray-900 mb-1">87%</div>
                      <div className="text-sm text-gray-600 mb-1">Accuracy Rate</div>
                      <div className="text-xs text-green-600 font-medium">+3% improved</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-gray-900 mb-1">15</div>
                      <div className="text-sm text-gray-600 mb-1">Day Streak</div>
                      <div className="text-xs text-gray-600 font-medium">Personal best</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-blue-600 mb-1">Level 3</div>
                      <div className="text-sm text-gray-600 mb-1">Current Level</div>
                      <div className="text-xs text-gray-600 font-medium">850/1000 XP</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                    <Link href="/history" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View All
                    </Link>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">Analyzed news article about election claims</p>
                          <p className="text-sm text-gray-600">2 hours ago • High risk detected (78%)</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded flex-shrink-0">78% Risk</span>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">Completed lesson: Identifying deepfake videos</p>
                          <p className="text-sm text-gray-600">5 hours ago • Scored 92%</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex-shrink-0">+50 XP</span>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">Verified claims in WhatsApp forward</p>
                          <p className="text-sm text-gray-600">Yesterday • 3 false claims identified</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded flex-shrink-0">Verified</span>
                    </div>
                  </div>
                </div>

                {/* Today's Misinformation Tip */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Misinformation Tip</h2>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Eye className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Check the Source Date</h3>
                      <p className="text-gray-600 mb-3">
                        Always verify when content was originally published. Old news is often recycled to mislead 
                        people about current events.
                      </p>
                      <Link href="/tips" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Learn more about source verification →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Learning Progress & Achievements */}
              <div className="space-y-6">
                {/* Learning Progress */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Learning Progress</h2>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Detection Skills</span>
                        <span className="font-medium">Level 3</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '85%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500">850/1000 XP to Level 4</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Verification Speed</span>
                        <span className="font-medium">Advanced</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: '92%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500">Average: 2.3 min per analysis</p>
                    </div>
                  </div>
                  <button className="w-full mt-6 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Detailed Progress
                  </button>
                </div>

                {/* Recent Achievements */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Achievements</h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Week Warrior</p>
                        <p className="text-xs text-gray-600">7-day analysis streak</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Sharp Eye</p>
                        <p className="text-xs text-gray-600">90%+ accuracy rate</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Module Master</p>
                        <p className="text-xs text-gray-600">Completed 5 modules</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* This Week Stats */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">This Week</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Analyses completed</span>
                      <span className="font-semibold">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Training time</span>
                      <span className="font-semibold">2h 45m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Claims verified</span>
                      <span className="font-semibold">67</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Community rank</span>
                      <span className="font-semibold">#142</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}