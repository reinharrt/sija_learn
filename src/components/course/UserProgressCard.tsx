// ============================================
// src/components/gamification/UserProgressCard.tsx
// User Progress Card - Compact progress display
// ============================================

'use client';

import Link from 'next/link';
import { Trophy, Award, Flame } from 'lucide-react';
import { useGamificationContext } from '@/contexts/GamificationContext';
import XPProgressBar from './XPProgressBar';
import LevelBadge from './LevelBadge';

interface UserProgressCardProps {
  showDetailLink?: boolean;
}

export default function UserProgressCard({ showDetailLink = true }: UserProgressCardProps) {
  const { progress, loading } = useGamificationContext();

  if (loading) {
    return (
      <div className="bg-sija-surface border-2 border-sija-primary p-6 animate-pulse">
        <div className="h-4 bg-sija-primary/20 rounded mb-4 w-1/2" />
        <div className="h-8 bg-sija-primary/20 rounded mb-4" />
        <div className="h-3 bg-sija-primary/20 rounded" />
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="bg-sija-surface border-2 border-sija-primary p-6">
        <p className="text-sija-text/60">No progress data available</p>
      </div>
    );
  }

  return (
    <div className="bg-sija-surface border-2 border-sija-primary shadow-hard">
      {/* Header */}
      <div className="p-6 border-b-2 border-sija-primary">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-black text-sija-text uppercase">
            Your Progress
          </h3>
          {showDetailLink && (
            <Link
              href="/profile"
              className="text-sm font-bold text-sija-primary hover:underline"
            >
              View Full Profile →
            </Link>
          )}
        </div>

        {/* Level and XP */}
        <div className="mb-4">
          <LevelBadge level={progress.currentLevel} showTier size="lg" />
        </div>

        <XPProgressBar
          totalXP={progress.totalXP}
          currentLevel={progress.currentLevel}
          showDetails={true}
          size="md"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-px bg-sija-primary">
        {/* Courses */}
        <div className="bg-sija-surface p-4 text-center">
          <Trophy className="w-5 h-5 text-sija-primary mx-auto mb-2" />
          <p className="font-mono text-2xl font-black text-sija-primary">
            {progress.stats.coursesCompleted}
          </p>
          <p className="text-xs text-sija-text/60 uppercase tracking-wider">
            Courses
          </p>
        </div>

        {/* Badges */}
        <div className="bg-sija-surface p-4 text-center">
          <Award className="w-5 h-5 text-sija-primary mx-auto mb-2" />
          <p className="font-mono text-2xl font-black text-sija-primary">
            {progress.badges.length}
          </p>
          <p className="text-xs text-sija-text/60 uppercase tracking-wider">
            Badges
          </p>
        </div>

        {/* Streak */}
        <div className="bg-sija-surface p-4 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
          <p className="font-mono text-2xl font-black text-orange-500">
            {progress.stats.currentStreak}
          </p>
          <p className="text-xs text-sija-text/60 uppercase tracking-wider">
            Day Streak
          </p>
        </div>
      </div>
    </div>
  );
}