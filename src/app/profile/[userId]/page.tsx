// src/app/profile/[userId]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Award, BookOpen, MessageCircle, Flame, TrendingUp } from 'lucide-react';
import LevelBadge from '@/components/gamification/LevelBadge';
import XPProgressBar from '@/components/gamification/XPProgressBar';
import BadgeGrid from '@/components/gamification/BadgeGrid';


interface UserProgress {
  totalXP: number;
  currentLevel: number;
  badges: string[];
  stats: {
    coursesCompleted: number;
    articlesRead: number;
    commentsPosted: number;
    currentStreak: number;
    longestStreak: number;
  };
}

interface User {
  name: string;
  email: string;
  image?: string;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<any>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      // Fetch everything in one go
      const res = await fetch(`/api/profile/${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await res.json();

      setProgress(data.progress);
      setUser(data.user);
      setBadges(data.badges);
      setRank(data.rank);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sija-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-sija-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!progress || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 text-sija-text/20 mx-auto mb-4" />
          <h2 className="text-2xl font-black font-display text-sija-text mb-2">Profile Not Found</h2>
          <p className="text-sija-text/60">The user you are looking for does not exist or has no progress data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-sija-surface border-4 border-sija-primary shadow-hard p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-sija-primary/20 border-4 border-sija-primary flex items-center justify-center overflow-hidden">
                {user?.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <Award className="w-12 h-12 text-sija-primary" />
                )}
              </div>

              <div>
                <h1 className="font-display text-4xl font-black text-sija-text mb-2">
                  {user?.name || 'User Profile'}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <LevelBadge level={progress.currentLevel} showTier />
                  {rank && (
                    <div className="px-3 py-1 bg-sija-primary/10 border-2 border-sija-primary">
                      <span className="font-bold text-sija-text">Rank #{rank}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <XPProgressBar
              totalXP={progress.totalXP}
              currentLevel={progress.currentLevel}
              size="lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-sija-surface border-2 border-sija-primary p-6 text-center hover:shadow-hard transition-all">
            <div className="text-sija-primary mb-2 flex justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <p className="text-sm text-sija-text/60 uppercase tracking-wider mb-1">Courses</p>
            <p className="font-display text-3xl font-black text-sija-primary">
              {progress.stats.coursesCompleted}
            </p>
          </div>

          <div className="bg-sija-surface border-2 border-sija-primary p-6 text-center hover:shadow-hard transition-all">
            <div className="text-sija-primary mb-2 flex justify-center">
              <Award className="w-8 h-8" />
            </div>
            <p className="text-sm text-sija-text/60 uppercase tracking-wider mb-1">Articles</p>
            <p className="font-display text-3xl font-black text-sija-primary">
              {progress.stats.articlesRead}
            </p>
          </div>

          <div className="bg-sija-surface border-2 border-sija-primary p-6 text-center hover:shadow-hard transition-all">
            <div className="text-sija-primary mb-2 flex justify-center">
              <MessageCircle className="w-8 h-8" />
            </div>
            <p className="text-sm text-sija-text/60 uppercase tracking-wider mb-1">Comments</p>
            <p className="font-display text-3xl font-black text-sija-primary">
              {progress.stats.commentsPosted}
            </p>
          </div>

          <div className="bg-sija-surface border-2 border-sija-primary p-6 text-center hover:shadow-hard transition-all">
            <div className="text-sija-primary mb-2 flex justify-center">
              <Flame className="w-8 h-8" />
            </div>
            <p className="text-sm text-sija-text/60 uppercase tracking-wider mb-1">Streak</p>
            <p className="font-display text-3xl font-black text-sija-primary">
              {progress.stats.currentStreak}
              <span className="text-lg ml-1">days</span>
            </p>
          </div>
        </div>

        {badges && (
          <BadgeGrid
            badges={[...badges.earned, ...badges.locked]}
            earnedBadgeIds={progress.badges}
            progress={badges.progress}
            showFilters
          />
        )}
      </div>
    </div>
  );
}