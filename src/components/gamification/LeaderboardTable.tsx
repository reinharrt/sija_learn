// src/components/gamification/LeaderboardTable.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Award, TrendingUp, Loader2 } from 'lucide-react';
import LevelBadge from './LevelBadge';
import { type UserProgress } from '@/models/UserProgress';
import { getLevelTier } from '@/lib/gamification-client';

interface LeaderboardUser {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  totalXP: number;
  currentLevel: number;
  stats: {
    coursesCompleted: number;
  };
}

interface LeaderboardTableProps {
  limit?: number;
  currentUserId?: string;
  showCurrentUserRank?: boolean;
}

export default function LeaderboardTable({
  limit = 50,
  currentUserId,
  showCurrentUserRank = true
}: LeaderboardTableProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [limit]);

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`/api/gamification/leaderboard?limit=${limit}`);
      const data = await response.json();

      setLeaderboard(data.leaderboard || []);

      if (currentUserId && showCurrentUserRank) {
        const rankResponse = await fetch(`/api/gamification/rank/${currentUserId}`);
        const rankData = await rankResponse.json();
        setCurrentUserRank(rankData.rank);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-amber-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="font-display font-black text-sija-text/60">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-100 border-amber-500 text-amber-700';
    if (rank === 2) return 'bg-gray-100 border-gray-400 text-gray-700';
    if (rank === 3) return 'bg-orange-100 border-orange-500 text-orange-700';
    return 'bg-sija-surface border-sija-primary text-sija-text';
  };

  if (loading) {
    return (
      <div className="text-center py-12 border-2 border-sija-primary bg-sija-surface">
        <Loader2 className="w-12 h-12 animate-spin text-sija-primary mx-auto mb-3" />
        <p className="text-sija-text font-bold uppercase tracking-wider">
          Loading leaderboard...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Current User Rank */}
      {currentUserId && currentUserRank && showCurrentUserRank && (
        <div className="mb-6 p-4 bg-sija-primary/10 border-2 border-sija-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-sija-primary" />
              <div>
                <p className="text-sm text-sija-text/60 uppercase tracking-wider">
                  Your Rank
                </p>
                <p className="font-display text-2xl font-black text-sija-primary">
                  #{currentUserRank}
                </p>
              </div>
            </div>
            <Link
              href={`/profile/${currentUserId}`}
              className="px-4 py-2 border-2 border-sija-primary bg-sija-surface font-bold text-sm hover:bg-sija-primary hover:text-white transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      )}

      {/* Leaderboard Header */}
      <div className="border-b-2 border-sija-text/10 pb-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-6 h-6 text-sija-primary" />
          <h2 className="font-display text-2xl font-black text-sija-text uppercase">
            Top Learners
          </h2>
        </div>
        <p className="text-sija-text/60 font-medium">
          The most dedicated students in SIJA Learn
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-2">
        {leaderboard.map((user, index) => {
          const rank = index + 1;
          const tier = getLevelTier(user.currentLevel);
          const isCurrentUser = currentUserId === user.userId._id.toString();

          return (
            <div
              key={user._id}
              className={`
                border-2 p-4 transition-all
                ${isCurrentUser
                  ? 'bg-sija-primary/10 border-sija-primary shadow-hard'
                  : 'bg-sija-surface border-sija-primary hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px]'
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className={`
                  flex-shrink-0 w-16 h-16 border-2 flex items-center justify-center
                  ${getRankBadgeColor(rank)}
                `}>
                  {getRankIcon(rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${user.userId._id}`}
                    className="font-display font-bold text-lg text-sija-text hover:text-sija-primary transition-colors truncate block"
                  >
                    {user.userId.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-sm text-sija-primary">(You)</span>
                    )}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <LevelBadge level={user.currentLevel} size="xs" />
                    <span className="text-xs text-sija-text/60">•</span>
                    <span className="text-sm text-sija-text/70 font-medium">
                      {user.stats.coursesCompleted} courses
                    </span>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right flex-shrink-0">
                  <p className="font-mono font-black text-2xl text-sija-primary">
                    {user.totalXP.toLocaleString()}
                  </p>
                  <p className="text-xs text-sija-text/60 uppercase tracking-wider">
                    Total XP
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {leaderboard.length === 0 && (
        <div className="text-center py-12 border-2 border-sija-primary bg-sija-surface">
          <Award className="w-12 h-12 text-sija-text/40 mx-auto mb-3" />
          <p className="text-sija-text font-bold uppercase tracking-wider">
            No data yet
          </p>
          <p className="text-sija-text/60 mt-2">
            Be the first to appear on the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
}