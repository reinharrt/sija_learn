// src/lib/gamification-client.ts

// Level tier definitions
export interface LevelTier {
    name: string;
    icon: string;
    color: string;
    minLevel: number;
}

export const LEVEL_TIERS: LevelTier[] = [
    { name: 'Newbie', icon: 'Sprout', color: 'text-green-600', minLevel: 1 },
    { name: 'Learner', icon: 'BookOpen', color: 'text-blue-600', minLevel: 5 },
    { name: 'Scholar', icon: 'GraduationCap', color: 'text-purple-600', minLevel: 10 },
    { name: 'Expert', icon: 'Star', color: 'text-yellow-600', minLevel: 20 },
    { name: 'Master', icon: 'Crown', color: 'text-orange-600', minLevel: 35 },
    { name: 'Legend', icon: 'Trophy', color: 'text-red-600', minLevel: 50 },
];

// Get level tier based on current level
export function getLevelTier(level: number): LevelTier {
    for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
        if (level >= LEVEL_TIERS[i].minLevel) {
            return LEVEL_TIERS[i];
        }
    }
    return LEVEL_TIERS[0];
}

// Calculate XP required for a specific level
export function calculateXPForLevel(level: number): number {
    if (level <= 1) return 0;

    // Formula: Base 100 XP + 50 XP per level
    // Level 1: 0 XP
    // Level 2: 100 XP
    // Level 3: 150 XP
    // Level 4: 200 XP
    let totalXP = 0;
    for (let i = 2; i <= level; i++) {
        totalXP += 100 + (i - 2) * 50;
    }
    return totalXP;
}

// Calculate level from total XP
export function calculateLevel(totalXP: number): number {
    let level = 1;
    let xpForNextLevel = 100;
    let accumulatedXP = 0;

    while (totalXP >= accumulatedXP + xpForNextLevel) {
        accumulatedXP += xpForNextLevel;
        level++;
        xpForNextLevel = 100 + (level - 2) * 50;
    }

    return level;
}

// Get XP progress for current level
export function getXPProgress(totalXP: number, currentLevel: number) {
    const xpForCurrentLevel = calculateXPForLevel(currentLevel);
    const xpForNextLevel = calculateXPForLevel(currentLevel + 1);

    const currentLevelXP = totalXP - xpForCurrentLevel;
    const xpForNext = xpForNextLevel - xpForCurrentLevel;
    const percentage = Math.min(Math.max((currentLevelXP / xpForNext) * 100, 0), 100);

    return {
        currentLevelXP,
        xpForNext,
        percentage,
        xpToNextLevel: xpForNext - currentLevelXP
    };
}

// Format XP number
export function formatXP(xp: number): string {
    if (xp >= 1000000) {
        return `${(xp / 1000000).toFixed(1)}M`;
    }
    if (xp >= 1000) {
        return `${(xp / 1000).toFixed(1)}K`;
    }
    return xp.toString();
}