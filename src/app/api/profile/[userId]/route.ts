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

        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        const { password, ...userProfile } = user;

        let progress = await db.collection('user_progress').findOne({ userId: new ObjectId(userId) });

        if (!progress) {
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

        const rank = await db.collection('user_progress').countDocuments({
            totalXP: { $gt: progress?.totalXP || 0 }
        }) + 1;

        const badges = {
            earned: [],
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
