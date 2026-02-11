// src/app/api/courses/[id]/quiz-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { findQuizzesByCourse } from '@/models/Quiz';
import { getBestAttempt } from '@/models/QuizAttempt';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getUserFromRequest(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: courseId } = await params;

        const quizzes = await findQuizzesByCourse(courseId);

        const quizStatusPromises = quizzes.map(async (quiz) => {
            const bestAttempt = await getBestAttempt(user.id, quiz._id!.toString());

            return {
                quizId: quiz._id!.toString(),
                title: quiz.title,
                type: quiz.type,
                passingScore: quiz.passingScore,
                published: quiz.published,
                attempt: bestAttempt ? {
                    score: bestAttempt.score,
                    passed: bestAttempt.passed,
                    completedAt: bestAttempt.completedAt
                } : null
            };
        });

        const quizStatuses = await Promise.all(quizStatusPromises);

        const publishedQuizzes = quizStatuses.filter(q => q.published);

        const totalQuizzes = publishedQuizzes.length;
        const passedQuizzes = publishedQuizzes.filter(q => q.attempt?.passed).length;
        const percentage = totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 100;

        return NextResponse.json({
            quizzes: publishedQuizzes,
            summary: {
                total: totalQuizzes,
                passed: passedQuizzes,
                percentage,
                allPassed: passedQuizzes === totalQuizzes
            }
        });
    } catch (error: any) {
        console.error('Error fetching quiz status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch quiz status' },
            { status: 500 }
        );
    }
}
