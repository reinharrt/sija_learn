// src/models/TempUser.ts

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { TempUser } from '@/types';

const COLLECTION_NAME = 'temp_users';

export async function createTempUser(tempUserData: Omit<TempUser, '_id' | 'createdAt'>): Promise<ObjectId> {
  const db = await getDatabase();
  const collection = db.collection<TempUser>(COLLECTION_NAME);

  const tempUser: TempUser = {
    ...tempUserData,
    createdAt: new Date(),
  };

  const result = await collection.insertOne(tempUser);
  return result.insertedId;
}

export async function findTempUserByEmail(email: string): Promise<TempUser | null> {
  const db = await getDatabase();
  const collection = db.collection<TempUser>(COLLECTION_NAME);
  return collection.findOne({ email });
}

export async function findTempUserByToken(token: string): Promise<TempUser | null> {
  const db = await getDatabase();
  const collection = db.collection<TempUser>(COLLECTION_NAME);
  return collection.findOne({
    verificationToken: token,
    expiresAt: { $gt: new Date() }
  });
}

export async function deleteTempUser(email: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<TempUser>(COLLECTION_NAME);

  const result = await collection.deleteOne({ email });
  return result.deletedCount > 0;
}

export async function deleteExpiredTempUsers(): Promise<number> {
  const db = await getDatabase();
  const collection = db.collection<TempUser>(COLLECTION_NAME);

  const result = await collection.deleteMany({
    expiresAt: { $lt: new Date() }
  });

  return result.deletedCount;
}

export async function createIndexes() {
  const db = await getDatabase();
  const collection = db.collection<TempUser>(COLLECTION_NAME);

  await collection.createIndex({ email: 1 }, { unique: true });
  await collection.createIndex({ verificationToken: 1 });
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}
