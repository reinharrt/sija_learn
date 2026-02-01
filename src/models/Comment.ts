// ============================================
// src/models/Comment.ts
// Comment Model - Comment database schema
// ============================================

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { Comment } from '@/types';

const COLLECTION_NAME = 'comments';

export async function createComment(commentData: Omit<Comment, '_id' | 'createdAt' | 'updatedAt'>): Promise<ObjectId> {
  const db = await getDatabase();
  const collection = db.collection<Comment>(COLLECTION_NAME);

  const comment: Comment = {
    ...commentData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(comment);
  return result.insertedId;
}

export async function findCommentById(id: string): Promise<Comment | null> {
  const db = await getDatabase();
  const collection = db.collection<Comment>(COLLECTION_NAME);
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function updateComment(id: string, content: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Comment>(COLLECTION_NAME);

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        content,
        updatedAt: new Date()
      }
    }
  );

  return result.modifiedCount > 0;
}

export async function deleteComment(id: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Comment>(COLLECTION_NAME);

  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function getCommentsByArticle(articleId: string, skip: number = 0, limit: number = 50) {
  const db = await getDatabase();
  const collection = db.collection<Comment>(COLLECTION_NAME);

  const pipeline = [
    { $match: { articleId: new ObjectId(articleId) } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'authorDetails'
      }
    },
    {
      $unwind: {
        path: '$authorDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        articleId: 1,
        userId: 1,
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        author: {
          $ifNull: [
            {
              _id: '$authorDetails._id',
              name: '$authorDetails.name',
              email: '$authorDetails.email'
            },
            null
          ]
        }
      }
    }
  ];

  const comments = (await collection.aggregate(pipeline).toArray()) as Comment[];
  const total = await collection.countDocuments({ articleId: new ObjectId(articleId) });

  return { comments, total };
}

export async function getCommentsByUser(userId: string, skip: number = 0, limit: number = 20) {
  const db = await getDatabase();
  const collection = db.collection<Comment>(COLLECTION_NAME);

  const comments = await collection
    .find({ userId: new ObjectId(userId) })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .toArray();

  const total = await collection.countDocuments({ userId: new ObjectId(userId) });

  return { comments, total };
}

export async function deleteCommentsByArticle(articleId: string): Promise<number> {
  const db = await getDatabase();
  const collection = db.collection<Comment>(COLLECTION_NAME);

  const result = await collection.deleteMany({ articleId: new ObjectId(articleId) });
  return result.deletedCount;
}

export async function createIndexes() {
  const db = await getDatabase();
  const collection = db.collection<Comment>(COLLECTION_NAME);

  await collection.createIndex({ articleId: 1 });
  await collection.createIndex({ userId: 1 });
  await collection.createIndex({ createdAt: -1 });
}
