// src/models/Subscriber.ts

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { Subscriber } from '@/types';
import crypto from 'crypto';

const COLLECTION_NAME = 'subscribers';

export async function createSubscriber(email: string): Promise<ObjectId> {
    const db = await getDatabase();
    const collection = db.collection<Subscriber>(COLLECTION_NAME);

    // Generate unique unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    const subscriber: Subscriber = {
        email: email.toLowerCase(),
        subscribedAt: new Date(),
        isActive: true,
        unsubscribeToken,
    };

    const result = await collection.insertOne(subscriber);
    return result.insertedId;
}

export async function findSubscriberByEmail(email: string): Promise<Subscriber | null> {
    const db = await getDatabase();
    const collection = db.collection<Subscriber>(COLLECTION_NAME);
    return collection.findOne({ email: email.toLowerCase() });
}

export async function findSubscriberByToken(token: string): Promise<Subscriber | null> {
    const db = await getDatabase();
    const collection = db.collection<Subscriber>(COLLECTION_NAME);
    return collection.findOne({ unsubscribeToken: token });
}

export async function getAllActiveSubscribers(): Promise<Subscriber[]> {
    const db = await getDatabase();
    const collection = db.collection<Subscriber>(COLLECTION_NAME);
    return collection.find({ isActive: true }).toArray();
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
    const db = await getDatabase();
    const collection = db.collection<Subscriber>(COLLECTION_NAME);

    const result = await collection.updateOne(
        { unsubscribeToken: token },
        { $set: { isActive: false } }
    );

    return result.modifiedCount > 0;
}

export async function reactivateSubscriber(email: string): Promise<boolean> {
    const db = await getDatabase();
    const collection = db.collection<Subscriber>(COLLECTION_NAME);

    const result = await collection.updateOne(
        { email: email.toLowerCase() },
        { $set: { isActive: true, subscribedAt: new Date() } }
    );

    return result.modifiedCount > 0;
}

export async function createIndexes() {
    const db = await getDatabase();
    const collection = db.collection<Subscriber>(COLLECTION_NAME);

    await collection.createIndex({ email: 1 }, { unique: true });
    await collection.createIndex({ unsubscribeToken: 1 }, { unique: true });
    await collection.createIndex({ isActive: 1 });
    await collection.createIndex({ subscribedAt: -1 });
}
