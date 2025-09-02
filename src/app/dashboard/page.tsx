'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/simple-auth-context';
import Link from 'next/link';
import ProtectedRoute from '@/components/protected-route';
import { Shield, Brain, Search, Upload, TrendingUp, Clock, LogOut, User } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MisInfo Combat Pro</span>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  {user?.displayName || user?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName || 'User'}!
          </h1>
          <p className="text-gray-600">
            Ready to analyze content and fight misinformation? Choose a tool below to get started.
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link 
            href="/analyzer" 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload for Analysis</h3>
            <p className="text-gray-600 mb-4">
              Analyze text, images, or videos for misinformation patterns
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              <Upload className="w-4 h-4 mr-1" />
              <span>Start Analyzing</span>
            </div>
          </Link>

          <Link 
            href="/training" 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Training Session</h3>
            <p className="text-gray-600 mb-4">
              Practice identifying manipulation techniques through interactive scenarios
            </p>
            <div className="flex items-center text-green-600 font-medium">
              <span>Begin Training</span>
            </div>
          </Link>

          <Link 
            href="/verifier" 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <Search className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Verify Claims</h3>
            <p className="text-gray-600 mb-4">
              Extract and verify factual claims from any content
            </p>
            <div className="flex items-center text-purple-600 font-medium">
              <span>Verify Now</span>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-900 font-medium">Welcome to MisInfo Combat Pro!</p>
                <p className="text-gray-600 text-sm">Get started by analyzing your first piece of content</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Statistics */}
        <div className="mt-8 grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-gray-600">Content Analyzed</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <div className="text-gray-600">Training Sessions</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
            <div className="text-gray-600">Claims Verified</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2 capitalize">
              Beginner
            </div>
            <div className="text-gray-600">Skill Level</div>
          </div>
        </div>
      </main>
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