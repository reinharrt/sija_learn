// src/lib/badge-definitions.ts

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'progress' | 'streak' | 'social' | 'speed' | 'explorer' | 'special';

export interface BadgeRequirement {
  type: 'xp' | 'level' | 'courses' | 'articles' | 'comments' | 'streak' | 'speed' | 'categories' | 'special';
  value: number | string;
  operator?: 'gte' | 'eq' | 'lte';
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  requirement: BadgeRequirement;
  hidden?: boolean; // Secret badges
  xpReward?: number; // Bonus XP for earning this badge
}

// Badge Colors by Rarity
export const RARITY_COLORS = {
  common: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-400',
    text: 'text-gray-700 dark:text-gray-300',
    glow: 'shadow-gray-400/50'
  },
  rare: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
    glow: 'shadow-blue-500/50'
  },
  epic: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-500',
    text: 'text-purple-700 dark:text-purple-300',
    glow: 'shadow-purple-500/50'
  },
  legendary: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    glow: 'shadow-amber-500/50'
  }
};

// All Badges
export const BADGES: BadgeDefinition[] = [
  // ==================== PROGRESS BADGES ====================
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first course',
    icon: 'GraduationCap',
    rarity: 'common',
    category: 'progress',
    requirement: { type: 'courses', value: 1, operator: 'gte' },
    xpReward: 50
  },
  {
    id: 'learner',
    name: 'Dedicated Learner',
    description: 'Complete 5 courses',
    icon: 'BookOpen',
    rarity: 'common',
    category: 'progress',
    requirement: { type: 'courses', value: 5, operator: 'gte' },
    xpReward: 100
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete 10 courses',
    icon: 'Target',
    rarity: 'rare',
    category: 'progress',
    requirement: { type: 'courses', value: 10, operator: 'gte' },
    xpReward: 200
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Complete 25 courses',
    icon: 'Trophy',
    rarity: 'epic',
    category: 'progress',
    requirement: { type: 'courses', value: 25, operator: 'gte' },
    xpReward: 500
  },
  {
    id: 'master',
    name: 'Master',
    description: 'Complete 50 courses',
    icon: 'Crown',
    rarity: 'legendary',
    category: 'progress',
    requirement: { type: 'courses', value: 50, operator: 'gte' },
    xpReward: 1000
  },

  // ==================== LEVEL BADGES ====================
  {
    id: 'bronze-tier',
    name: 'Bronze Tier',
    description: 'Reach level 10',
    icon: 'Medal',
    rarity: 'common',
    category: 'progress',
    requirement: { type: 'level', value: 10, operator: 'gte' },
    xpReward: 100
  },
  {
    id: 'silver-tier',
    name: 'Silver Tier',
    description: 'Reach level 25',
    icon: 'Medal',
    rarity: 'rare',
    category: 'progress',
    requirement: { type: 'level', value: 25, operator: 'gte' },
    xpReward: 250
  },
  {
    id: 'gold-tier',
    name: 'Gold Tier',
    description: 'Reach level 50',
    icon: 'Medal',
    rarity: 'epic',
    category: 'progress',
    requirement: { type: 'level', value: 50, operator: 'gte' },
    xpReward: 500
  },
  {
    id: 'diamond-tier',
    name: 'Diamond Tier',
    description: 'Reach level 75',
    icon: 'Gem',
    rarity: 'legendary',
    category: 'progress',
    requirement: { type: 'level', value: 75, operator: 'gte' },
    xpReward: 1000
  },

  // ==================== STREAK BADGES ====================
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: 'Flame',
    rarity: 'common',
    category: 'streak',
    requirement: { type: 'streak', value: 7, operator: 'gte' },
    xpReward: 150
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: 'Maintain a 30-day learning streak',
    icon: 'Zap',
    rarity: 'rare',
    category: 'streak',
    requirement: { type: 'streak', value: 30, operator: 'gte' },
    xpReward: 500
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 100-day learning streak',
    icon: 'Rocket',
    rarity: 'epic',
    category: 'streak',
    requirement: { type: 'streak', value: 100, operator: 'gte' },
    xpReward: 1500
  },

  // ==================== SOCIAL BADGES ====================
  {
    id: 'first-comment',
    name: 'Voice Heard',
    description: 'Post your first comment',
    icon: 'MessageCircle',
    rarity: 'common',
    category: 'social',
    requirement: { type: 'comments', value: 1, operator: 'gte' },
    xpReward: 25
  },
  {
    id: 'conversationalist',
    name: 'Conversationalist',
    description: 'Post 50 comments',
    icon: 'MessageSquare',
    rarity: 'rare',
    category: 'social',
    requirement: { type: 'comments', value: 50, operator: 'gte' },
    xpReward: 200
  },
  {
    id: 'community-hero',
    name: 'Community Hero',
    description: 'Post 200 comments',
    icon: 'Users',
    rarity: 'epic',
    category: 'social',
    requirement: { type: 'comments', value: 200, operator: 'gte' },
    xpReward: 500
  },

  // ==================== READING BADGES ====================
  {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Read 20 articles',
    icon: 'Book',
    rarity: 'common',
    category: 'progress',
    requirement: { type: 'articles', value: 20, operator: 'gte' },
    xpReward: 100
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Read 100 articles',
    icon: 'Search',
    rarity: 'rare',
    category: 'progress',
    requirement: { type: 'articles', value: 100, operator: 'gte' },
    xpReward: 300
  },

  // ==================== SPEED BADGES ====================
  {
    id: 'speed-learner',
    name: 'Speed Learner',
    description: 'Complete a course in one day',
    icon: 'Timer',
    rarity: 'rare',
    category: 'speed',
    requirement: { type: 'speed', value: 1, operator: 'lte' },
    xpReward: 200
  },

  // ==================== SPECIAL BADGES ====================
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'One of the first 100 users',
    icon: 'Sprout',
    rarity: 'legendary',
    category: 'special',
    requirement: { type: 'special', value: 'early_adopter' },
    xpReward: 500
  },
  {
    id: 'beta-tester',
    name: 'Beta Tester',
    description: 'Participated in the beta program',
    icon: 'FlaskConical',
    rarity: 'epic',
    category: 'special',
    requirement: { type: 'special', value: 'beta_tester' },
    xpReward: 300
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete 10 courses between midnight and 4 AM',
    icon: 'Moon',
    rarity: 'rare',
    category: 'special',
    requirement: { type: 'special', value: 'night_owl' },
    xpReward: 250,
    hidden: true
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 5 courses with 100% accuracy',
    icon: 'Sparkles',
    rarity: 'epic',
    category: 'special',
    requirement: { type: 'special', value: 'perfectionist' },
    xpReward: 400,
    hidden: true
  }
];

// Helper Functions
export function getBadgeById(badgeId: string): BadgeDefinition | undefined {
  return BADGES.find(badge => badge.id === badgeId);
}

export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return BADGES.filter(badge => badge.category === category);
}

export function getBadgesByRarity(rarity: BadgeRarity): BadgeDefinition[] {
  return BADGES.filter(badge => badge.rarity === rarity);
}

export function getVisibleBadges(): BadgeDefinition[] {
  return BADGES.filter(badge => !badge.hidden);
}

export function getAllBadges(): BadgeDefinition[] {
  return BADGES;
}