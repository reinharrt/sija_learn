// src/models/QuizAttempt.ts

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { QuizAttempt, Quiz, QuizResult, QuizQuestionType } from '@/types';
import { findQuizById } from './Quiz';

const COLLECTION_NAME = 'quiz_attempts';

// ============================================
// CREATE QUIZ ATTEMPT
// ============================================
export async function createQuizAttempt(attemptData: Omit<QuizAttempt, '_id'>): Promise<ObjectId> {
    const db = await getDatabase();
    const collection = db.collection<QuizAttempt>(COLLECTION_NAME);

    const result = await collection.insertOne(attemptData as QuizAttempt);
    return result.insertedId;
}

// ============================================
// GRADE QUIZ ATTEMPT
// ============================================
export async function gradeQuizAttempt(
    quizId: string,
    userId: string,
    answers: QuizAttempt['answers'],
    startedAt: Date
): Promise<QuizResult> {
    const quiz = await findQuizById(quizId);
    if (!quiz) {
        throw new Error('Quiz not found');
    }

    let totalPoints = 0;
    let earnedPoints = 0;
    const questionResults = [];

    // Grade each question
    for (const question of quiz.questions) {
        totalPoints += question.points;

        const studentAnswer = answers.find(a => a.questionId === question.id);
        const selectedOptions = studentAnswer?.selectedOptions || [];

        // Get correct answer option IDs
        const correctOptions = question.options
            .filter(opt => opt.isCorrect)
            .map(opt => opt.id)
            .sort();

        // Check if answer is correct
        const sortedSelected = [...selectedOptions].sort();
        const isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(correctOptions);

        if (isCorrect) {
            earnedPoints += question.points;
        }

        questionResults.push({
            questionId: question.id,
            question: question.question,
            type: question.type,
            studentAnswer: selectedOptions,
            correctAnswer: correctOptions,
            isCorrect,
            points: question.points,
            earnedPoints: isCorrect ? question.points : 0,
            explanation: question.explanation
        });
    }

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passingScore;
    const xpEarned = passed ? quiz.xpReward : 0;

    const completedAt = new Date();
    const timeSpent = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);

    // Create attempt record
    const attempt: Omit<QuizAttempt, '_id'> = {
        quizId: new ObjectId(quizId),
        userId: new ObjectId(userId),
        answers,
        score: percentage,
        passed,
        xpEarned,
        timeSpent,
        startedAt,
        completedAt
    };

    const attemptId = await createQuizAttempt(attempt);

    return {
        attempt: { ...attempt, _id: attemptId },
        questionResults,
        totalPoints,
        earnedPoints,
        percentage,
        passed
    };
}

// ============================================
// GET USER ATTEMPTS FOR QUIZ
// ============================================
export async function getUserQuizAttempts(userId: string, quizId: string): Promise<QuizAttempt[]> {
    const db = await getDatabase();
    const collection = db.collection<QuizAttempt>(COLLECTION_NAME);

    return collection
        .find({
            userId: new ObjectId(userId),
            quizId: new ObjectId(quizId)
        })
        .sort({ completedAt: -1 })
        .toArray();
}

// ============================================
// GET BEST ATTEMPT
// ============================================
export async function getBestAttempt(userId: string, quizId: string): Promise<QuizAttempt | null> {
    const db = await getDatabase();
    const collection = db.collection<QuizAttempt>(COLLECTION_NAME);

    const attempts = await collection
        .find({
            userId: new ObjectId(userId),
            quizId: new ObjectId(quizId)
        })
        .sort({ score: -1 })
        .limit(1)
        .toArray();

    return attempts[0] || null;
}

// ============================================
// GET ATTEMPT COUNT
// ============================================
export async function getAttemptCount(userId: string, quizId: string): Promise<number> {
    const db = await getDatabase();
    const collection = db.collection<QuizAttempt>(COLLECTION_NAME);

    return collection.countDocuments({
        userId: new ObjectId(userId),
        quizId: new ObjectId(quizId)
    });
}

// ============================================
// CHECK IF USER PASSED QUIZ
// ============================================
export async function hasUserPassedQuiz(userId: string, quizId: string): Promise<boolean> {
    const db = await getDatabase();
    const collection = db.collection<QuizAttempt>(COLLECTION_NAME);

    const passedAttempt = await collection.findOne({
        userId: new ObjectId(userId),
        quizId: new ObjectId(quizId),
        passed: true
    });

    return passedAttempt !== null;
}

// ============================================
// GET ALL ATTEMPTS BY USER
// ============================================
export async function getQuizAttemptsByUser(userId: string): Promise<QuizAttempt[]> {
    const db = await getDatabase();
    const collection = db.collection<QuizAttempt>(COLLECTION_NAME);

    return collection
        .find({ userId: new ObjectId(userId) })
        .sort({ completedAt: -1 })
        .toArray();
}


// ============================================
// CHECK IF USER PASSED ALL COURSE QUIZZES
// ============================================
export async function hasUserPassedAllCourseQuizzes(userId: string, courseId: string): Promise<{ allPassed: boolean; totalQuizzes: number; passedQuizzes: number }> {
    const db = await getDatabase();

    // Get all quizzes for this course
    const quizzesCollection = db.collection('quizzes');
    const quizzes = await quizzesCollection
        .find({
            courseId: new ObjectId(courseId),
            published: true
        })
        .toArray();

    const totalQuizzes = quizzes.length;

    // If no quizzes exist, consider it as passed (backward compatibility)
    if (totalQuizzes === 0) {
        return { allPassed: true, totalQuizzes: 0, passedQuizzes: 0 };
    }

    // Check if user has passed each quiz
    let passedQuizzes = 0;
    for (const quiz of quizzes) {
        const hasPassed = await hasUserPassedQuiz(userId, quiz._id!.toString());
        if (hasPassed) {
            passedQuizzes++;
        }
    }

    return {
        allPassed: passedQuizzes === totalQuizzes,
        totalQuizzes,
        passedQuizzes
    };
}

// ============================================
// GET QUIZ STATISTICS
// ============================================
export async function getQuizStatistics(quizId: string) {
    const db = await getDatabase();
    const collection = db.collection<QuizAttempt>(COLLECTION_NAME);

    const attempts = await collection
        .find({ quizId: new ObjectId(quizId) })
        .toArray();

    if (attempts.length === 0) {
        return {
            totalAttempts: 0,
            uniqueUsers: 0,
            averageScore: 0,
            passRate: 0,
            averageTimeSpent: 0
        };
    }

    const uniqueUsers = new Set(attempts.map(a => a.userId.toString())).size;
    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
    const passedAttempts = attempts.filter(a => a.passed).length;
    const totalTime = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);

    return {
        totalAttempts: attempts.length,
        uniqueUsers,
        averageScore: Math.round(totalScore / attempts.length),
        passRate: Math.round((passedAttempts / attempts.length) * 100),
        averageTimeSpent: Math.round(totalTime / attempts.length)
    };
}

// ============================================
// GET ATTEMPT BY ID
// ============================================
export async function findAttemptById(id: string): Promise<QuizAttempt | null> {
    const db = await getDatabase();
    const collection = db.collection<QuizAttempt>(COLLECTION_NAME);
    return collection.findOne({ _id: new ObjectId(id) });
}

// ============================================
// DELETE ATTEMPTS BY QUIZ
// ============================================
export async function deleteAttemptsByQuiz(quizId: string): Promise<number> {
    const db = await getDatabase();
    const collection = db.collection<QuizAttempt>(COLLECTION_NAME);

    const result = await collection.deleteMany({ quizId: new ObjectId(quizId) });
    return result.deletedCount;
}

// ============================================
// CREATE INDEXES
// ============================================
export async function createIndexes() {
    const db = await getDatabase();
    const collection = db.collection<QuizAttempt>(COLLECTION_NAME);

    await collection.createIndex({ userId: 1, quizId: 1 });
    await collection.createIndex({ quizId: 1 });
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ score: -1 });
    await collection.createIndex({ completedAt: -1 });
    await collection.createIndex({ passed: 1 });
}
