'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/simple-auth-context';
import Link from 'next/link';
import ProtectedRoute from '@/components/protected-route';
import { TrainingDatabase, UserProfileManager } from '@/lib/training-db';
import type { UserProfile } from '@/lib/training-db';
import {
  Shield, User, Mail, Calendar, ArrowLeft, Edit,
  BarChart3, Target, Clock, Award, Bell, Globe,
  Lock, Eye, Download, FileText, Image, Video,
  ChevronRight, Settings, X, Save, Camera, Trophy
} from 'lucide-react';

function ProfileContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.photoURL]);

  // Load user profile data
  useEffect(() => {
    async function loadUserProfile() {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        let profile = await TrainingDatabase.getUserFullProfile(user.uid);
        
        // Initialize profile if it doesn't exist
        if (!profile) {
          const profileData: {
            email: string;
            displayName: string;
            photoURL?: string;
          } = {
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'User'
          };
          
          // Only include photoURL if it exists and is not empty
          if (user.photoURL) {
            profileData.photoURL = user.photoURL;
          }
          
          profile = await TrainingDatabase.initializeUserProfile(user.uid, profileData);
        }
        
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserProfile();
  }, [user]);
  
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    location: '',
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

  // Update edit form when user profile loads
  useEffect(() => {
    if (userProfile) {
      setEditForm({
        displayName: userProfile.displayName,
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
        twitter: userProfile.socialLinks?.twitter || '',
        linkedin: userProfile.socialLinks?.linkedin || '',
        emailNotifications: userProfile.preferences?.emailNotifications ?? true,
        weeklyReports: userProfile.preferences?.weeklyReports ?? true,
        smsAlerts: userProfile.preferences?.smsAlerts ?? false,
        publicProfile: userProfile.preferences?.publicProfile ?? true,
        shareAchievements: userProfile.preferences?.shareAchievements ?? false,
        language: userProfile.preferences?.language || 'English'
      });
    }
  }, [userProfile]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleEditFormChange = (field: string, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user?.uid || !userProfile) return;
    
    try {
      const updates: Partial<UserProfile> = {
        displayName: editForm.displayName,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        socialLinks: {
          twitter: editForm.twitter,
          linkedin: editForm.linkedin,
          instagram: userProfile.socialLinks?.instagram || '',
          github: userProfile.socialLinks?.github || ''
        },
        preferences: {
          emailNotifications: editForm.emailNotifications,
          weeklyReports: editForm.weeklyReports,
          smsAlerts: editForm.smsAlerts,
          publicProfile: editForm.publicProfile,
          shareAchievements: editForm.shareAchievements,
          language: editForm.language,
          theme: userProfile.preferences?.theme || 'light'
        }
      };
      
      await UserProfileManager.updateUserProfile(user.uid, updates);
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      setIsEditPanelOpen(false);
      
      // You could show a success toast here
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      // You could show an error toast here
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
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

            {/* Right side - Profile (highlighted since we're on profile page) */}
            <div className="relative">
              <div 
                className="flex items-center space-x-3 bg-blue-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                onMouseEnter={() => setShowProfileDropdown(true)}
                onMouseLeave={() => setShowProfileDropdown(false)}
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-blue-600">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-blue-500">
                    Level {userProfile?.level || 1} • Profile
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user?.photoURL && !imageError ? (
                    <img 
                      src={`/api/proxy-image?url=${encodeURIComponent(user.photoURL)}`}
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Profile: Proxy image failed, trying direct URL:', user?.photoURL);
                        e.currentTarget.src = user?.photoURL || '';
                        e.currentTarget.onerror = () => {
                          console.log('Profile: Direct URL also failed');
                          setImageError(true);
                        };
                      }}
                      onLoad={() => console.log('Profile: Image loaded successfully via proxy')}
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
                    onClick={logout}
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="flex-1 min-w-0">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    {(user?.photoURL || userProfile?.photoURL) && !imageError ? (
                      <img 
                        src={`/api/proxy-image?url=${encodeURIComponent(user?.photoURL || userProfile?.photoURL || '')}`}
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Profile main: Proxy image failed, trying direct URL:', user?.photoURL);
                          e.currentTarget.src = (user?.photoURL || userProfile?.photoURL) || '';
                          e.currentTarget.onerror = () => {
                            console.log('Profile main: Direct URL also failed');
                            setImageError(true);
                          };
                        }}
                        onLoad={() => console.log('Profile main: Image loaded successfully')}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                          {(userProfile?.displayName || user?.displayName) ? 
                            (userProfile?.displayName || user?.displayName)!.split(' ').map(n => n[0]).join('').toUpperCase() : 
                            (user?.email?.[0]?.toUpperCase() || 'U')
                          }
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      {userProfile?.displayName || user.displayName || 'User'}
                    </h1>
                    <p className="text-gray-600">{userProfile?.bio || 'No bio provided'}</p>
                    <p className="text-sm text-gray-700">
                      📅 Joined {(() => {
                        try {
                          if (userProfile?.joinedDate) {
                            const date = userProfile.joinedDate instanceof Date 
                              ? userProfile.joinedDate 
                              : new Date(userProfile.joinedDate);
                            
                            if (isNaN(date.getTime())) {
                              return 'Recently';
                            }
                            
                            return date.toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long'
                            });
                          }
                          return 'Recently';
                        } catch (error) {
                          console.error('Error formatting date:', error);
                          return 'Recently';
                        }
                      })()} • 
                      📍 {userProfile?.location || 'Location not specified'} •
                      🏆 Level {userProfile?.level || 1} •
                      ⭐ {userProfile?.totalPoints || 0} points
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
                      <div className="text-2xl font-bold text-gray-900">
                        {(userProfile?.analyzerStats.totalAnalyses || 0) + 
                         (userProfile?.verifierStats.totalVerifications || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Analyses</div>
                    </div>
                    <div className="text-center">
                      <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(userProfile?.trainingStats.averageAccuracy || 0)}%
                      </div>
                      <div className="text-sm text-gray-600">Accuracy Rate</div>
                    </div>
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{userProfile?.streakDays || 0}</div>
                      <div className="text-sm text-gray-600">Day Streak</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-700">
                    Accuracy Improvement Over Time
                    <div className="mt-2 text-sm">Chart visualization area</div>
                  </div>
                </div>

                {/* Training Progress */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Training Progress</h2>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Training Progress</h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">Modules Completed</span>
                        <span className="text-lg font-bold text-blue-600">
                          {userProfile?.completedModules.length || 0}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">Skill Level</span>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full capitalize">
                          {userProfile?.skillLevel || 'Beginner'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">Training Time</span>
                        <span className="text-sm text-gray-600">
                          {Math.floor((userProfile?.trainingStats.totalTimeSpent || 0) / 60)}h {Math.floor((userProfile?.trainingStats.totalTimeSpent || 0) % 60)}m
                        </span>
                      </div>

                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">Perfect Scores</span>
                        <span className="text-sm text-gray-600">
                          {userProfile?.trainingStats.perfectScores || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Achievements Earned</h3>
                    <div className="flex flex-wrap gap-4 sm:space-x-4">
                      {userProfile?.achievements && userProfile.achievements.length > 0 ? (
                        userProfile.achievements.map((achievement, index) => (
                          <div key={index} className="text-center flex-shrink-0">
                            <div className="text-2xl mb-1">{achievement.icon}</div>
                            <div className="text-xs text-gray-600 whitespace-nowrap">{achievement.name}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No achievements yet</p>
                          <p className="text-xs">Complete modules to earn your first achievement!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activity</h2>
                  </div>

                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs">Start training, analyzing, or verifying content to see your activity here!</p>
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
                          {user.displayName}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gamification Stats</h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Points</span>
                  <span className="text-gray-600 font-semibold">{userProfile?.totalPoints || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Training Points</span>
                  <span className="text-gray-600 font-semibold">{userProfile?.trainingStats.pointsEarned || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Analyzer Points</span>
                  <span className="text-gray-600 font-semibold">{userProfile?.analyzerStats.pointsEarned || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verifier Points</span>
                  <span className="text-gray-600 font-semibold">{userProfile?.verifierStats.pointsEarned || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Level</span>
                  <span className="text-gray-600 font-semibold">Level {userProfile?.level || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Points to Next Level</span>
                  <span className="text-gray-600 font-semibold">{userProfile?.pointsToNextLevel || 100}</span>
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
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Photo Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                    {(user?.photoURL || userProfile?.photoURL) && !imageError ? (
                      <img 
                        src={`/api/proxy-image?url=${encodeURIComponent(user?.photoURL || userProfile?.photoURL || '')}`}
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Profile edit: Proxy image failed, trying direct URL');
                          e.currentTarget.src = (user?.photoURL || userProfile?.photoURL) || '';
                          e.currentTarget.onerror = () => {
                            console.log('Profile edit: Direct URL also failed');
                            setImageError(true);
                          };
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xl font-semibold">
                          {(userProfile?.displayName || user?.displayName) ? 
                            (userProfile?.displayName || user?.displayName)!.split(' ').map(n => n[0]).join('').toUpperCase() : 
                            (user?.email?.[0]?.toUpperCase() || 'U')
                          }
                        </span>
                      </div>
                    )}
                  </div>
                  <button 
                    type="button"
                    className="absolute bottom-4 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                    title="Change profile photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">Profile photo from your account provider</p>
                <p className="text-xs text-gray-500 mt-1">Change your photo in your Google/provider account settings</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-600"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => handleEditFormChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 bg-white placeholder-gray-600"
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => handleEditFormChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-600"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-600"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <input
                    type="text"
                    value={editForm.twitter}
                    onChange={(e) => handleEditFormChange('twitter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-600"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="text"
                    value={editForm.linkedin}
                    onChange={(e) => handleEditFormChange('linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-600"
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