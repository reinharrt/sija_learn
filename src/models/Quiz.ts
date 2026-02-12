// src/models/Quiz.ts

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { Quiz, QuizType, QuizQuestion } from '@/types';

const COLLECTION_NAME = 'quizzes';

// ============================================
// CREATE QUIZ
// ============================================
export async function createQuiz(quizData: Omit<Quiz, '_id' | 'createdAt' | 'updatedAt'>): Promise<ObjectId> {
    const db = await getDatabase();
    const collection = db.collection<Quiz>(COLLECTION_NAME);

    const quiz: Quiz = {
        ...quizData,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const result = await collection.insertOne(quiz);
    return result.insertedId;
}

// ============================================
// FIND QUIZ BY ID
// ============================================
export async function findQuizById(id: string): Promise<Quiz | null> {
    const db = await getDatabase();
    const collection = db.collection<Quiz>(COLLECTION_NAME);
    return collection.findOne({ _id: new ObjectId(id) });
}

// ============================================
// FIND QUIZZES BY COURSE
// ============================================
export async function findQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    const db = await getDatabase();
    const collection = db.collection<Quiz>(COLLECTION_NAME);
    return collection.find({ courseId: new ObjectId(courseId) }).sort({ createdAt: -1 }).toArray();
}

// ============================================
// FIND QUIZ BY ARTICLE
// ============================================
export async function findQuizByArticle(articleId: string): Promise<Quiz | null> {
    const db = await getDatabase();
    const collection = db.collection<Quiz>(COLLECTION_NAME);
    return collection.findOne({
        articleId: new ObjectId(articleId),
        type: QuizType.ARTICLE_QUIZ
    });
}

// ============================================
// FIND FINAL QUIZ BY COURSE
// ============================================
export async function findFinalQuizByCourse(courseId: string): Promise<Quiz | null> {
    const db = await getDatabase();
    const collection = db.collection<Quiz>(COLLECTION_NAME);
    return collection.findOne({
        courseId: new ObjectId(courseId),
        type: QuizType.FINAL_QUIZ
    });
}

// ============================================
// UPDATE QUIZ
// ============================================
export async function updateQuiz(id: string, updates: Partial<Quiz>): Promise<boolean> {
    const db = await getDatabase();
    const collection = db.collection<Quiz>(COLLECTION_NAME);

    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                ...updates,
                updatedAt: new Date()
            }
        }
    );

    return result.modifiedCount > 0;
}

// ============================================
// DELETE QUIZ
// ============================================
export async function deleteQuiz(id: string): Promise<boolean> {
    const db = await getDatabase();
    const collection = db.collection<Quiz>(COLLECTION_NAME);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
}

// ============================================
// GET QUIZ FOR STUDENT (WITHOUT ANSWERS)
// ============================================
export async function getQuizForStudent(id: string): Promise<Omit<Quiz, 'questions'> & { questions: Omit<QuizQuestion, 'options'>[] & { options: Omit<QuizQuestion['options'][0], 'isCorrect'>[] }[] } | null> {
    const db = await getDatabase();
    const collection = db.collection<Quiz>(COLLECTION_NAME);

    const quiz = await collection.findOne({ _id: new ObjectId(id) });
    if (!quiz) return null;

    // Remove correct answers from questions
    const sanitizedQuestions = quiz.questions.map(q => ({
        ...q,
        options: q.options.map(opt => ({
            id: opt.id,
            text: opt.text
            // isCorrect is removed
        }))
    }));

    return {
        ...quiz,
        questions: sanitizedQuestions as any
    };
}

// ============================================
// PUBLISH/UNPUBLISH QUIZ
// ============================================
export async function publishQuiz(id: string, published: boolean): Promise<boolean> {
    return updateQuiz(id, { published });
}

// ============================================
// CREATE INDEXES
// ============================================
export async function createIndexes() {
    const db = await getDatabase();
    const collection = db.collection<Quiz>(COLLECTION_NAME);

    await collection.createIndex({ courseId: 1 });
    await collection.createIndex({ articleId: 1 });
    await collection.createIndex({ type: 1 });
    await collection.createIndex({ createdBy: 1 });
    await collection.createIndex({ published: 1 });
    await collection.createIndex({ createdAt: -1 });
}
