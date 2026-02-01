// ============================================
// src/models/UserProgress.ts
// UserProgress Model - SERVER-SIDE ONLY
// ============================================

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { calculateLevel } from '@/lib/xp-calculator';

export interface UserProgress {
  _id?: ObjectId;
  userId: ObjectId;
  totalXP: number;
  currentLevel: number;
  badges: string[]; // Badge IDs earned
  stats: {
    coursesCompleted: number;
    articlesRead: number;
    commentsPosted: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
  };
  milestones: {
    firstCourseDate?: Date;
    first10CoursesDate?: Date;
    level10Date?: Date;
    level25Date?: Date;
    level50Date?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'user_progress';

// ============================================
// CREATE OR INITIALIZE USER PROGRESS
// ============================================
export async function initializeUserProgress(userId: string): Promise<ObjectId> {
  const db = await getDatabase();
  const collection = db.collection<UserProgress>(COLLECTION_NAME);

  // Check if already exists
  const existing = await collection.findOne({ userId: new ObjectId(userId) });
  if (existing) {
    return existing._id!;
  }

  const progress: UserProgress = {
    userId: new ObjectId(userId),
    totalXP: 0,
    currentLevel: 1,
    badges: [],
    stats: {
      coursesCompleted: 0,
      articlesRead: 0,
      commentsPosted: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date()
    },
    milestones: {},
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await collection.insertOne(progress);
  return result.insertedId;
}

// ============================================
// GET USER PROGRESS
// ============================================
export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  const db = await getDatabase();
  const collection = db.collection<UserProgress>(COLLECTION_NAME);

  return collection.findOne({ userId: new ObjectId(userId) });
}

// ============================================
// ADD XP TO USER
// ============================================
export async function addXP(
  userId: string,
  xpAmount: number,
  reason: string
): Promise<{
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
  levelsGained: number;
}> {
  const db = await getDatabase();
  const collection = db.collection<UserProgress>(COLLECTION_NAME);

  const progress = await getUserProgress(userId);
  if (!progress) {
    await initializeUserProgress(userId);
    return addXP(userId, xpAmount, reason);
  }

  const oldLevel = progress.currentLevel;
  const newXP = progress.totalXP + xpAmount;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > oldLevel;
  const levelsGained = newLevel - oldLevel;

  await collection.updateOne(
    { userId: new ObjectId(userId) },
    {
      $set: {
        totalXP: newXP,
        currentLevel: newLevel,
        updatedAt: new Date()
      }
    }
  );

  return { newXP, newLevel, leveledUp, levelsGained };
}

// ============================================
// AWARD BADGE TO USER
// ============================================
export async function awardBadge(userId: string, badgeId: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<UserProgress>(COLLECTION_NAME);

  const result = await collection.updateOne(
    { userId: new ObjectId(userId) },
    {
      $addToSet: { badges: badgeId },
      $set: { updatedAt: new Date() }
    }
  );

  return result.modifiedCount > 0;
}

// ============================================
// UPDATE USER STATS
// ============================================
export async function updateStats(
  userId: string,
  updates: Partial<UserProgress['stats']>
): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<UserProgress>(COLLECTION_NAME);

  const setObject: any = { updatedAt: new Date() };
  for (const [key, value] of Object.entries(updates)) {
    setObject[`stats.${key}`] = value;
  }

  const result = await collection.updateOne(
    { userId: new ObjectId(userId) },
    { $set: setObject }
  );

  return result.modifiedCount > 0;
}

// ============================================
// INCREMENT STAT
// ============================================
export async function incrementStat(
  userId: string,
  stat: keyof UserProgress['stats'],
  amount: number = 1
): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<UserProgress>(COLLECTION_NAME);

  const result = await collection.updateOne(
    { userId: new ObjectId(userId) },
    {
      $inc: { [`stats.${stat}`]: amount },
      $set: { updatedAt: new Date() }
    }
  );

  return result.modifiedCount > 0;
}

// ============================================
// GET LEADERBOARD
// ============================================
export async function getLeaderboard(limit: number = 50) {
  const db = await getDatabase();
  const collection = db.collection<UserProgress>(COLLECTION_NAME);

  return collection
    .find()
    .sort({ totalXP: -1 })
    .limit(limit)
    .toArray();
}

// ============================================
// GET USER RANK
// ============================================
export async function getUserRank(userId: string): Promise<number> {
  const db = await getDatabase();
  const collection = db.collection<UserProgress>(COLLECTION_NAME);

  const progress = await getUserProgress(userId);
  if (!progress) return -1;

  const rank = await collection.countDocuments({
    totalXP: { $gt: progress.totalXP }
  });

  return rank + 1;
}

// ============================================
// CREATE INDEXES
// ============================================
export async function createIndexes() {
  const db = await getDatabase();
  const collection = db.collection<UserProgress>(COLLECTION_NAME);

  await collection.createIndex({ userId: 1 }, { unique: true });
  await collection.createIndex({ totalXP: -1 });
  await collection.createIndex({ currentLevel: -1 });
  await collection.createIndex({ 'stats.coursesCompleted': -1 });
}