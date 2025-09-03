'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/simple-auth-context';
import Link from 'next/link';
import ProtectedRoute from '@/components/protected-route';
import {
  Shield, User, Mail, Calendar, ArrowLeft, Edit,
  BarChart3, Target, Clock, Award, Bell, Globe,
  Lock, Eye, Download, FileText, Image, Video,
  ChevronRight, Settings, X, Save, Camera
} from 'lucide-react';

function ProfileContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || 'Sanidhya Kumar',
    bio: 'Student & Fact Checker',
    location: 'Mumbai, India',
    website: '',
    twitter: '',
    linkedin: '',
    emailNotifications: true,
    weeklyReports: true,
    smsAlerts: false,
    publicProfile: true,
    shareAchievements: false,
    language: 'English'
  });

  if (!user) {
    return null;
  }

  const mockStats = {
    totalAnalyses: 247,
    accuracyRate: 87,
    dayStreak: 15,
    weeklyAnalyses: 23,
    trainingTime: '2h 45m',
    accuracyScore: 91,
    weekRank: 47
  };

  const mockHistory = [
    { type: 'News Article Analysis', date: 'Monday 28, 2025 • 7:30 PM', risk: 67, riskLabel: 'Risk' },
    { type: 'Social Media Image', date: 'January 27, 2025 • 4:15 PM', risk: 23, riskLabel: 'Risk' },
    { type: 'Video Content Check', date: 'January 26, 2025 • 11:20 AM', risk: 89, riskLabel: 'Risk' }
  ];

  const achievements = [
    { name: 'First Analysis', icon: '🔍', earned: true },
    { name: 'Week Streak', icon: '🔥', earned: true },
    { name: 'Module Master', icon: '🏆', earned: true },
    { name: 'Accuracy Expert', icon: '⭐', earned: false }
  ];

  const handleEditFormChange = (field: string, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    // Here you would typically save to your backend/Firebase
    console.log('Saving profile:', editForm);
    setIsEditPanelOpen(false);
    // You could show a success toast here
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
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

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors py-2">Dashboard</Link>
              <Link href="/training" className="text-gray-600 hover:text-gray-900 transition-colors py-2">Training</Link>
              <Link href="/analyzer" className="text-gray-600 hover:text-gray-900 transition-colors py-2">Analyze</Link>
              <Link href="/verify" className="text-gray-600 hover:text-gray-900 transition-colors py-2">Verify</Link>
              <span className="text-blue-600 font-medium border-b-2 border-blue-600 py-2">Profile</span>
            </nav>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Level 3</span>
              <Link href="/profile" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                <User className="w-5 h-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="flex-1 min-w-0">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      {user.displayName || 'Sanidhya Kumar'}
                    </h1>
                    <p className="text-gray-600">Student & Fact Checker</p>
                    <p className="text-sm text-gray-500">
                      📅 Joined September 2025 • 📍 Mumbai, India
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditPanelOpen(true)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 flex-shrink-0 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-6 sm:space-x-8 border-b border-gray-200 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 whitespace-nowrap font-medium transition-colors ${activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`pb-3 whitespace-nowrap font-medium transition-colors ${activeTab === 'advanced'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Advanced
                </button>
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                {/* Analysis Statistics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Analysis Statistics</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
                    <div className="text-center">
                      <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{mockStats.totalAnalyses}</div>
                      <div className="text-sm text-gray-600">Total Analyses</div>
                    </div>
                    <div className="text-center">
                      <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{mockStats.accuracyRate}%</div>
                      <div className="text-sm text-gray-600">Accuracy Rate</div>
                    </div>
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{mockStats.dayStreak}</div>
                      <div className="text-sm text-gray-600">Day Streak</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                    Accuracy Improvement Over Time
                    <div className="mt-2 text-sm">Chart visualization area</div>
                  </div>
                </div>

                {/* Training Progress */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Training Progress</h2>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Completed Modules</h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-900">Beginner Detection</span>
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">COMPLETED</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>12/12 lessons</span>
                          <span>100%</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-900">Intermediate Analysis</span>
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">IN PROGRESS</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>9/12 lessons</span>
                          <span>75%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Achievements Earned</h3>
                    <div className="flex flex-wrap gap-4 sm:space-x-4">
                      {achievements.map((achievement, index) => (
                        <div key={index} className={`text-center flex-shrink-0 ${achievement.earned ? 'opacity-100' : 'opacity-40'}`}>
                          <div className="text-2xl mb-1">{achievement.icon}</div>
                          <div className="text-xs text-gray-600 whitespace-nowrap">{achievement.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Analysis History */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Analysis History</h2>
                    <button className="text-blue-600 hover:text-blue-700 text-sm self-start sm:self-auto">View All History</button>
                  </div>

                  <div className="space-y-4">
                    {mockHistory.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 gap-3 sm:gap-0">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.type.includes('News') && <FileText className="w-5 h-5 text-gray-600" />}
                            {item.type.includes('Image') && <Image className="w-5 h-5 text-gray-600" />}
                            {item.type.includes('Video') && <Video className="w-5 h-5 text-gray-600" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{item.type}</div>
                            <div className="text-sm text-gray-500 truncate">{item.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
                          <span className={`text-sm font-medium ${item.risk > 70 ? 'text-red-600' :
                            item.risk > 40 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                            {item.risk}% {item.riskLabel}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'advanced' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Profile Information</h2>
                  <button 
                    onClick={() => setIsEditPanelOpen(true)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 self-start sm:self-auto transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 font-medium">
                          {user.displayName || 'Sanidhya Kumar'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{user.email || 'sanidhyakum2005@gmail.com'}</span>
                        {user.emailVerified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">
                          {user.metadata?.creationTime ?
                            new Date(user.metadata.creationTime).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : '2 September 2025'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Sign In</label>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">
                          {user.metadata?.lastSignInTime ?
                            new Date(user.metadata.lastSignInTime).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '2 September 2025 at 10:55 pm'
                          }
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Authentication Provider</label>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">
                          {user.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email/Password'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-900 font-mono text-sm break-all">
                          {user.uid || '6aKp1CzdPRXaBI7iNW0Ti8PneuD2'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 lg:flex-shrink-0 space-y-6">
            {/* Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Preferences</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                      <span className="ml-2 text-sm text-gray-600">Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                      <span className="ml-2 text-sm text-gray-600">Weekly reports</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="ml-2 text-sm text-gray-600">SMS alerts</span>
                    </label>
                  </div>
                </div>
                <div>
  <h4 className="text-sm font-medium text-gray-700 mb-3">Language</h4>
  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-black !bg-white">
    <option>English</option>
    <option>Hindi</option>
  </select>
</div>


                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Privacy</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                      <span className="ml-2 text-sm text-gray-600">Public profile</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="ml-2 text-sm text-gray-600">Share achievements</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Data */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
              <div className="space-y-4">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Generate Certificate</span>
                </button>
              </div>
            </div>

            {/* This Week Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Analyses completed</span>
                  <span className="font-semibold">{mockStats.weeklyAnalyses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Training time</span>
                  <span className="font-semibold">{mockStats.trainingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy score</span>
                  <span className="font-semibold">{mockStats.accuracyScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rank this week</span>
                  <span className="font-semibold">#{mockStats.weekRank}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Slide-out Panel */}
      {isEditPanelOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300"
            onClick={() => setIsEditPanelOpen(false)}
          />
          
          {/* Slide-out Panel */}
          <div className="fixed right-4 top-4 bottom-4 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col">
            {/* Panel Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setIsEditPanelOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Photo Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                  <button className="absolute bottom-4 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">Click to change profile photo</p>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => handleEditFormChange('displayName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => handleEditFormChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 bg-white"
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => handleEditFormChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => handleEditFormChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <input
                    type="text"
                    value={editForm.twitter}
                    onChange={(e) => handleEditFormChange('twitter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="text"
                    value={editForm.linkedin}
                    onChange={(e) => handleEditFormChange('linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="linkedin.com/in/username"
                  />
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Language</label>
                  <select 
                    value={editForm.language}
                    onChange={(e) => handleEditFormChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Notifications</h4>
                  
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={editForm.emailNotifications}
                      onChange={(e) => handleEditFormChange('emailNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-600">Email notifications</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={editForm.weeklyReports}
                      onChange={(e) => handleEditFormChange('weeklyReports', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-600">Weekly reports</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={editForm.smsAlerts}
                      onChange={(e) => handleEditFormChange('smsAlerts', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-600">SMS alerts</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Privacy</h4>
                  
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={editForm.publicProfile}
                      onChange={(e) => handleEditFormChange('publicProfile', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-600">Public profile</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={editForm.shareAchievements}
                      onChange={(e) => handleEditFormChange('shareAchievements', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-600">Share achievements</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex space-x-3 rounded-b-xl">
              <button
                onClick={() => setIsEditPanelOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}