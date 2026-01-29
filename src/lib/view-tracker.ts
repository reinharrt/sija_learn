// ============================================
// src/lib/view-tracker.ts
// View Tracking System - Prevent duplicate views
// ============================================

import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

interface ViewRecord {
  articleId: ObjectId;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  userId?: ObjectId; // Optional: if user is logged in
}

/**
 * Check if view should be counted
 * Rules:
 * 1. Same IP + Article = Only count once per 24 hours
 * 2. Logged in user + Article = Only count once per 24 hours (regardless of IP)
 */
export async function shouldCountView(
  articleId: string,
  ipAddress: string,
  userId?: string,
  timeWindow: number = 24 * 60 * 60 * 1000 // 24 hours default
): Promise<boolean> {
  try {
    const db = await getDatabase();
    const collection = db.collection<ViewRecord>('article_views');

    const timeThreshold = new Date(Date.now() - timeWindow);

    // Check by userId first (if logged in)
    if (userId) {
      const existingView = await collection.findOne({
        articleId: new ObjectId(articleId),
        userId: new ObjectId(userId),
        timestamp: { $gte: timeThreshold },
      });

      if (existingView) {
        console.log('🚫 View already counted for this user within time window');
        return false;
      }
    }

    // Check by IP address (for anonymous users or as fallback)
    const existingViewByIP = await collection.findOne({
      articleId: new ObjectId(articleId),
      ipAddress: ipAddress,
      timestamp: { $gte: timeThreshold },
    });

    if (existingViewByIP) {
      console.log('🚫 View already counted for this IP within time window');
      return false;
    }

    console.log('✅ New view, should count');
    return true;
  } catch (error) {
    console.error('View check error:', error);
    // On error, allow view to be counted (fail open)
    return true;
  }
}

/**
 * Record a view in the database
 */
export async function recordView(
  articleId: string,
  ipAddress: string,
  userAgent: string,
  userId?: string
): Promise<void> {
  try {
    const db = await getDatabase();
    const collection = db.collection<ViewRecord>('article_views');

    const viewRecord: ViewRecord = {
      articleId: new ObjectId(articleId),
      ipAddress,
      userAgent,
      timestamp: new Date(),
    };

    if (userId) {
      viewRecord.userId = new ObjectId(userId);
    }

    await collection.insertOne(viewRecord);
    console.log('📊 View recorded successfully');
  } catch (error) {
    console.error('Record view error:', error);
  }
}

/**
 * Increment article view count (call after shouldCountView returns true)
 */
export async function incrementArticleViews(articleId: string): Promise<void> {
  try {
    const db = await getDatabase();
    const collection = db.collection('articles');

    await collection.updateOne(
      { _id: new ObjectId(articleId) },
      { 
        $inc: { views: 1 },
        $set: { updatedAt: new Date() }
      }
    );
    
    console.log('📈 Article view count incremented');
  } catch (error) {
    console.error('Increment views error:', error);
  }
}

/**
 * Get view statistics for an article
 */
export async function getArticleViewStats(articleId: string) {
  try {
    const db = await getDatabase();
    const collection = db.collection<ViewRecord>('article_views');

    const [totalViews, uniqueIPs, last24h, last7days] = await Promise.all([
      // Total views all time
      collection.countDocuments({ articleId: new ObjectId(articleId) }),
      
      // Unique IP addresses
      collection.distinct('ipAddress', { articleId: new ObjectId(articleId) }).then(ips => ips.length),
      
      // Views in last 24 hours
      collection.countDocuments({
        articleId: new ObjectId(articleId),
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      
      // Views in last 7 days
      collection.countDocuments({
        articleId: new ObjectId(articleId),
        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
    ]);

    return {
      totalViews,
      uniqueIPs,
      last24h,
      last7days,
    };
  } catch (error) {
    console.error('Get view stats error:', error);
    return null;
  }
}

/**
 * Clean up old view records (run periodically via cron)
 * Keep only last 90 days of data
 */
export async function cleanupOldViews(): Promise<number> {
  try {
    const db = await getDatabase();
    const collection = db.collection<ViewRecord>('article_views');

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const result = await collection.deleteMany({
      timestamp: { $lt: ninetyDaysAgo }
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} old view records`);
    return result.deletedCount;
  } catch (error) {
    console.error('Cleanup views error:', error);
    return 0;
  }
}

/**
 * Create indexes for view tracking collection
 */
export async function createViewIndexes(): Promise<void> {
  try {
    const db = await getDatabase();
    const collection = db.collection<ViewRecord>('article_views');

    await Promise.all([
      // Compound index for checking duplicate views
      collection.createIndex(
        { articleId: 1, ipAddress: 1, timestamp: -1 },
        { name: 'article_ip_time' }
      ),
      
      // Index for userId-based checks
      collection.createIndex(
        { articleId: 1, userId: 1, timestamp: -1 },
        { name: 'article_user_time' }
      ),
      
      // TTL index to auto-delete old records after 90 days
      collection.createIndex(
        { timestamp: 1 },
        { expireAfterSeconds: 90 * 24 * 60 * 60, name: 'ttl_90days' }
      ),
    ]);

    console.log('✅ View tracking indexes created');
  } catch (error) {
    console.error('Create indexes error:', error);
  }
}