'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Award, Target } from 'lucide-react';
import { TrainingDatabase } from '@/lib/training-db';
import { useAuth } from '@/lib/simple-auth-context';

interface LeaderboardUser {
  uid: string;
  displayName: string;
  photoURL?: string;
  totalPoints: number;
  level: number;
  activitiesCompleted: number;
  rank: number;
}

interface LeaderboardProps {
  limit?: number;
  showTitle?: boolean;
  compact?: boolean;
}

export default function Leaderboard({ limit = 10, showTitle = true, compact = false }: LeaderboardProps) {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [limit]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await TrainingDatabase.getLeaderboard(limit);
      console.log('Raw leaderboard data:', data);
      
      // Transform the data to include rank
      const rankedData = data.map((userData, index) => ({
        uid: userData.uid || `unknown-${index}`,
        displayName: userData.displayName || userData.email?.split('@')[0] || 'Anonymous User',
        photoURL: userData.photoURL,
        totalPoints: userData.totalPoints || 0,
        level: userData.level || 1,
        activitiesCompleted: userData.activitiesCompleted || 0,
        rank: index + 1
      }));
      
      console.log('Transformed leaderboard data:', rankedData);
      setLeaderboardData(rankedData);
      
      // Find current user's rank
      if (user) {
        const userEntry = rankedData.find(u => u.uid === user.uid);
        setCurrentUserRank(userEntry ? userEntry.rank : null);
      }
      
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-gray-500 font-semibold text-sm">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
        {showTitle && (
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
          </div>
        )}
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
        {showTitle && (
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
          </div>
        )}
        <div className="text-center py-4">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={loadLeaderboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
        {showTitle && (
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
          </div>
        )}
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No users on the leaderboard yet</p>
          <p className="text-sm text-gray-500 mt-1">Complete activities to be the first!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Community Leaderboard</h3>
          </div>
          {currentUserRank && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Target className="w-4 h-4" />
              <span>You're #{currentUserRank}</span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {leaderboardData.map((userData, index) => {
          const isCurrentUser = user && userData.uid === user.uid;
          
          return (
            <div
              key={userData.uid}
              className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                isCurrentUser
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {/* Rank */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getRankBadgeColor(userData.rank)}`}>
                {getRankIcon(userData.rank)}
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {userData.photoURL ? (
                    <img 
                      src={userData.photoURL}
                      alt={userData.displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {(userData.displayName || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                      {userData.displayName || 'Anonymous User'}
                      {isCurrentUser && <span className="text-blue-600 text-sm ml-1">(You)</span>}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      Level {userData.level || 1}
                    </span>
                  </div>
                  {!compact && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>{(userData.totalPoints || 0).toLocaleString()} pts</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>{userData.activitiesCompleted || 0} activities</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Points (compact view) */}
              {compact && (
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{(userData.totalPoints || 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-600">points</div>
                </div>
              )}

              {/* Trend indicator */}
              {!compact && userData.rank <= 3 && (
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer with refresh button */}
      {!compact && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Updated every hour</span>
            <button
              onClick={loadLeaderboard}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}