// ============================================
// src/app/api/quiz/[id]/review/route.ts
// API Route - Get quiz attempt results for review
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getBestAttempt } from '@/models/QuizAttempt';
import { findQuizById } from '@/models/Quiz';
import { findCourseById } from '@/models/Course';

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

        const { id: quizId } = await params;

        // Get quiz details
        const quiz = await findQuizById(quizId);
        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        // Get course slug
        const course = await findCourseById(quiz.courseId.toString());
        const courseSlug = course?.slug;

        // Get user's best attempt
        const bestAttempt = await getBestAttempt(user.id, quizId);

        if (!bestAttempt) {
            return NextResponse.json(
                { error: 'No attempt found for this quiz' },
                { status: 404 }
            );
        }

        // Build question results with correct answers
        const questionResults = quiz.questions.map((question) => {
            const userAnswer = bestAttempt.answers.find(
                (a) => a.questionId === question.id
            );

            const correctOptions = question.options
                .filter((opt) => opt.isCorrect)
                .map((opt) => opt.id)
                .sort();

            const studentAnswer = userAnswer?.selectedOptions || [];
            const sortedSelected = [...studentAnswer].sort();
            const isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(correctOptions);

            return {
                questionId: question.id,
                question: question.question,
                type: question.type,
                options: question.options, // Include all options with correct answers
                studentAnswer: studentAnswer,
                correctAnswer: correctOptions,
                isCorrect,
                points: question.points,
                earnedPoints: isCorrect ? question.points : 0,
                explanation: question.explanation
            };
        });

        // Calculate totals
        const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
        const earnedPoints = questionResults.reduce((sum, qr) => sum + qr.earnedPoints, 0);
        const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

        return NextResponse.json({
            quiz: {
                title: quiz.title,
                description: quiz.description,
                passingScore: quiz.passingScore
            },
            attempt: {
                score: bestAttempt.score,
                passed: bestAttempt.passed,
                xpEarned: bestAttempt.xpEarned,
                timeSpent: bestAttempt.timeSpent,
                completedAt: bestAttempt.completedAt
            },
            questionResults,
            totalPoints,
            earnedPoints,
            percentage,
            passed: bestAttempt.passed,
            courseSlug
        });
    } catch (error: any) {
        console.error('Error fetching quiz review:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch quiz review' },
            { status: 500 }
        );
    }
}
