// src/app/api/admin/quizzes/[id]/assign/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { findQuizById, updateQuiz } from '@/models/Quiz';
import { setArticleQuiz } from '@/models/Article';
import { setFinalQuiz } from '@/models/Course';
import { UserRole, QuizType } from '@/types';
import { ObjectId } from 'mongodb';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = getUserFromRequest(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!hasPermission(user.role, UserRole.COURSE_ADMIN)) {
            return NextResponse.json(
                { error: 'Forbidden: Course Admin required' },
                { status: 403 }
            );
        }

        const quiz = await findQuizById(params.id);

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { articleId, courseId, assignType } = body;

        if (assignType === 'article' && articleId) {
            await updateQuiz(params.id, {
                articleId: new ObjectId(articleId),
                type: QuizType.ARTICLE_QUIZ
            });

            const success = await setArticleQuiz(articleId, params.id);

            if (!success) {
                return NextResponse.json(
                    { error: 'Failed to assign quiz to article' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Quiz assigned to article successfully'
            });
        }

        if (assignType === 'final' && courseId) {
            await updateQuiz(params.id, {
                type: QuizType.FINAL_QUIZ,
            });

            if (quiz.articleId) {
                await setArticleQuiz(quiz.articleId.toString(), null);

                const db = await import('@/lib/mongodb').then(m => m.getDatabase());
                await db.collection('quizzes').updateOne(
                    { _id: new ObjectId(params.id) },
                    { $unset: { articleId: "" } }
                );
            }

            const success = await setFinalQuiz(courseId, params.id);

            if (!success) {
                return NextResponse.json(
                    { error: 'Failed to set final quiz for course' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Quiz set as final course quiz successfully'
            });
        }

        return NextResponse.json(
            { error: 'Invalid assignment parameters' },
            { status: 400 }
        );

    } catch (error: any) {
        console.error('Error assigning quiz:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to assign quiz' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = getUserFromRequest(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!hasPermission(user.role, UserRole.COURSE_ADMIN)) {
            return NextResponse.json(
                { error: 'Forbidden: Course Admin required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { articleId, courseId, assignType } = body;

        if (assignType === 'article' && articleId) {
            const success = await setArticleQuiz(articleId, null);

            const db = await import('@/lib/mongodb').then(m => m.getDatabase());
            await db.collection('quizzes').updateOne(
                { _id: new ObjectId(params.id) },
                { $unset: { articleId: "" } }
            );

            if (!success) {
                return NextResponse.json(
                    { error: 'Failed to unassign quiz from article' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Quiz unassigned from article successfully'
            });
        }

        if (assignType === 'final' && courseId) {
            const success = await setFinalQuiz(courseId, null);

            await updateQuiz(params.id, { type: QuizType.ARTICLE_QUIZ });

            if (!success) {
                return NextResponse.json(
                    { error: 'Failed to remove final quiz from course' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Final quiz removed from course successfully'
            });
        }

        return NextResponse.json(
            { error: 'Invalid assignment parameters' },
            { status: 400 }
        );

    } catch (error: any) {
        console.error('Error unassigning quiz:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to unassign quiz' },
            { status: 500 }
        );
    }
}
