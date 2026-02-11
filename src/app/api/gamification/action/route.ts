//src/app/api/gamification/action/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readArticle, postComment, completeCourse } from '@/lib/gamification';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { isCourseCompleted, markCourseCompleted } from '@/models/Enrollment';

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action } = body;

        if (!action) {
            return NextResponse.json(
                { error: 'Action is required' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'read-article': {
                const { articleId, wordCount } = body;

                if (!articleId) {
                    return NextResponse.json(
                        { error: 'Article ID is required' },
                        { status: 400 }
                    );
                }

                const result = await readArticle(user.id, articleId, wordCount);
                return NextResponse.json(result);
            }

            case 'post-comment': {
                const result = await postComment(user.id);
                return NextResponse.json(result);
            }

            case 'complete-course': {
                const { courseId } = body;

                if (!courseId) {
                    return NextResponse.json(
                        { error: 'Course ID is required' },
                        { status: 400 }
                    );
                }

                const db = await getDatabase();
                const userId = new ObjectId(user.id);
                const courseObjectId = new ObjectId(courseId);

                const alreadyCompleted = await isCourseCompleted(user.id, courseId);
                if (alreadyCompleted) {
                    return NextResponse.json({
                        xpGained: 0,
                        leveledUp: false,
                        levelsGained: 0,
                        newLevel: 0,
                        newBadges: [],
                        alreadyCompleted: true,
                        message: 'Course already completed'
                    });
                }

                const course = await db.collection('courses').findOne({ _id: courseObjectId });
                if (!course) {
                    return NextResponse.json(
                        { error: 'Course not found' },
                        { status: 404 }
                    );
                }

                if (course.quizId) {
                    const quizObjectId = new ObjectId(course.quizId);
                    const passedAttempt = await db.collection('quiz_attempts').findOne({
                        userId: userId,
                        quizId: quizObjectId,
                        passed: true
                    });

                    if (!passedAttempt) {
                        return NextResponse.json(
                            {
                                error: 'Quiz not completed',
                                message: 'Anda harus menyelesaikan quiz terlebih dahulu untuk menyelesaikan course ini.'
                            },
                            { status: 400 }
                        );
                    }
                }

                await markCourseCompleted(user.id, courseId);

                const difficulty = course.difficulty || 'beginner';
                const articleCount = course.articles?.length || 0;
                const result = await completeCourse(user.id, courseId, difficulty, articleCount);
                return NextResponse.json(result);
            }

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Supported actions: read-article, post-comment, complete-course' },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        console.error('Gamification action error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
