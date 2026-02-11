// src/app/api/admin/courses/[id]/articles/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { findCourseById } from '@/models/Course';
import { findArticleById } from '@/models/Article';
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
        const course = await findCourseById(id);

        if (!course) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        const articles = await Promise.all(
            course.articles.map(async (articleId) => {
                const article = await findArticleById(articleId.toString());
                if (!article) return null;

                return {
                    _id: article._id?.toString(),
                    title: article.title,
                    slug: article.slug,
                    quizId: article.quizId?.toString() || null
                };
            })
        );

        const validArticles = articles.filter(a => a !== null);

        return NextResponse.json({ articles: validArticles });

    } catch (error: any) {
        console.error('Error fetching course articles:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch course articles' },
            { status: 500 }
        );
    }
}
