// src/lib/xp-calculator.ts

import { type CourseDifficulty } from './gamification';

/**
 * Calculate total XP yang akan didapat dari course
 */
export function calculateCourseXP(
  difficulty: CourseDifficulty = 'beginner',
  articleCount: number = 1
): number {
  const baseXP = {
    beginner: 50,
    intermediate: 100,
    advanced: 200
  };

  // Base XP + bonus for articles
  const articleBonus = Math.floor(articleCount * 10);
  return baseXP[difficulty] + articleBonus;
}

/**
 * Calculate XP untuk single article read
 */
export function calculateArticleXP(wordCount?: number): number {
  const baseXP = 10;

  if (!wordCount) return baseXP;

  // Bonus for longer articles
  if (wordCount > 2000) return 30;
  if (wordCount > 1000) return 20;

  return baseXP;
}

/**
 * Get difficulty display text
 */
export function getDifficultyDisplay(difficulty?: CourseDifficulty): string {
  const display = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
  };

  return display[difficulty || 'beginner'];
}

/**
 * Get difficulty color classes
 */
export function getDifficultyColor(difficulty?: CourseDifficulty): string {
  const colors = {
    beginner: 'text-green-600 bg-green-100 border-green-500',
    intermediate: 'text-blue-600 bg-blue-100 border-blue-500',
    advanced: 'text-purple-600 bg-purple-100 border-purple-500'
  };

  return colors[difficulty || 'beginner'];
}

/**
 * Format XP dengan thousand separator
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString();
}

/**
 * Get estimated time untuk complete course (rough estimate)
 */
export function estimateCourseTime(articleCount: number, difficulty?: CourseDifficulty): string {
  const baseMinutesPerArticle = {
    beginner: 5,
    intermediate: 10,
    advanced: 15
  };

  const minutesPerArticle = baseMinutesPerArticle[difficulty || 'beginner'];
  const totalMinutes = articleCount * minutesPerArticle;

  if (totalMinutes < 60) {
    return `~${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `~${hours}h`;
  }

  return `~${hours}h ${minutes}m`;
}

// ============================================
// LEVEL CALCULATION UTILITIES
// ============================================

/**
 * Calculate level from total XP
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) return 1;

  // Level tiers with increasing XP requirements
  const tiers = [
    { max: 10, xpPerLevel: 100 },     // Levels 1-10: Bronze
    { max: 25, xpPerLevel: 200 },     // Levels 11-25: Silver
    { max: 50, xpPerLevel: 500 },     // Levels 26-50: Gold
    { max: Infinity, xpPerLevel: 1000 } // Levels 51+: Diamond
  ];

  let level = 1;
  let remainingXP = xp;

  for (const tier of tiers) {
    const levelsInTier = tier.max - level + 1;
    const xpNeededForTier = levelsInTier * tier.xpPerLevel;

    if (remainingXP >= xpNeededForTier) {
      remainingXP -= xpNeededForTier;
      level = tier.max;
    } else {
      level += Math.floor(remainingXP / tier.xpPerLevel);
      break;
    }
  }

  return level;
}

/**
 * Get XP needed for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  if (currentLevel <= 10) return 100;
  if (currentLevel <= 25) return 200;
  if (currentLevel <= 50) return 500;
  return 1000;
}

/**
 * Get XP progress to next level
 */
export function getXPProgress(totalXP: number, currentLevel: number): {
  currentLevelXP: number;
  xpForNext: number;
  percentage: number;
} {
  const xpForNext = xpForNextLevel(currentLevel);

  // Calculate XP at start of current level
  let xpAtLevelStart = 0;
  for (let i = 1; i < currentLevel; i++) {
    xpAtLevelStart += xpForNextLevel(i);
  }

  const currentLevelXP = totalXP - xpAtLevelStart;
  const percentage = Math.min((currentLevelXP / xpForNext) * 100, 100);

  return { currentLevelXP, xpForNext, percentage };
}