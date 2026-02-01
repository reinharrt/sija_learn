// ============================================
// src/components/gamification/BadgeCard.tsx
// Badge Card - Display individual badge with details
// ============================================

'use client';

import { type BadgeDefinition, RARITY_COLORS } from '@/lib/badge-definitions';
import { Lock } from 'lucide-react';

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned?: boolean;
  progress?: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function BadgeCard({ 
  badge, 
  earned = false, 
  progress = 0,
  onClick,
  size = 'md' 
}: BadgeCardProps) {
  const colors = RARITY_COLORS[badge.rarity];
  
  const sizes = {
    sm: {
      icon: 'text-3xl',
      container: 'p-3',
      title: 'text-sm',
      description: 'text-xs'
    },
    md: {
      icon: 'text-4xl',
      container: 'p-4',
      title: 'text-base',
      description: 'text-sm'
    },
    lg: {
      icon: 'text-5xl',
      container: 'p-6',
      title: 'text-lg',
      description: 'text-base'
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${colors.bg} 
        border-2 ${colors.border}
        ${sizes[size].container}
        ${earned ? 'shadow-hard' : 'opacity-60'}
        ${onClick ? 'cursor-pointer hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px]' : ''}
        transition-all duration-200
        relative overflow-hidden
        group
      `}
    >
      {/* Rarity glow effect when earned */}
      {earned && (
        <div className={`absolute inset-0 ${colors.glow} opacity-0 group-hover:opacity-20 transition-opacity blur-xl`} />
      )}

      {/* Badge Icon */}
      <div className="relative text-center mb-3">
        {earned ? (
          <div className={`${sizes[size].icon} ${badge.rarity === 'legendary' ? 'animate-pulse' : ''}`}>
            {badge.icon}
          </div>
        ) : (
          <div className="relative">
            <div className={`${sizes[size].icon} grayscale blur-sm`}>
              {badge.icon}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-6 h-6 text-sija-text/40" />
            </div>
          </div>
        )}
      </div>

      {/* Badge Info */}
      <div className="relative">
        <div className="flex items-start justify-between mb-1">
          <h3 className={`font-display font-bold ${colors.text} uppercase tracking-wider ${sizes[size].title}`}>
            {badge.name}
          </h3>
          {badge.xpReward && earned && (
            <span className="text-xs font-mono bg-sija-primary/10 px-2 py-0.5 rounded">
              +{badge.xpReward} XP
            </span>
          )}
        </div>
        
        <p className={`${sizes[size].description} text-sija-text/70 mb-2`}>
          {badge.description}
        </p>

        {/* Rarity Label */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold ${colors.text} uppercase tracking-widest`}>
            {badge.rarity}
          </span>
          
          {/* Progress bar for locked badges */}
          {!earned && progress > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-sija-surface border border-sija-text/20">
                <div 
                  className={`h-full bg-current ${colors.text}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-mono">{Math.floor(progress)}%</span>
            </div>
          )}
          
          {earned && (
            <span className="text-xs text-sija-primary font-bold">✓ EARNED</span>
          )}
        </div>
      </div>

      {/* Legendary shimmer effect */}
      {earned && badge.rarity === 'legendary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent -translate-x-full animate-shimmer-slow pointer-events-none" />
      )}
    </div>
  );
}