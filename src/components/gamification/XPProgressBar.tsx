// ============================================
// src/components/gamification/XPProgressBar.tsx
// XP Progress Bar - CLIENT-SAFE VERSION
// ============================================

'use client';

import { getXPProgress, getLevelTier } from '@/lib/gamification-client';
import { Sprout, BookOpen, GraduationCap, Star, Crown, Trophy } from 'lucide-react';

interface XPProgressBarProps {
  totalXP: number;
  currentLevel: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function XPProgressBar({
  totalXP,
  currentLevel,
  showDetails = true,
  size = 'md'
}: XPProgressBarProps) {
  const { currentLevelXP, xpForNext, percentage } = getXPProgress(totalXP, currentLevel);
  const tier = getLevelTier(currentLevel);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sprout': return <Sprout className="w-6 h-6" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6" />;
      case 'Star': return <Star className="w-6 h-6" />;
      case 'Crown': return <Crown className="w-6 h-6" />;
      case 'Trophy': return <Trophy className="w-6 h-6" />;
      default: return <Sprout className="w-6 h-6" />;
    }
  };

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="w-full">
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`${tier.color}`}>{getIcon(tier.icon)}</span>
            <div>
              <p className={`font-bold ${tier.color} ${textSizes[size]}`}>
                Level {currentLevel}
              </p>
              <p className={`${textSizes[size]} text-sija-text/60 font-medium`}>
                {tier.name} Tier
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-mono font-bold ${textSizes[size]}`}>
              {currentLevelXP.toLocaleString()} / {xpForNext.toLocaleString()} XP
            </p>
            <p className={`${textSizes[size]} text-sija-text/60`}>
              {percentage.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className={`w-full bg-sija-surface border-2 border-sija-primary ${heights[size]} relative overflow-hidden`}>
        {/* Progress Fill */}
        <div
          className="h-full bg-sija-primary transition-all duration-500 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>

        {/* Notches for milestones */}
        {[25, 50, 75].map((milestone) => (
          <div
            key={milestone}
            className="absolute top-0 bottom-0 w-0.5 bg-sija-text/20"
            style={{ left: `${milestone}%` }}
          />
        ))}
      </div>

      {!showDetails && (
        <p className={`${textSizes[size]} text-sija-text/60 mt-1 text-right font-mono`}>
          {currentLevelXP}/{xpForNext} XP
        </p>
      )}
    </div>
  );
}