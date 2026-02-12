// src/app/api/profile/[userId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await context.params;
        const db = await getDatabase();

        // 1. Fetch User
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        const { password, ...userProfile } = user;

        // 2. Fetch Progress
        let progress = await db.collection('user_progress').findOne({ userId: new ObjectId(userId) });

        if (!progress) {
            // If no progress found, return default/empty progress
            progress = {
                _id: new ObjectId(),
                userId: new ObjectId(userId),
                totalXP: 0,
                currentLevel: 1,
                badges: [],
                stats: {
                    coursesCompleted: 0,
                    articlesRead: 0,
                    commentsPosted: 0,
                    currentStreak: 0,
                    longestStreak: 0
                }
            } as any;
        }

        // 3. Calculate Rank
        const rank = await db.collection('user_progress').countDocuments({
            totalXP: { $gt: progress?.totalXP || 0 }
        }) + 1;

        // 4. Get Badges (if utilizing badge definitions)
        // For now, we'll return the raw ID list or minimal info
        // You might want to expand this to include badge details (name, icon)
        // For now preventing frontend break by ensuring badges array exists
        const badges = {
            earned: [], // You'd populate this from definitions based on progress.badges
            locked: [],
            progress: {}
        };

        return NextResponse.json({
            user: userProfile,
            progress,
            badges,
            rank
        });

    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
