//  ============================================
// src/lib/mongodb.ts
// MongoDB Connection - Database connection utility
// ============================================

import { MongoClient, Db } from 'mongodb';

// Skip validation during build time (Next.js pre-rendering)
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

if (!process.env.MONGODB_URI && !isBuildTime) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/sija-learn';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Skip connection during build time
if (isBuildTime) {
  // Dummy promise for build time
  clientPromise = Promise.resolve({
    db: () => ({} as Db)
  } as MongoClient);
} else if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDatabase(): Promise<Db> {
  if (isBuildTime) {
    // Return dummy during build
    return {} as Db;
  }
  const client = await clientPromise;
  return client.db('sija-learn');
}

export default clientPromise;