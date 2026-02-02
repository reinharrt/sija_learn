// ============================================
// src/app/api/quizzes/[id]/submit/route.ts
// Student API - Submit Quiz Attempt
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { findQuizById } from '@/models/Quiz';
import { gradeQuizAttempt, getAttemptCount, hasUserPassedQuiz } from '@/models/QuizAttempt';
import { isUserEnrolled } from '@/models/Enrollment';
import { addXP } from '@/models/UserProgress';

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

        const quiz = await findQuizById(params.id);

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        if (!quiz.published) {
            return NextResponse.json(
                { error: 'This quiz is not published yet' },
                { status: 403 }
            );
        }

        // Check if user is enrolled in the course
        const enrolled = await isUserEnrolled(user.id, quiz.courseId.toString());

        if (!enrolled) {
            return NextResponse.json(
                { error: 'You must be enrolled in this course to take this quiz' },
                { status: 403 }
            );
        }

        // Check attempt limit
        if (quiz.maxAttempts) {
            const attemptCount = await getAttemptCount(user.id, params.id);
            if (attemptCount >= quiz.maxAttempts) {
                return NextResponse.json(
                    { error: 'Maximum attempts reached for this quiz' },
                    { status: 403 }
                );
            }
        }

        // Check prerequisites
        if (quiz.prerequisiteQuizIds && quiz.prerequisiteQuizIds.length > 0) {
            // Import check logic or repeat it
            // Since we can't easily import the logic from the route handler, and we are in the same package (effectively),
            // I'll reuse the model function.
            // But I need to import hasUserPassedQuiz first. It is imported.

            for (const prereqId of quiz.prerequisiteQuizIds) {
                const passed = await hasUserPassedQuiz(user.id, prereqId.toString());
                if (!passed) {
                    return NextResponse.json(
                        { error: 'Prerequisites not met. You must complete previous quizzes first.' },
                        { status: 403 }
                    );
                }
            }
        }

        const body = await request.json();
        const { answers, startedAt } = body;

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'Invalid answers format' },
                { status: 400 }
            );
        }

        if (!startedAt) {
            return NextResponse.json(
                { error: 'Start time is required' },
                { status: 400 }
            );
        }

        // Grade the quiz
        const result = await gradeQuizAttempt(
            params.id,
            user.id,
            answers,
            new Date(startedAt)
        );

        // Award XP if passed
        if (result.passed && result.attempt.xpEarned > 0) {
            await addXP(
                user.id,
                result.attempt.xpEarned,
                `Passed quiz: ${quiz.title}`
            );
        }

        return NextResponse.json({
            success: true,
            result
        });

    } catch (error: any) {
        console.error('Error submitting quiz:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to submit quiz' },
            { status: 500 }
        );
    }
}
