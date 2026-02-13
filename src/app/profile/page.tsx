// src/app/profile/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGamificationContext } from '@/contexts/GamificationContext';
import { useRouter } from 'next/navigation';
import XPProgressBar from '@/components/gamification/XPProgressBar';
import LevelBadge from '@/components/gamification/LevelBadge';
import BadgeGrid from '@/components/gamification/BadgeGrid';
import LeaderboardTable from '@/components/gamification/LeaderboardTable';
import { Trophy, Award, TrendingUp, BookOpen, MessageSquare, Flame } from 'lucide-react';
import { type BadgeDefinition } from '@/lib/badge-definitions';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { progress, loading: progressLoading } = useGamificationContext();
  const router = useRouter();

  const [badges, setBadges] = useState<{
    earned: BadgeDefinition[];
    locked: BadgeDefinition[];
    progress: Record<string, number>;
  }>({ earned: [], locked: [], progress: {} });
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'leaderboard'>('overview');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadBadges();
    }
  }, [user]);

  const loadBadges = async () => {
    try {
      const response = await fetch(`/api/gamification/badges/${user?.id}`);
      const data = await response.json();
      setBadges(data.badges);
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setLoadingBadges(false);
    }
  };

  if (authLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-sija-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sija-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-sija-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !progress) {
    return (
      <div className="min-h-screen bg-sija-light flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="font-display text-2xl font-black text-sija-text mb-2">
            Failed to Load Profile
          </h2>
          <p className="text-sija-text/60 mb-6">
            We couldn't load your profile data. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-sija-primary text-white font-bold border-2 border-transparent hover:bg-sija-primary/90 transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sija-light py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-black text-sija-text uppercase mb-2">
                {user.name}
              </h1>
              <p className="text-sija-text/60 font-medium">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <LevelBadge level={progress.currentLevel} showTier size="lg" />
            </div>
          </div>

          <div className="mt-6">
            <XPProgressBar
              totalXP={progress.totalXP}
              currentLevel={progress.currentLevel}
              showDetails={true}
              size="lg"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`
              px-6 py-3 font-bold border-2 border-sija-primary transition-all uppercase tracking-wider
              ${activeTab === 'overview'
                ? 'bg-sija-primary text-white shadow-hard'
                : 'bg-sija-surface text-sija-text hover:shadow-hard-sm'
              }
            `}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`
              px-6 py-3 font-bold border-2 border-sija-primary transition-all uppercase tracking-wider
              ${activeTab === 'badges'
                ? 'bg-sija-primary text-white shadow-hard'
                : 'bg-sija-surface text-sija-text hover:shadow-hard-sm'
              }
            `}
          >
            Badges ({badges.earned.length}/{badges.earned.length + badges.locked.length})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`
              px-6 py-3 font-bold border-2 border-sija-primary transition-all uppercase tracking-wider
              ${activeTab === 'leaderboard'
                ? 'bg-sija-primary text-white shadow-hard'
                : 'bg-sija-surface text-sija-text hover:shadow-hard-sm'
              }
            `}
          >
            Leaderboard
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-sija-surface border-2 border-sija-primary p-4">
                  <Trophy className="w-6 h-6 text-sija-primary mb-2" />
                  <p className="font-mono text-3xl font-black text-sija-primary">
                    {progress.stats.coursesCompleted}
                  </p>
                  <p className="text-sm text-sija-text/60 uppercase tracking-wider">
                    Courses
                  </p>
                </div>

                <div className="bg-sija-surface border-2 border-sija-primary p-4">
                  <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="font-mono text-3xl font-black text-blue-500">
                    {progress.stats.articlesRead}
                  </p>
                  <p className="text-sm text-sija-text/60 uppercase tracking-wider">
                    Articles
                  </p>
                </div>

                <div className="bg-sija-surface border-2 border-sija-primary p-4">
                  <MessageSquare className="w-6 h-6 text-green-500 mb-2" />
                  <p className="font-mono text-3xl font-black text-green-500">
                    {progress.stats.commentsPosted}
                  </p>
                  <p className="text-sm text-sija-text/60 uppercase tracking-wider">
                    Comments
                  </p>
                </div>

                <div className="bg-sija-surface border-2 border-sija-primary p-4">
                  <Flame className="w-6 h-6 text-orange-500 mb-2" />
                  <p className="font-mono text-3xl font-black text-orange-500">
                    {progress.stats.currentStreak}
                  </p>
                  <p className="text-sm text-sija-text/60 uppercase tracking-wider">
                    Day Streak
                  </p>
                </div>
              </div>

              <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-2xl font-black text-sija-text uppercase">
                    Recent Badges
                  </h2>
                  <button
                    onClick={() => setActiveTab('badges')}
                    className="text-sm font-bold text-sija-primary hover:underline uppercase tracking-wider"
                  >
                    View All →
                  </button>
                </div>

                {badges.earned.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-sija-text/40 mx-auto mb-3" />
                    <p className="text-sija-text/60 font-medium">No badges earned yet</p>
                    <p className="text-sm text-sija-text/40 mt-1">
                      Complete courses to earn badges!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {badges.earned.slice(0, 6).map(badge => (
                      <div
                        key={badge.id}
                        className="bg-sija-light border-2 border-sija-primary p-4 text-center hover:shadow-hard-sm transition-all"
                      >
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <p className="font-bold text-sija-text text-sm">{badge.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6">
                <h3 className="font-display text-xl font-black text-sija-text uppercase mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sija-text/70 font-medium">Total XP</span>
                    <span className="font-mono font-bold text-sija-primary">
                      {progress.totalXP.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sija-text/70 font-medium">Current Level</span>
                    <span className="font-mono font-bold text-sija-primary">
                      {progress.currentLevel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sija-text/70 font-medium">Badges</span>
                    <span className="font-mono font-bold text-sija-primary">
                      {badges.earned.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sija-text/70 font-medium">Longest Streak</span>
                    <span className="font-mono font-bold text-orange-500">
                      {progress.stats.longestStreak} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6">
            <BadgeGrid
              badges={[...badges.earned, ...badges.locked]}
              earnedBadgeIds={badges.earned.map(b => b.id)}
              progress={badges.progress}
              showFilters={true}
            />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6">
            <LeaderboardTable
              limit={50}
              currentUserId={user.id}
              showCurrentUserRank={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}