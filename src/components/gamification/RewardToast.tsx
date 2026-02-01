// ============================================
// src/components/gamification/RewardToast.tsx
// Reward Toast - Toast notification for XP and badge rewards
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { X, Plus, Award } from 'lucide-react';
import { type BadgeDefinition } from '@/lib/badge-definitions';

interface RewardToastProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'xp' | 'badge' | 'level';
  xpGained?: number;
  badge?: BadgeDefinition;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function RewardToast({ 
  isOpen, 
  onClose,
  type,
  xpGained,
  badge,
  autoClose = true,
  autoCloseDelay = 4000
}: RewardToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300); // Wait for animation
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div 
        className={`
          bg-sija-surface border-2 border-sija-primary shadow-hard
          max-w-sm transition-all duration-300
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        {/* XP Reward */}
        {type === 'xp' && xpGained && (
          <div className="p-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-sija-primary border-2 border-sija-primary flex items-center justify-center">
              <Plus className="w-6 h-6 text-white font-bold" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <p className="font-display text-lg font-black text-sija-primary">
                +{xpGained} XP
              </p>
              <p className="text-sm text-sija-text/60 font-medium">
                Experience gained
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-sija-text/10 transition-colors"
            >
              <X className="w-4 h-4 text-sija-text/60" />
            </button>
          </div>
        )}

        {/* Badge Reward */}
        {type === 'badge' && badge && (
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-sija-primary" />
                <p className="font-bold text-sija-text uppercase tracking-wider text-sm">
                  Badge Unlocked!
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-sija-text/10 transition-colors"
              >
                <X className="w-4 h-4 text-sija-text/60" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-4xl animate-bounce-slow">
                {badge.icon}
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-sija-primary uppercase tracking-wider">
                  {badge.name}
                </p>
                <p className="text-sm text-sija-text/70">
                  {badge.description}
                </p>
                {badge.xpReward && (
                  <p className="text-xs text-sija-primary font-bold mt-1">
                    +{badge.xpReward} Bonus XP
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {autoClose && (
          <div className="h-1 bg-sija-surface border-t-2 border-sija-primary/20">
            <div 
              className="h-full bg-sija-primary animate-progress"
              style={{ 
                animationDuration: `${autoCloseDelay}ms`,
                animationTimingFunction: 'linear'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}