// src/components/gamification/BadgeCard.tsx

'use client';

import { type BadgeDefinition, RARITY_COLORS } from '@/lib/badge-definitions';
import { Lock, HelpCircle, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

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
      icon: 'w-8 h-8',
      container: 'p-3',
      title: 'text-sm',
      description: 'text-xs'
    },
    md: {
      icon: 'w-10 h-10',
      container: 'p-4',
      title: 'text-base',
      description: 'text-sm'
    },
    lg: {
      icon: 'w-12 h-12',
      container: 'p-6',
      title: 'text-lg',
      description: 'text-base'
    }
  };

  // Resolve Lucide Icon
  const IconComponent = (LucideIcons as any)[badge.icon];
  const DisplayIcon = IconComponent || HelpCircle;
  const isLucideIcon = !!IconComponent;

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
      <div className="relative text-center mb-3 flex justify-center">
        {earned ? (
          <div className={`${sizes[size].icon} ${badge.rarity === 'legendary' ? 'animate-pulse' : ''}`}>
            {isLucideIcon ? <DisplayIcon className="w-full h-full" /> : <span className="text-3xl">{badge.icon}</span>}
          </div>
        ) : (
          <div className="relative">
            <div className={`${sizes[size].icon} grayscale blur-sm opacity-50`}>
              {isLucideIcon ? <DisplayIcon className="w-full h-full" /> : <span className="text-3xl">{badge.icon}</span>}
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
            <span className="text-xs text-sija-primary font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> EARNED
            </span>
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