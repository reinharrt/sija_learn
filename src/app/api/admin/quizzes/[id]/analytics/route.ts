// ============================================
// src/app/api/admin/quizzes/[id]/analytics/route.ts
// Admin API - Quiz Analytics
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { findQuizById } from '@/models/Quiz';
import { getQuizStatistics } from '@/models/QuizAttempt';
import { UserRole } from '@/types';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const statistics = await getQuizStatistics(params.id);

        return NextResponse.json({
            quiz: {
                id: quiz._id,
                title: quiz.title,
                type: quiz.type,
                passingScore: quiz.passingScore,
                questionCount: quiz.questions.length
            },
            statistics
        });

    } catch (error: any) {
        console.error('Error fetching quiz analytics:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch quiz analytics' },
            { status: 500 }
        );
    }
}
