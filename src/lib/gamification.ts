// ============================================
// src/lib/gamification.ts
// Gamification Core Logic - XP, Levels, Badges
// ============================================

import { 
  getUserProgress, 
  addXP, 
  awardBadge, 
  incrementStat,
  updateStats,
  type UserProgress 
} from '@/models/UserProgress';
import { BADGES, getBadgeById, type BadgeDefinition } from './badge-definitions';

// ============================================
// COURSE XP CALCULATION
// ============================================
export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export function calculateCourseXP(
  difficulty: CourseDifficulty,
  articleCount: number = 1
): number {
  const baseXP = {
    beginner: 50,
    intermediate: 100,
    advanced: 200
  };

  // Base XP + bonus for more articles
  const articleBonus = Math.floor(articleCount * 10);
  return baseXP[difficulty] + articleBonus;
}

// ============================================
// ARTICLE XP CALCULATION
// ============================================
export function calculateArticleXP(wordCount?: number): number {
  const baseXP = 10;
  
  if (!wordCount) return baseXP;
  
  // Bonus for longer articles
  if (wordCount > 2000) return 30;
  if (wordCount > 1000) return 20;
  
  return baseXP;
}

// ============================================
// COMPLETE COURSE - Award XP and check badges
// ============================================
export async function completeCourse(
  userId: string,
  courseId: string,
  difficulty: CourseDifficulty,
  articleCount: number
): Promise<{
  xpGained: number;
  leveledUp: boolean;
  levelsGained: number;
  newLevel: number;
  newBadges: BadgeDefinition[];
}> {
  // Calculate XP
  const xpGained = calculateCourseXP(difficulty, articleCount);
  
  // Add XP to user
  const { newLevel, leveledUp, levelsGained } = await addXP(
    userId,
    xpGained,
    `Completed course: ${courseId}`
  );
  
  // Increment course completion stat
  await incrementStat(userId, 'coursesCompleted', 1);
  
  // Check for new badges
  const newBadges = await checkAndAwardBadges(userId);
  
  return {
    xpGained,
    leveledUp,
    levelsGained,
    newLevel,
    newBadges
  };
}

// ============================================
// READ ARTICLE - Award XP
// ============================================
export async function readArticle(
  userId: string,
  articleId: string,
  wordCount?: number
): Promise<{ xpGained: number }> {
  const xpGained = calculateArticleXP(wordCount);
  
  await addXP(userId, xpGained, `Read article: ${articleId}`);
  await incrementStat(userId, 'articlesRead', 1);
  
  return { xpGained };
}

// ============================================
// POST COMMENT - Award XP
// ============================================
export async function postComment(userId: string): Promise<{ xpGained: number }> {
  const xpGained = 5;
  
  await addXP(userId, xpGained, 'Posted comment');
  await incrementStat(userId, 'commentsPosted', 1);
  
  // Check for comment badges
  await checkAndAwardBadges(userId);
  
  return { xpGained };
}

// ============================================
// CHECK AND AWARD BADGES
// ============================================
export async function checkAndAwardBadges(userId: string): Promise<BadgeDefinition[]> {
  const progress = await getUserProgress(userId);
  if (!progress) return [];
  
  const newBadges: BadgeDefinition[] = [];
  
  for (const badge of BADGES) {
    // Skip if already earned
    if (progress.badges.includes(badge.id)) continue;
    
    // Check if requirements are met
    if (checkBadgeRequirement(badge, progress)) {
      await awardBadge(userId, badge.id);
      newBadges.push(badge);
      
      // Award bonus XP if badge has it
      if (badge.xpReward) {
        await addXP(userId, badge.xpReward, `Earned badge: ${badge.name}`);
      }
    }
  }
  
  return newBadges;
}

// ============================================
// CHECK BADGE REQUIREMENT
// ============================================
function checkBadgeRequirement(
  badge: BadgeDefinition,
  progress: UserProgress
): boolean {
  const { requirement } = badge;
  const operator = requirement.operator || 'gte';
  
  let currentValue: number;
  
  switch (requirement.type) {
    case 'xp':
      currentValue = progress.totalXP;
      break;
    case 'level':
      currentValue = progress.currentLevel;
      break;
    case 'courses':
      currentValue = progress.stats.coursesCompleted;
      break;
    case 'articles':
      currentValue = progress.stats.articlesRead;
      break;
    case 'comments':
      currentValue = progress.stats.commentsPosted;
      break;
    case 'streak':
      currentValue = progress.stats.currentStreak;
      break;
    case 'special':
      // Special badges need manual awarding
      return false;
    default:
      return false;
  }
  
  const targetValue = typeof requirement.value === 'number' ? requirement.value : 0;
  
  switch (operator) {
    case 'gte':
      return currentValue >= targetValue;
    case 'eq':
      return currentValue === targetValue;
    case 'lte':
      return currentValue <= targetValue;
    default:
      return false;
  }
}

// ============================================
// UPDATE STREAK
// ============================================
export async function updateStreak(userId: string): Promise<{
  currentStreak: number;
  isNewRecord: boolean;
}> {
  const progress = await getUserProgress(userId);
  if (!progress) {
    return { currentStreak: 0, isNewRecord: false };
  }
  
  const now = new Date();
  const lastActivity = progress.stats.lastActivityDate;
  const diffInDays = Math.floor(
    (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  let newStreak = progress.stats.currentStreak;
  let isNewRecord = false;
  
  if (diffInDays === 0) {
    // Same day, no change
    return { currentStreak: newStreak, isNewRecord: false };
  } else if (diffInDays === 1) {
    // Consecutive day, increment
    newStreak += 1;
  } else {
    // Streak broken, reset
    newStreak = 1;
  }
  
  // Check if new record
  if (newStreak > progress.stats.longestStreak) {
    isNewRecord = true;
  }
  
  await updateStats(userId, {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, progress.stats.longestStreak),
    lastActivityDate: now
  });
  
  // Check for streak badges
  await checkAndAwardBadges(userId);
  
  return { currentStreak: newStreak, isNewRecord };
}

// ============================================
// GET LEVEL TIER NAME
// ============================================
export function getLevelTier(level: number): {
  name: string;
  color: string;
  icon: string;
} {
  if (level <= 10) {
    return { name: 'Bronze', color: 'text-amber-700', icon: '🥉' };
  } else if (level <= 25) {
    return { name: 'Silver', color: 'text-gray-400', icon: '🥈' };
  } else if (level <= 50) {
    return { name: 'Gold', color: 'text-yellow-500', icon: '🥇' };
  } else {
    return { name: 'Diamond', color: 'text-cyan-400', icon: '💎' };
  }
}

// ============================================
// MANUALLY AWARD SPECIAL BADGE
// ============================================
export async function awardSpecialBadge(
  userId: string,
  badgeId: string
): Promise<boolean> {
  const badge = getBadgeById(badgeId);
  if (!badge || badge.requirement.type !== 'special') {
    return false;
  }
  
  await awardBadge(userId, badgeId);
  
  // Award bonus XP
  if (badge.xpReward) {
    await addXP(userId, badge.xpReward, `Earned special badge: ${badge.name}`);
  }
  
  return true;
}

// ============================================
// GET USER BADGES WITH DETAILS
// ============================================
export async function getUserBadgesWithDetails(userId: string): Promise<{
  earned: BadgeDefinition[];
  locked: BadgeDefinition[];
  progress: Record<string, number>;
}> {
  const progress = await getUserProgress(userId);
  if (!progress) {
    return { earned: [], locked: BADGES, progress: {} };
  }
  
  const earned: BadgeDefinition[] = [];
  const locked: BadgeDefinition[] = [];
  const progressMap: Record<string, number> = {};
  
  for (const badge of BADGES) {
    if (progress.badges.includes(badge.id)) {
      earned.push(badge);
    } else if (!badge.hidden) {
      locked.push(badge);
      
      // Calculate progress percentage
      const percentage = calculateBadgeProgress(badge, progress);
      progressMap[badge.id] = percentage;
    }
  }
  
  return { earned, locked, progress: progressMap };
}

// ============================================
// CALCULATE BADGE PROGRESS
// ============================================
function calculateBadgeProgress(
  badge: BadgeDefinition,
  progress: UserProgress
): number {
  const { requirement } = badge;
  const targetValue = typeof requirement.value === 'number' ? requirement.value : 0;
  
  let currentValue: number;
  
  switch (requirement.type) {
    case 'xp':
      currentValue = progress.totalXP;
      break;
    case 'level':
      currentValue = progress.currentLevel;
      break;
    case 'courses':
      currentValue = progress.stats.coursesCompleted;
      break;
    case 'articles':
      currentValue = progress.stats.articlesRead;
      break;
    case 'comments':
      currentValue = progress.stats.commentsPosted;
      break;
    case 'streak':
      currentValue = progress.stats.currentStreak;
      break;
    default:
      return 0;
  }
  
  return Math.min((currentValue / targetValue) * 100, 100);
}