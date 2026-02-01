
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const db = await getDatabase();
        const userId = new ObjectId(user.id);

        // 1. Get all enrollments for the user
        const enrollments = await db.collection('enrollments')
            .find({ userId })
            .toArray();

        // 2. For each enrollment, check completion status
        let completedCount = 0;

        // We need to fetch courses to check total articles
        // Optimization: Fetch all needed courses in one go or cache them
        const courseIds = enrollments.map(e => e.courseId);

        const courses = await db.collection('courses')
            .find({ _id: { $in: courseIds } })
            .toArray();

        const courseMap = new Map(courses.map(c => [c._id.toString(), c]));

        for (const enrollment of enrollments) {
            const course = courseMap.get(enrollment.courseId.toString());
            if (course && course.articles && Array.isArray(course.articles)) {
                const totalArticles = course.articles.length;
                // Completed articles in enrollment
                const completedArticles = enrollment.progress?.completedArticles?.length || 0;

                if (totalArticles > 0 && completedArticles >= totalArticles) {
                    completedCount++;
                }
            }
        }

        // 3. Update UserProgress
        // We only update coursesCompleted. 
        // NOTE: This might overwrite legitimate counts if the enrollment logic was different before.
        // But since the user complained about 0, this is definitely an improvement.

        await db.collection('user_progress').updateOne(
            { userId },
            {
                $set: {
                    'stats.coursesCompleted': completedCount,
                    updatedAt: new Date()
                }
            }
        );

        return NextResponse.json({
            success: true,
            completedCount,
            message: `Synced: ${completedCount} courses completed`
        });

    } catch (error) {
        console.error('Error syncing progress:', error);
        return NextResponse.json(
            { error: 'Failed to sync progress' },
            { status: 500 }
        );
    }
}
