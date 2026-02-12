// src/lib/mongodb.ts

import { MongoClient, Db, MongoClientOptions } from 'mongodb';

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

const CLOUD_URI = process.env.MONGODB_URI;
const LOCAL_URI = process.env.MONGODB_LOCAL_URI || 'mongodb://mongodb:27017/sija-learn';

if (!CLOUD_URI && !isBuildTime) {
  throw new Error('Please add your MongoDB Cloud URI to .env.local');
}

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
};

let cloudClient: MongoClient;
let localClient: MongoClient;
let cloudClientPromise: Promise<MongoClient>;
let localClientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoCloudClientPromise: Promise<MongoClient> | undefined;
  var _mongoLocalClientPromise: Promise<MongoClient> | undefined;
}

if (isBuildTime) {
  cloudClientPromise = Promise.resolve({
    db: () => ({} as Db)
  } as MongoClient);
} else if (process.env.NODE_ENV === 'development') {
  if (!global._mongoCloudClientPromise) {
    cloudClient = new MongoClient(CLOUD_URI!, options);
    global._mongoCloudClientPromise = cloudClient.connect();
  }
  cloudClientPromise = global._mongoCloudClientPromise;

  if (!global._mongoLocalClientPromise) {
    localClient = new MongoClient(LOCAL_URI, options);
    global._mongoLocalClientPromise = localClient.connect().catch((err) => {
      console.warn('Local MongoDB not available:', err.message);
      return null as any;
    });
  }
  localClientPromise = global._mongoLocalClientPromise;
} else {
  cloudClient = new MongoClient(CLOUD_URI!, options);
  cloudClientPromise = cloudClient.connect();

  localClient = new MongoClient(LOCAL_URI, options);
  localClientPromise = localClient.connect().catch((err) => {
    console.warn('Local MongoDB not available:', err.message);
    return null as any;
  });
}

let lastSyncCheck: number = 0;
const SYNC_CHECK_INTERVAL = 5 * 60 * 1000;
let isSyncing = false;
const collectionSyncLocks = new Map<string, boolean>();

async function checkAndSyncInBackground(): Promise<void> {
  if (isBuildTime || isSyncing) return;

  const now = Date.now();
  if (now - lastSyncCheck < SYNC_CHECK_INTERVAL) return;

  lastSyncCheck = now;
  isSyncing = true;

  try {
    if (!localClientPromise) {
      isSyncing = false;
      return;
    }

    const [cloudClient, localClient] = await Promise.all([
      cloudClientPromise,
      localClientPromise
    ]);

    if (!localClient) {
      isSyncing = false;
      return;
    }

    const cloudDb = cloudClient.db('sija-learn');
    const localDb = localClient.db('sija-learn');

    const collections = await cloudDb.listCollections().toArray();

    for (const collInfo of collections) {
      const collName = collInfo.name;

      try {
        const cloudColl = cloudDb.collection(collName);
        const localColl = localDb.collection(collName);

        const [cloudCount, localCount] = await Promise.all([
          cloudColl.countDocuments(),
          localColl.countDocuments()
        ]);

        if (cloudCount !== localCount) {
          console.log(`Syncing ${collName}: cloud(${cloudCount}) to local(${localCount})`);

          const docs = await cloudColl.find().toArray();

          await localColl.deleteMany({});
          if (docs.length > 0) {
            await localColl.insertMany(docs);
          }

          console.log(`Synced ${collName}: ${docs.length} documents`);
        }
      } catch (err) {
        console.error(`Failed to sync ${collName}:`, err);
      }
    }
  } catch (error) {
    console.error('Sync process failed:', error);
  } finally {
    isSyncing = false;
  }
}

class HybridDb {
  private cloudDb: Db;
  private localDb: Db | null;

  constructor(cloudDb: Db, localDb: Db | null) {
    this.cloudDb = cloudDb;
    this.localDb = localDb;
  }

  collection(name: string) {
    const cloudCollection = this.cloudDb.collection(name);
    const localCollection = this.localDb?.collection(name);

    return new Proxy(cloudCollection, {
      get: (target, prop: string) => {
        const originalMethod = (target as any)[prop];

        if (['find', 'findOne', 'countDocuments', 'aggregate'].includes(prop)) {
          return (...args: any[]) => {
            if (localCollection) {
              return (localCollection as any)[prop](...args);
            }
            return originalMethod.apply(target, args);
          };
        }

        if (['insertOne', 'insertMany', 'updateOne', 'updateMany',
          'deleteOne', 'deleteMany', 'replaceOne', 'findOneAndUpdate',
          'findOneAndReplace', 'findOneAndDelete'].includes(prop)) {
          return async (...args: any[]) => {
            const result = await originalMethod.apply(target, args);

            if (localCollection) {
              setImmediate(async () => {
                // Check if a sync is already in progress for this collection
                if (collectionSyncLocks.get(name)) {
                  return;
                }

                collectionSyncLocks.set(name, true);

                try {
                  if (prop === 'insertOne' || prop === 'insertMany') {
                    await (localCollection as any)[prop](...args);
                  } else {
                    const docs = await cloudCollection.find().toArray();
                    await localCollection.deleteMany({});
                    if (docs.length > 0) {
                      await localCollection.insertMany(docs);
                    }
                  }
                } catch (err) {
                  console.error(`Failed to sync ${name} after ${prop}:`, err);
                } finally {
                  collectionSyncLocks.delete(name);
                }
              });
            }

            return result;
          };
        }

        if (typeof originalMethod === 'function') {
          return originalMethod.bind(target);
        }

        return originalMethod;
      }
    });
  }

  listCollections() { return this.cloudDb.listCollections(); }
  admin() { return this.cloudDb.admin(); }
  command(command: any) { return this.cloudDb.command(command); }
}

export async function getDatabase(): Promise<Db> {
  if (isBuildTime) {
    return {} as Db;
  }

  checkAndSyncInBackground().catch(console.error);

  const cloudClient = await cloudClientPromise;
  const cloudDb = cloudClient.db('sija-learn');

  let localDb: Db | null = null;
  if (localClientPromise) {
    try {
      const localClient = await localClientPromise;
      if (localClient) {
        localDb = localClient.db('sija-learn');
      }
    } catch {
      localDb = null;
    }
  }

  return new HybridDb(cloudDb, localDb) as any as Db;
}

export async function forceSync(): Promise<void> {
  lastSyncCheck = 0;
  isSyncing = false;
  await checkAndSyncInBackground();
}

export default cloudClientPromise;