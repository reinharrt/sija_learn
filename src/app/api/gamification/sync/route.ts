//src/app/api/gamification/sync/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { UserRole } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const authenticatedUser = getUserFromRequest(request);

        if (!authenticatedUser) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const requestedUserId = searchParams.get('userId');

        if (requestedUserId && authenticatedUser.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: 'Only admins can sync progress for other users' },
                { status: 403 }
            );
        }

        const targetUserId = requestedUserId || authenticatedUser.id;
        const db = await getDatabase();
        const userId = new ObjectId(targetUserId);

        const enrollments = await db.collection('enrollments')
            .find({ userId })
            .toArray();

        const completedCourseIds = enrollments
            .filter(e => e.completed === true)
            .map(e => e.courseId.toString());

        const courses = await db.collection('courses')
            .find({ _id: { $in: completedCourseIds.map(id => new ObjectId(id)) } })
            .toArray();

        const totalCoursesCompleted = courses.length;

        await db.collection('user_progress').updateOne(
            { userId },
            {
                $set: {
                    'stats.coursesCompleted': totalCoursesCompleted,
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        const updatedProgress = await db.collection('user_progress').findOne({ userId });

        return NextResponse.json({
            message: 'Progress synced successfully',
            progress: updatedProgress
        });
    } catch (error) {
        console.error('Failed to sync progress:', error);
        return NextResponse.json(
            { error: 'Failed to sync progress' },
            { status: 500 }
        );
    }
}
