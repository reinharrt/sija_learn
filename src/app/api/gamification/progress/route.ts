//src/app/api/gamification/progress/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const requestedUserId = searchParams.get('userId');

        const authenticatedUser = getUserFromRequest(request);

        if (!authenticatedUser) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const targetUserId = requestedUserId || authenticatedUser.id;

        if (!ObjectId.isValid(targetUserId)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        const db = await getDatabase();
        const userId = new ObjectId(targetUserId);

        let progress = await db.collection('user_progress').findOne({ userId });

        if (!progress) {
            const newProgress = {
                userId,
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
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await db.collection('user_progress').insertOne(newProgress);
            progress = { ...newProgress, _id: result.insertedId };
        }

        if (requestedUserId) {
            const user = await db.collection('users').findOne({ _id: userId });
            return NextResponse.json({
                progress,
                user: user ? {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                } : null
            });
        }

        return NextResponse.json({ progress });
    } catch (error) {
        console.error('Failed to fetch progress:', error);
        return NextResponse.json(
            { error: 'Failed to fetch progress' },
            { status: 500 }
        );
    }
}
