// ============================================
// src/models/Course.ts
// Course Model - Course database schema
// ============================================

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { Course } from '@/types';

const COLLECTION_NAME = 'courses';

export async function createCourse(courseData: Omit<Course, '_id' | 'createdAt' | 'updatedAt' | 'enrolledCount'>): Promise<ObjectId> {
  const db = await getDatabase();
  const collection = db.collection<Course>(COLLECTION_NAME);

  const course: Course = {
    ...courseData,
    enrolledCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(course);
  return result.insertedId;
}

export async function findCourseById(id: string): Promise<Course | null> {
  const db = await getDatabase();
  const collection = db.collection<Course>(COLLECTION_NAME);
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function findCourseBySlug(slug: string): Promise<Course | null> {
  const db = await getDatabase();
  const collection = db.collection<Course>(COLLECTION_NAME);
  return collection.findOne({ slug });
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Course>(COLLECTION_NAME);

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

export async function deleteCourse(id: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Course>(COLLECTION_NAME);

  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function addArticleToCourse(courseId: string, articleId: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Course>(COLLECTION_NAME);

  const result = await collection.updateOne(
    { _id: new ObjectId(courseId) },
    {
      $addToSet: { articles: new ObjectId(articleId) },
      $set: { updatedAt: new Date() }
    }
  );

  return result.modifiedCount > 0;
}

export async function removeArticleFromCourse(courseId: string, articleId: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Course>(COLLECTION_NAME);

  const result = await collection.updateOne(
    { _id: new ObjectId(courseId) },
    {
      $pull: { articles: new ObjectId(articleId) },
      $set: { updatedAt: new Date() }
    }
  );

  return result.modifiedCount > 0;
}

export async function incrementEnrolled(id: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Course>(COLLECTION_NAME);

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $inc: { enrolledCount: 1 } }
  );

  return result.modifiedCount > 0;
}

export async function getCourses(
  filters: {
    creator?: string;
    published?: boolean;
    search?: string;
  } = {},
  skip: number = 0,
  limit: number = 20
) {
  const db = await getDatabase();
  const collection = db.collection<Course>(COLLECTION_NAME);

  const query: any = {};

  if (filters.creator) {
    query.creator = new ObjectId(filters.creator);
  }

  if (filters.published !== undefined) {
    query.published = filters.published;
  }

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }

  const courses = await collection
    .find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .toArray();

  const total = await collection.countDocuments(query);

  return { courses, total };
}

export async function getPopularCourses(limit: number = 10) {
  const db = await getDatabase();
  const collection = db.collection<Course>(COLLECTION_NAME);

  return collection
    .find({ published: true })
    .sort({ enrolledCount: -1 })
    .limit(limit)
    .toArray();
}

export async function createIndexes() {
  const db = await getDatabase();
  const collection = db.collection<Course>(COLLECTION_NAME);

  await collection.createIndex({ slug: 1 }, { unique: true });
  await collection.createIndex({ creator: 1 });
  await collection.createIndex({ published: 1 });
  await collection.createIndex({ createdAt: -1 });
  await collection.createIndex({ enrolledCount: -1 });
  await collection.createIndex({ title: 'text', description: 'text' });
}

// ============================================
// QUIZ HELPER FUNCTIONS
// ============================================
export async function setFinalQuiz(courseId: string, quizId: string | null): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Course>(COLLECTION_NAME);

  const updateData: any = { updatedAt: new Date() };
  let updateOp: any = {};

  if (quizId) {
    updateOp = {
      $set: {
        ...updateData,
        finalQuizId: new ObjectId(quizId)
      }
    };
  } else {
    updateOp = {
      $set: updateData,
      $unset: { finalQuizId: "" }
    };
  }

  const result = await collection.updateOne(
    { _id: new ObjectId(courseId) },
    updateOp
  );

  return result.modifiedCount > 0;
}

export async function getFinalQuiz(courseId: string): Promise<ObjectId | undefined> {
  const course = await findCourseById(courseId);
  return course?.finalQuizId;
}

