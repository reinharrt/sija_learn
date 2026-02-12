// src/models/Enrollment.ts

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';

// ... (previous code)

export interface Enrollment {
  _id?: ObjectId;
  userId: ObjectId;
  courseId: ObjectId;
  enrolledAt: Date;
  completedAt?: Date; // [NEW] Track completion time
  progress: {
    completedArticles: ObjectId[];
    lastAccessedAt: Date;
  };
}

const COLLECTION_NAME = 'enrollments';

export async function createEnrollment(userId: string, courseId: string): Promise<ObjectId> {
  const db = await getDatabase();
  const collection = db.collection<Enrollment>(COLLECTION_NAME);

  // Check if already enrolled
  const existing = await collection.findOne({
    userId: new ObjectId(userId),
    courseId: new ObjectId(courseId)
  });

  if (existing) {
    throw new Error('Anda sudah terdaftar di course ini');
  }

  const enrollment: Enrollment = {
    userId: new ObjectId(userId),
    courseId: new ObjectId(courseId),
    enrolledAt: new Date(),
    // completedAt is undefined by default
    progress: {
      completedArticles: [],
      lastAccessedAt: new Date()
    }
  };

  const result = await collection.insertOne(enrollment);
  return result.insertedId;
}

// ... (existing helper functions)

export async function markCourseCompleted(userId: string, courseId: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Enrollment>(COLLECTION_NAME);

  const result = await collection.updateOne(
    {
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId)
    },
    {
      $set: {
        completedAt: new Date(),
        'progress.lastAccessedAt': new Date()
      }
    }
  );

  return result.modifiedCount > 0;
}

export async function isCourseCompleted(userId: string, courseId: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Enrollment>(COLLECTION_NAME);

  const enrollment = await collection.findOne({
    userId: new ObjectId(userId),
    courseId: new ObjectId(courseId)
  });

  return !!enrollment?.completedAt;
}

// ... (rest of the file)


export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Enrollment>(COLLECTION_NAME);

  const enrollment = await collection.findOne({
    userId: new ObjectId(userId),
    courseId: new ObjectId(courseId)
  });

  return enrollment !== null;
}

export async function getUserEnrollments(userId: string) {
  const db = await getDatabase();
  const collection = db.collection<Enrollment>(COLLECTION_NAME);

  return collection
    .find({ userId: new ObjectId(userId) })
    .sort({ enrolledAt: -1 })
    .toArray();
}

export async function getCourseEnrollments(courseId: string) {
  const db = await getDatabase();
  const collection = db.collection<Enrollment>(COLLECTION_NAME);

  const enrollments = await collection
    .find({ courseId: new ObjectId(courseId) })
    .toArray();

  return enrollments;
}

export async function getEnrollmentCount(courseId: string): Promise<number> {
  const db = await getDatabase();
  const collection = db.collection<Enrollment>(COLLECTION_NAME);

  return collection.countDocuments({ courseId: new ObjectId(courseId) });
}

export async function unenrollUser(userId: string, courseId: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Enrollment>(COLLECTION_NAME);

  const result = await collection.deleteOne({
    userId: new ObjectId(userId),
    courseId: new ObjectId(courseId)
  });

  return result.deletedCount > 0;
}

export async function markArticleCompleted(userId: string, courseId: string, articleId: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Enrollment>(COLLECTION_NAME);

  const result = await collection.updateOne(
    {
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId)
    },
    {
      $addToSet: { 'progress.completedArticles': new ObjectId(articleId) },
      $set: { 'progress.lastAccessedAt': new Date() }
    }
  );

  return result.modifiedCount > 0;
}

export async function getEnrollmentProgress(userId: string, courseId: string) {
  const db = await getDatabase();
  const collection = db.collection<Enrollment>(COLLECTION_NAME);

  const enrollment = await collection.findOne({
    userId: new ObjectId(userId),
    courseId: new ObjectId(courseId)
  });

  return enrollment?.progress || null;
}

export async function deleteEnrollmentsByCourse(courseId: string): Promise<number> {
  const db = await getDatabase();
  const collection = db.collection<Enrollment>(COLLECTION_NAME);

  const result = await collection.deleteMany({ courseId: new ObjectId(courseId) });
  return result.deletedCount;
}

export async function createIndexes() {
  const db = await getDatabase();
  const collection = db.collection<Enrollment>(COLLECTION_NAME);

  await collection.createIndex({ userId: 1, courseId: 1 }, { unique: true });
  await collection.createIndex({ userId: 1 });
  await collection.createIndex({ courseId: 1 });
  await collection.createIndex({ enrolledAt: -1 });
}