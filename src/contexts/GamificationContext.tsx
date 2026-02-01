// ============================================
// src/contexts/GamificationContext.tsx
// Gamification Context - Global gamification state
// ============================================

'use client';

import React, { createContext, useContext } from 'react';
import { useGamification } from '@/hooks/useGamification';
import RewardToast from '@/components/gamification/RewardToast';
import LevelUpModal from '@/components/gamification/LevelUpModal';

const GamificationContext = createContext<ReturnType<typeof useGamification> | null>(null);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const gamification = useGamification();

  return (
    <GamificationContext.Provider value={gamification}>
      {children}
      
      {/* XP Toast */}
      <RewardToast
        isOpen={gamification.showXPToast}
        onClose={() => gamification.setShowXPToast(false)}
        type="xp"
        xpGained={gamification.xpGained}
      />

      {/* Level Up Modal */}
      {gamification.levelUpData && (
        <LevelUpModal
          isOpen={gamification.showLevelUpModal}
          onClose={() => gamification.setShowLevelUpModal(false)}
          newLevel={gamification.levelUpData.newLevel}
          levelsGained={gamification.levelUpData.levelsGained}
          xpGained={gamification.levelUpData.xpGained}
        />
      )}

      {/* Badge Toast */}
      {gamification.newBadge && (
        <RewardToast
          isOpen={gamification.showBadgeToast}
          onClose={() => gamification.setShowBadgeToast(false)}
          type="badge"
          badge={gamification.newBadge}
        />
      )}
    </GamificationContext.Provider>
  );
}

export function useGamificationContext() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamificationContext must be used within GamificationProvider');
  }
  return context;
}