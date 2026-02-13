//src/hooks/useGamification.ts

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
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const [showXPToast, setShowXPToast] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number;
    levelsGained: number;
    xpGained: number;
  } | null>(null);

  const [showBadgeToast, setShowBadgeToast] = useState(false);
  const [newBadge, setNewBadge] = useState<BadgeDefinition | null>(null);

  const loadProgress = useCallback(async () => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch('/api/gamification/progress', {
          headers: getAuthHeaders(),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setProgress(data.progress);
        } else if (response.status === 401) {
          setProgress(null);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.error('Request timed out');
        } else {
          console.error('Failed to load progress:', error);
        }
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Unexpected error in loadProgress:', error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const completeCourse = useCallback(async (courseId: string): Promise<CompletionResult | null> => {
    if (!user) {
      console.warn('Cannot complete course: user not logged in');
      return null;
    }

    try {
      const response = await fetch('/api/gamification/action', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'complete-course', courseId })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: 'Failed to complete course' };
        }

        console.error('Course completion failed:', response.status, errorData);

        if (errorData.message && errorData.message.includes('quiz')) {
          throw new Error(errorData.message);
        }

        throw new Error(errorData.error || 'Failed to complete course');
      }

      const result: CompletionResult = await response.json();

      if (result.alreadyCompleted) {
        console.log('Course already completed. No new rewards.');
        return result;
      }

      setXpGained(result.xpGained);
      setShowXPToast(true);

      if (result.leveledUp) {
        setLevelUpData({
          newLevel: result.newLevel,
          levelsGained: result.levelsGained,
          xpGained: result.xpGained
        });
        setShowLevelUpModal(true);
      }

      if (result.newBadges && result.newBadges.length > 0) {
        setTimeout(() => {
          setNewBadge(result.newBadges[0]);
          setShowBadgeToast(true);
        }, result.leveledUp ? 1000 : 500);

        result.newBadges.slice(1).forEach((badge, index) => {
          setTimeout(() => {
            setNewBadge(badge);
            setShowBadgeToast(true);
          }, (result.leveledUp ? 5500 : 5000) + (index * 5000));
        });
      }

      await loadProgress();

      return result;
    } catch (error) {
      console.error('Failed to complete course:', error);
      throw error;
    }
  }, [user, loadProgress]);

  const readArticle = useCallback(async (articleId: string, wordCount?: number) => {
    if (!user) {
      console.warn('Cannot record article read: user not logged in');
      return null;
    }

    try {
      const response = await fetch('/api/gamification/action', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'read-article', articleId, wordCount })
      });

      if (!response.ok) {
        throw new Error('Failed to record article read');
      }

      const result = await response.json();

      setXpGained(result.xpGained);
      setShowXPToast(true);

      await loadProgress();

      return result;
    } catch (error) {
      console.error('Failed to read article:', error);
      return null;
    }
  }, [user, loadProgress]);

  const postComment = useCallback(async () => {
    if (!user) {
      console.warn('Cannot record comment: user not logged in');
      return null;
    }

    try {
      const response = await fetch('/api/gamification/action', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'post-comment' })
      });

      if (!response.ok) {
        throw new Error('Failed to record comment');
      }

      const result = await response.json();

      if (result.newBadges && result.newBadges.length > 0) {
        setNewBadge(result.newBadges[0]);
        setShowBadgeToast(true);
      }

      await loadProgress();

      return result;
    } catch (error) {
      console.error('Failed to post comment:', error);
      return null;
    }
  }, [user, loadProgress]);

  return {
    progress,
    loading,
    user,

    completeCourse,
    readArticle,
    postComment,
    loadProgress,

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
