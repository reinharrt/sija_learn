// ============================================
// src/app/api/courses/[id]/quizzes/route.ts
// Get all quizzes for a course with completion status
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { findCourseById } from '@/models/Course';
import { findQuizzesByCourse, findFinalQuizByCourse } from '@/models/Quiz';
import { findArticleById } from '@/models/Article';
import { getQuizAttemptsByUser } from '@/models/QuizAttempt';
import { ObjectId } from 'mongodb';

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

        const { id } = await params;

        // Get course
        const course = await findCourseById(id);
        if (!course) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        // Get all quizzes for this course
        const allQuizzes = await findQuizzesByCourse(id);

        // Get user's quiz attempts
        const userAttempts = await getQuizAttemptsByUser(user.id);

        // Create a map of quiz attempts for quick lookup
        const attemptMap = new Map();
        userAttempts.forEach(attempt => {
            const quizId = attempt.quizId.toString();
            if (!attemptMap.has(quizId) || attempt.score > attemptMap.get(quizId).score) {
                attemptMap.set(quizId, {
                    score: attempt.score,
                    passed: attempt.passed,
                    attempts: (attemptMap.get(quizId)?.attempts || 0) + 1,
                    lastAttempt: attempt.completedAt
                });
            }
        });

        // Separate article quizzes and final quiz
        const articleQuizzes: any[] = [];
        let finalQuiz: any = null;

        for (const quiz of allQuizzes) {
            const quizId = quiz._id!.toString();
            const completionStatus = attemptMap.get(quizId) || {
                score: 0,
                passed: false,
                attempts: 0,
                lastAttempt: null
            };

            const quizData = {
                _id: quizId,
                title: quiz.title,
                description: quiz.description,
                type: quiz.type,
                passingScore: quiz.passingScore,
                timeLimit: quiz.timeLimit,
                maxAttempts: quiz.maxAttempts,
                xpReward: quiz.xpReward,
                published: quiz.published,
                articleId: quiz.articleId?.toString(),
                completion: completionStatus
            };

            if (quiz.articleId) {
                // Article quiz - get article info
                const article = await findArticleById(quiz.articleId.toString());
                if (article) {
                    articleQuizzes.push({
                        ...quizData,
                        article: {
                            _id: article._id!.toString(),
                            title: article.title,
                            slug: article.slug
                        }
                    });
                }
            } else {
                // Final quiz
                finalQuiz = quizData;
            }
        }

        return NextResponse.json({
            articleQuizzes,
            finalQuiz
        }, { status: 200 });

    } catch (error) {
        console.error('Get course quizzes error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
