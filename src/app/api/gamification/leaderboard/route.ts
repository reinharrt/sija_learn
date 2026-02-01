// ============================================
// src/app/api/gamification/leaderboard/route.ts
// API Route - Get leaderboard with populated user data
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getDatabase();
    const progressCollection = db.collection('user_progress');

    // Get top users with populated user data
    const leaderboard = await progressCollection
      .aggregate([
        {
          $sort: { totalXP: -1 }
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 1,
            userId: {
              _id: '$user._id',
              name: '$user.name',
              email: '$user.email'
            },
            totalXP: 1,
            currentLevel: 1,
            stats: 1
          }
        }
      ])
      .toArray();

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}