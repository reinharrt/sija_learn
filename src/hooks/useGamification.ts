// ============================================
// src/hooks/useGamification.ts
// Custom Hook - Gamification with AUTH CHECK
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { type BadgeDefinition } from '@/lib/badge-definitions';

interface UserProgress {
  _id?: string;
  userId: string;
  totalXP: number;
  currentLevel: number;
  badges: string[];
  stats: {
    coursesCompleted: number;
    articlesRead: number;
    commentsPosted: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface CompletionResult {
  xpGained: number;
  leveledUp: boolean;
  levelsGained: number;
  newLevel: number;
  newBadges: BadgeDefinition[];
  alreadyCompleted?: boolean;
}

export function useGamification() {
  const { user } = useAuth(); // ✅ GET USER FROM AUTH CONTEXT
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Toast states
  const [showXPToast, setShowXPToast] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  // Level up modal states
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number;
    levelsGained: number;
    xpGained: number;
  } | null>(null);

  // Badge toast states
  const [showBadgeToast, setShowBadgeToast] = useState(false);
  const [newBadge, setNewBadge] = useState<BadgeDefinition | null>(null);

  // Load user progress
  const loadProgress = useCallback(async () => {
    // ✅ ONLY LOAD IF USER IS LOGGED IN
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/gamification/progress', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
      } else if (response.status === 401) {
        // User not authenticated, just set progress to null
        setProgress(null);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user]); // ✅ DEPEND ON USER

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Complete course and award XP
  const completeCourse = useCallback(async (courseId: string): Promise<CompletionResult | null> => {
    // ✅ CHECK IF USER IS LOGGED IN
    if (!user) {
      console.warn('Cannot complete course: user not logged in');
      return null;
    }

    try {
      const response = await fetch('/api/gamification/complete-course', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Course completion failed:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to complete course');
      }

      const result: CompletionResult = await response.json();

      // IF ALREADY COMPLETED, DO NOT SHOW TOASTS
      if (result.alreadyCompleted) {
        console.log('Course already completed. No new rewards.');
        return result;
      }

      // Show XP toast
      setXpGained(result.xpGained);
      setShowXPToast(true);

      // Show level up modal if leveled up
      if (result.leveledUp) {
        setLevelUpData({
          newLevel: result.newLevel,
          levelsGained: result.levelsGained,
          xpGained: result.xpGained
        });
        setShowLevelUpModal(true);
      }

      // Show badge toasts for new badges (one at a time)
      if (result.newBadges && result.newBadges.length > 0) {
        // Show first badge after a delay
        setTimeout(() => {
          setNewBadge(result.newBadges[0]);
          setShowBadgeToast(true);
        }, result.leveledUp ? 1000 : 500);

        // Show subsequent badges with delays
        result.newBadges.slice(1).forEach((badge, index) => {
          setTimeout(() => {
            setNewBadge(badge);
            setShowBadgeToast(true);
          }, (result.leveledUp ? 5500 : 5000) + (index * 5000));
        });
      }

      // Reload progress
      await loadProgress();

      return result;
    } catch (error) {
      console.error('Failed to complete course:', error);
      return null;
    }
  }, [user, loadProgress]); // ✅ DEPEND ON USER

  // Read article and award XP
  const readArticle = useCallback(async (articleId: string, wordCount?: number) => {
    // ✅ CHECK IF USER IS LOGGED IN
    if (!user) {
      console.warn('Cannot record article read: user not logged in');
      return null;
    }

    try {
      const response = await fetch('/api/gamification/read-article', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ articleId, wordCount })
      });

      if (!response.ok) {
        throw new Error('Failed to record article read');
      }

      const result = await response.json();

      // Show XP toast
      setXpGained(result.xpGained);
      setShowXPToast(true);

      // Reload progress
      await loadProgress();

      return result;
    } catch (error) {
      console.error('Failed to read article:', error);
      return null;
    }
  }, [user, loadProgress]); // ✅ DEPEND ON USER

  // Post comment and award XP
  const postComment = useCallback(async () => {
    // ✅ CHECK IF USER IS LOGGED IN
    if (!user) {
      console.warn('Cannot record comment: user not logged in');
      return null;
    }

    try {
      const response = await fetch('/api/gamification/post-comment', {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to record comment');
      }

      const result = await response.json();

      // Check for new badges
      if (result.newBadges && result.newBadges.length > 0) {
        setNewBadge(result.newBadges[0]);
        setShowBadgeToast(true);
      }

      // Reload progress
      await loadProgress();

      return result;
    } catch (error) {
      console.error('Failed to post comment:', error);
      return null;
    }
  }, [user, loadProgress]); // ✅ DEPEND ON USER

  return {
    // State
    progress,
    loading,
    user, // ✅ EXPOSE USER STATE

    // Actions
    completeCourse,
    readArticle,
    postComment,
    loadProgress,

    // Toast controls
    showXPToast,
    setShowXPToast,
    xpGained,

    showLevelUpModal,
    setShowLevelUpModal,
    levelUpData,

    showBadgeToast,
    setShowBadgeToast,
    newBadge
  };
}