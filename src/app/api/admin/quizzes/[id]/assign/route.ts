// ============================================
// src/app/api/admin/quizzes/[id]/assign/route.ts
// Admin API - Assign Quiz to Article or Course
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { findQuizById, updateQuiz } from '@/models/Quiz';
import { setArticleQuiz } from '@/models/Article';
import { setFinalQuiz } from '@/models/Course';
import { UserRole, QuizType } from '@/types';
import { ObjectId } from 'mongodb';

// POST
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

        // Assign to article
        if (assignType === 'article' && articleId) {
            // Update quiz with articleId AND ensure correct type
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

        // Assign as final course quiz
        if (assignType === 'final' && courseId) {
            // Update quiz type to FINAL_QUIZ
            await updateQuiz(params.id, {
                type: QuizType.FINAL_QUIZ,
                // Ensure articleId is unset if it was previously an article quiz
                // We should manually unset it or rely on setArticleQuiz(null) if it was assigned elsewhere.
            });

            // If it was previously assigned to an article, we should unassign it from that article.
            // However, we don't know which article easily without fetching or checking `quiz.articleId`.
            if (quiz.articleId) {
                await setArticleQuiz(quiz.articleId.toString(), null);

                // Also unset in quiz document (though we just set type, we didn't unset articleId in updateQuiz above unless we add it)
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

// DELETE - Unassign quiz
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

        // Unassign from article
        if (assignType === 'article' && articleId) {
            const success = await setArticleQuiz(articleId, null);

            // Also unset articleId on the quiz itself
            // The `updateQuiz` function supports partial updates.
            // We need to unset articleId. MongoDB `updateQuiz` uses $set.
            // We need to modify `updateQuiz` or manually do it.
            // But wait, `updateQuiz` only does $set.
            // So I should import the collection and do it manually here or add a helper.
            // Or, update `updateQuiz` to handle specific keys being null?
            // Let's implement manual update here for now to be safe and quick.
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

        // Unassign final quiz
        if (assignType === 'final' && courseId) {
            const success = await setFinalQuiz(courseId, null);

            // For final quiz, we convert it to ARTICLE_QUIZ so it shows as "Article Quiz" (Not Assigned)
            // This is the best way to represent "Unassigned" in the current type system.
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
