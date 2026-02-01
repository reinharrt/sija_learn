// ============================================
// src/components/gamification/LevelUpModal.tsx
// Level Up Modal - Celebration modal when user levels up
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, Award, Sprout, BookOpen, GraduationCap, Star, Crown, Trophy } from 'lucide-react';
import { getLevelTier } from '@/lib/gamification-client';
import { xpForNextLevel } from '@/lib/xp-calculator';
import LevelBadge from './LevelBadge';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  levelsGained?: number;
  xpGained: number;
}

export default function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  levelsGained = 1,
  xpGained
}: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const tier = getLevelTier(newLevel);
  const xpForNext = xpForNextLevel(newLevel);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sprout': return <Sprout className="w-24 h-24" />;
      case 'BookOpen': return <BookOpen className="w-24 h-24" />;
      case 'GraduationCap': return <GraduationCap className="w-24 h-24" />;
      case 'Star': return <Star className="w-24 h-24" />;
      case 'Crown': return <Crown className="w-24 h-24" />;
      case 'Trophy': return <Trophy className="w-24 h-24" />;
      default: return <Sprout className="w-24 h-24" />;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-sija-surface border-4 border-sija-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] max-w-md w-full animate-bounce-in pointer-events-auto relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-10px',
                    backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)],
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-sija-text/10 transition-colors z-10"
          >
            <X className="w-5 h-5 text-sija-text" />
          </button>

          {/* Content */}
          <div className="p-8 text-center relative">
            {/* Icon */}
            <div className="mb-4 relative">
              <div className={`animate-bounce-slow inline-block ${tier.color}`}>
                {getIcon(tier.icon)}
              </div>
              <Sparkles className="w-6 h-6 text-amber-500 absolute top-0 right-1/3 animate-spin-slow" />
              <Sparkles className="w-5 h-5 text-blue-500 absolute bottom-0 left-1/3 animate-ping" />
            </div>

            {/* Title */}
            <h2 className="font-display text-4xl font-black text-sija-primary uppercase mb-2">
              LEVEL UP!
            </h2>

            {levelsGained > 1 && (
              <p className="text-lg text-sija-text/70 font-bold mb-4">
                +{levelsGained} Levels!
              </p>
            )}

            {/* Level Badge */}
            <div className="flex justify-center mb-6">
              <LevelBadge level={newLevel} showTier size="lg" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border-2 border-sija-primary bg-sija-light p-4">
                <p className="text-sm text-sija-text/60 uppercase tracking-wider mb-1">
                  XP Gained
                </p>
                <p className="font-display text-2xl font-black text-sija-primary">
                  +{xpGained}
                </p>
              </div>
              <div className="border-2 border-sija-primary bg-sija-light p-4">
                <p className="text-sm text-sija-text/60 uppercase tracking-wider mb-1">
                  Next Level
                </p>
                <p className="font-display text-2xl font-black text-sija-primary">
                  {xpForNext} XP
                </p>
              </div>
            </div>

            {/* Tier Achievement */}
            <div className="bg-sija-primary/10 border-2 border-sija-primary p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-5 h-5 text-sija-primary" />
                <p className="font-bold text-sija-text uppercase tracking-wider">
                  {tier.name} Tier
                </p>
              </div>
              <p className="text-sm text-sija-text/70">
                You're in the top {tier.name.toLowerCase()} tier of learners!
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all uppercase tracking-wider"
            >
              Continue Learning
            </button>
          </div>

          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-sija-primary" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-sija-primary" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-sija-primary" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-sija-primary" />
        </div>
      </div>
    </>
  );
}