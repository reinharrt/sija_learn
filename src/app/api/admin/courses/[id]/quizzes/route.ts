// ============================================
// src/app/api/admin/courses/[id]/quizzes/route.ts
// Admin API - Get all quizzes for a course
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { findQuizzesByCourse } from '@/models/Quiz';
import { UserRole } from '@/types';

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

        if (!hasPermission(user.role, UserRole.COURSE_ADMIN)) {
            return NextResponse.json(
                { error: 'Forbidden: Course Admin required' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const quizzes = await findQuizzesByCourse(id);

        return NextResponse.json({ quizzes });

    } catch (error: any) {
        console.error('Error fetching quizzes:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch quizzes' },
            { status: 500 }
        );
    }
}
