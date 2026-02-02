// ============================================
// src/app/api/admin/quizzes/create/route.ts
// Admin API - Create Quiz
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { createQuiz } from '@/models/Quiz';
import { UserRole, QuizQuestionType, QuizType } from '@/types';
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

        if (!hasPermission(user.role, UserRole.COURSE_ADMIN)) {
            return NextResponse.json(
                { error: 'Forbidden: Course Admin required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            title,
            description,
            courseId,
            articleId,
            type,
            questions,
            passingScore,
            timeLimit,
            maxAttempts,
            xpReward,
            prerequisiteQuizIds,
            published
        } = body;

        // Validation
        if (!title || !courseId || !type || !questions || questions.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (passingScore < 0 || passingScore > 100) {
            return NextResponse.json(
                { error: 'Passing score must be between 0 and 100' },
                { status: 400 }
            );
        }

        // Validate questions
        for (const question of questions) {
            if (!question.question || !question.type || !question.options || question.options.length === 0) {
                return NextResponse.json(
                    { error: 'Invalid question format' },
                    { status: 400 }
                );
            }

            // Check if at least one option is marked as correct
            const hasCorrectAnswer = question.options.some((opt: any) => opt.isCorrect);
            if (!hasCorrectAnswer) {
                return NextResponse.json(
                    { error: `Question "${question.question}" must have at least one correct answer` },
                    { status: 400 }
                );
            }

            // For MULTIPLE_CHOICE, ensure only one correct answer
            if (question.type === QuizQuestionType.MULTIPLE_CHOICE) {
                const correctCount = question.options.filter((opt: any) => opt.isCorrect).length;
                if (correctCount !== 1) {
                    return NextResponse.json(
                        { error: `Multiple choice question "${question.question}" must have exactly one correct answer` },
                        { status: 400 }
                    );
                }
            }

            // For TRUE_FALSE, ensure exactly 2 options
            if (question.type === QuizQuestionType.TRUE_FALSE && question.options.length !== 2) {
                return NextResponse.json(
                    { error: `True/False question "${question.question}" must have exactly 2 options` },
                    { status: 400 }
                );
            }
        }

        // Create quiz
        const quizData = {
            title,
            description: description || '', // Keep default for description if not provided
            courseId: new ObjectId(courseId),
            articleId: articleId ? new ObjectId(articleId) : undefined,
            type: type as QuizType, // Cast type
            questions,
            passingScore: passingScore || 70, // Keep default for passingScore if not provided
            timeLimit,
            maxAttempts,
            xpReward: xpReward || 100, // Keep default for xpReward if not provided
            prerequisiteQuizIds: prerequisiteQuizIds ? prerequisiteQuizIds.map((id: string) => new ObjectId(id)) : [],
            createdBy: new ObjectId(user.id), // Changed from session.user.id to user.id
            published: published || false // Keep default for published if not provided
        };
        const quizId = await createQuiz(quizData);

        return NextResponse.json({
            success: true,
            quizId: quizId.toString()
        });

    } catch (error: any) {
        console.error('Error creating quiz:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create quiz' },
            { status: 500 }
        );
    }
}
