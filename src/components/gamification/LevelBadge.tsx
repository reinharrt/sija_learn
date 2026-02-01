// ============================================
// src/components/gamification/LevelBadge.tsx
// Level Badge - Compact level display component
// ============================================

'use client';

import { getLevelTier } from '@/lib/gamification-client';

import { Sprout, BookOpen, GraduationCap, Star, Crown, Trophy } from 'lucide-react';

interface LevelBadgeProps {
  level: number;
  showTier?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export default function LevelBadge({
  level,
  showTier = false,
  size = 'md',
  interactive = false
}: LevelBadgeProps) {
  const tier = getLevelTier(level);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sprout': return <Sprout className="w-full h-full" />;
      case 'BookOpen': return <BookOpen className="w-full h-full" />;
      case 'GraduationCap': return <GraduationCap className="w-full h-full" />;
      case 'Star': return <Star className="w-full h-full" />;
      case 'Crown': return <Crown className="w-full h-full" />;
      case 'Trophy': return <Trophy className="w-full h-full" />;
      default: return <Sprout className="w-full h-full" />;
    }
  };

  const sizes = {
    xs: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3'
    },
    sm: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4'
    },
    md: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5'
    },
    lg: {
      container: 'px-5 py-2.5 text-lg',
      icon: 'w-6 h-6'
    }
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 
        bg-sija-surface border-2 border-sija-primary 
        font-bold ${tier.color}
        ${sizes[size].container}
        ${interactive ? 'shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer' : 'shadow-hard'}
      `}
    >
      <span className={`inline-flex items-center justify-center ${sizes[size].icon}`}>
        {getIcon(tier.icon)}
      </span>
      <span className="font-display uppercase tracking-wider">
        LVL {level}
      </span>
      {showTier && (
        <span className="text-sija-text/60 font-normal ml-1">
          · {tier.name}
        </span>
      )}
    </div>
  );
}