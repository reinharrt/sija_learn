// src/app/api/quizzes/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getQuizForStudent, findQuizById } from '@/models/Quiz';
import { findCourseById } from '@/models/Course';
import { getUserQuizAttempts, getAttemptCount, hasUserPassedQuiz } from '@/models/QuizAttempt';
import { isUserEnrolled } from '@/models/Enrollment';

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

        const quiz = await findQuizById(params.id);

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        const enrolled = await isUserEnrolled(user.id, quiz.courseId.toString());

        if (!enrolled) {
            return NextResponse.json(
                { error: 'You must be enrolled in this course to access this quiz' },
                { status: 403 }
            );
        }

        const sanitizedQuiz = await getQuizForStudent(params.id);

        const attempts = await getUserQuizAttempts(user.id, params.id);
        const attemptCount = await getAttemptCount(user.id, params.id);
        const hasPassed = await hasUserPassedQuiz(user.id, params.id);

        const canAttempt = !quiz.maxAttempts || attemptCount < quiz.maxAttempts;

        const bestScore = attempts.length > 0
            ? Math.max(...attempts.map(a => a.score))
            : null;

        const course = await findCourseById(quiz.courseId.toString());
        const courseSlug = course?.slug;

        let isLocked = false;
        let lockedReason = null;
        const missingPrerequisites: { id: string; title: string }[] = [];

        if (quiz.prerequisiteQuizIds && quiz.prerequisiteQuizIds.length > 0) {
            for (const prereqId of quiz.prerequisiteQuizIds) {
                const passed = await hasUserPassedQuiz(user.id, prereqId.toString());
                if (!passed) {
                    isLocked = true;
                    const prereqQuiz = await findQuizById(prereqId.toString());
                    if (prereqQuiz) {
                        missingPrerequisites.push({
                            id: prereqId.toString(),
                            title: prereqQuiz.title
                        });
                    }
                }
            }

            if (isLocked) {
                lockedReason = 'Prerequisites not met';
                if (sanitizedQuiz) {
                    sanitizedQuiz.questions = [];
                }
            }
        }

        return NextResponse.json({
            quiz: sanitizedQuiz,
            userProgress: {
                attemptCount,
                hasPassed,
                canAttempt,
                bestScore,
                remainingAttempts: quiz.maxAttempts ? quiz.maxAttempts - attemptCount : null
            },
            isLocked,
            lockedReason,
            missingPrerequisites,
            courseSlug
        });

    } catch (error: any) {
        console.error('Error fetching quiz:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch quiz' },
            { status: 500 }
        );
    }
}
