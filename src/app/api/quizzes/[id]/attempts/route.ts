// ============================================
// src/app/api/quizzes/[id]/attempts/route.ts
// Student API - Get Quiz Attempt History
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { findQuizById } from '@/models/Quiz';
import { getUserQuizAttempts, getBestAttempt } from '@/models/QuizAttempt';

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

        const quiz = await findQuizById(params.id);

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        const attempts = await getUserQuizAttempts(user.id, params.id);
        const bestAttempt = await getBestAttempt(user.id, params.id);

        return NextResponse.json({
            attempts,
            bestAttempt,
            totalAttempts: attempts.length
        });

    } catch (error: any) {
        console.error('Error fetching quiz attempts:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch quiz attempts' },
            { status: 500 }
        );
    }
}
