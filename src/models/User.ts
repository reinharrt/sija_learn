// ============================================
// src/models/User.ts
// User Model - User database schema
// ============================================

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { User, UserRole } from '@/types';

const COLLECTION_NAME = 'users';

export async function createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<ObjectId> {
  const db = await getDatabase();
  const collection = db.collection<User>(COLLECTION_NAME);
  
  const user: User = {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(user);
  return result.insertedId;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDatabase();
  const collection = db.collection<User>(COLLECTION_NAME);
  return collection.findOne({ email });
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await getDatabase();
  const collection = db.collection<User>(COLLECTION_NAME);
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function updateUser(id: string, updates: Partial<User>): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<User>(COLLECTION_NAME);
  
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

export async function deleteUser(id: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<User>(COLLECTION_NAME);
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function getAllUsers(skip: number = 0, limit: number = 20) {
  const db = await getDatabase();
  const collection = db.collection<User>(COLLECTION_NAME);
  
  const users = await collection
    .find({})
    .project({ password: 0 })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .toArray();

  const total = await collection.countDocuments();

  return { users, total };
}

export async function createIndexes() {
  const db = await getDatabase();
  const collection = db.collection<User>(COLLECTION_NAME);
  
  await collection.createIndex({ email: 1 }, { unique: true });
  await collection.createIndex({ role: 1 });
  await collection.createIndex({ createdAt: -1 });
}
