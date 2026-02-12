// src/components/gamification/XPRewardBadge.tsx

'use client';

import { Trophy, Zap } from 'lucide-react';

interface XPRewardBadgeProps {
  xp: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'badge';
  showIcon?: boolean;
}

export default function XPRewardBadge({
  xp,
  size = 'md',
  variant = 'badge',
  showIcon = true
}: XPRewardBadgeProps) {
  const sizes = {
    sm: {
      text: 'text-xs',
      icon: 'w-3 h-3',
      padding: 'px-2 py-1'
    },
    md: {
      text: 'text-sm',
      icon: 'w-4 h-4',
      padding: 'px-3 py-1.5'
    },
    lg: {
      text: 'text-base',
      icon: 'w-5 h-5',
      padding: 'px-4 py-2'
    }
  };

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1 font-bold text-amber-600 ${sizes[size].text}`}>
        {showIcon && <Zap className={`${sizes[size].icon} fill-current`} />}
        +{xp} XP
      </span>
    );
  }

  return (
    <div className={`
      inline-flex items-center gap-2 
      bg-amber-50 dark:bg-amber-900/20 
      border-2 border-amber-500
      ${sizes[size].padding}
      ${sizes[size].text}
      font-bold text-amber-700 dark:text-amber-400
    `}>
      {showIcon && <Trophy className={`${sizes[size].icon}`} />}
      <span>+{xp} XP</span>
    </div>
  );
}