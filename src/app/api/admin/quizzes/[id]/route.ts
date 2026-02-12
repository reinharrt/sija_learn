// src/app/api/admin/quizzes/[id]/route.ts




import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { findQuizById, updateQuiz, deleteQuiz } from '@/models/Quiz';
import { UserRole, QuizQuestionType } from '@/types';
import { ObjectId } from 'mongodb';


export async function GET(
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

        return NextResponse.json({ quiz });

    } catch (error: any) {
        console.error('Error fetching quiz:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch quiz' },
            { status: 500 }
        );
    }
}


export async function PUT(
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
        const {
            title,
            description,
            questions,
            passingScore,
            timeLimit,
            maxAttempts,
            xpReward,
            prerequisiteQuizIds,
            published
        } = body;


        if (questions && questions.length > 0) {
            for (const question of questions) {
                if (!question.question || !question.type || !question.options || question.options.length === 0) {
                    return NextResponse.json(
                        { error: 'Invalid question format' },
                        { status: 400 }
                    );
                }

                const hasCorrectAnswer = question.options.some((opt: any) => opt.isCorrect);
                if (!hasCorrectAnswer) {
                    return NextResponse.json(
                        { error: `Question "${question.question}" must have at least one correct answer` },
                        { status: 400 }
                    );
                }

                if (question.type === QuizQuestionType.MULTIPLE_CHOICE) {
                    const correctCount = question.options.filter((opt: any) => opt.isCorrect).length;
                    if (correctCount !== 1) {
                        return NextResponse.json(
                            { error: `Multiple choice question "${question.question}" must have exactly one correct answer` },
                            { status: 400 }
                        );
                    }
                }

                if (question.type === QuizQuestionType.TRUE_FALSE && question.options.length !== 2) {
                    return NextResponse.json(
                        { error: `True/False question "${question.question}" must have exactly 2 options` },
                        { status: 400 }
                    );
                }
            }
        }

        if (passingScore !== undefined && (passingScore < 0 || passingScore > 100)) {
            return NextResponse.json(
                { error: 'Passing score must be between 0 and 100' },
                { status: 400 }
            );
        }


        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (questions !== undefined) updates.questions = questions;
        if (passingScore !== undefined) updates.passingScore = passingScore;
        if (timeLimit !== undefined) updates.timeLimit = timeLimit;
        if (maxAttempts !== undefined) updates.maxAttempts = maxAttempts;
        if (xpReward !== undefined) updates.xpReward = xpReward;
        if (prerequisiteQuizIds !== undefined) {
            updates.prerequisiteQuizIds = prerequisiteQuizIds.map((id: string) => new ObjectId(id));
        }
        if (published !== undefined) updates.published = published;

        const success = await updateQuiz(params.id, updates);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to update quiz' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error updating quiz:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update quiz' },
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

        const quiz = await findQuizById(params.id);

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }






        const success = await deleteQuiz(params.id);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to delete quiz' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error deleting quiz:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete quiz' },
            { status: 500 }
        );
    }
}
