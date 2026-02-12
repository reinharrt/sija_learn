// src/models/Tag.ts

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';

export interface Tag {
  _id?: ObjectId;
  name: string;              // lowercase, normalized name
  slug: string;              // URL-friendly version
  description?: string;      // Optional description
  category?: 'general' | 'technology' | 'course' | 'subject';
  usageCount: number;        // Total times used
  createdBy: ObjectId;       // User who created this tag
  createdAt: Date;
  updatedAt: Date;
}

export interface TagUsage {
  _id?: ObjectId;
  tagId: ObjectId;
  entityType: 'article' | 'course';
  entityId: ObjectId;
  createdAt: Date;
}

const TAGS_COLLECTION = 'tags';
const TAG_USAGE_COLLECTION = 'tag_usage';

// ============================================
// TAG CRUD OPERATIONS
// ============================================

/**
 * Create a new tag (or return existing if already exists)
 */
export async function createTag(
  name: string,
  createdBy: string,
  options?: { description?: string; category?: string }
): Promise<ObjectId> {
  const db = await getDatabase();
  const collection = db.collection<Tag>(TAGS_COLLECTION);

  // Normalize tag name
  const normalizedName = name.toLowerCase().trim();
  const slug = normalizedName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Check if tag already exists
  const existingTag = await collection.findOne({ name: normalizedName });
  if (existingTag) {
    return existingTag._id!;
  }

  // Create new tag
  const tag: Tag = {
    name: normalizedName,
    slug,
    description: options?.description,
    category: (options?.category as any) || 'general',
    usageCount: 0,
    createdBy: new ObjectId(createdBy),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(tag);
  return result.insertedId;
}

/**
 * Find tag by name (case-insensitive)
 */
export async function findTagByName(name: string): Promise<Tag | null> {
  const db = await getDatabase();
  const collection = db.collection<Tag>(TAGS_COLLECTION);

  const normalizedName = name.toLowerCase().trim();
  return collection.findOne({ name: normalizedName });
}

/**
 * Find tag by ID
 */
export async function findTagById(id: string): Promise<Tag | null> {
  const db = await getDatabase();
  const collection = db.collection<Tag>(TAGS_COLLECTION);
  return collection.findOne({ _id: new ObjectId(id) });
}

/**
 * Find tag by slug
 */
export async function findTagBySlug(slug: string): Promise<Tag | null> {
  const db = await getDatabase();
  const collection = db.collection<Tag>(TAGS_COLLECTION);
  return collection.findOne({ slug: slug.toLowerCase() });
}

/**
 * Get all tags with pagination and filters
 */
export async function getTags(
  filters: {
    search?: string;
    category?: string;
    minUsage?: number;
  } = {},
  skip: number = 0,
  limit: number = 100
) {
  const db = await getDatabase();
  const collection = db.collection<Tag>(TAGS_COLLECTION);

  const query: any = {};

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.minUsage) {
    query.usageCount = { $gte: filters.minUsage };
  }

  const tags = await collection
    .find(query)
    .skip(skip)
    .limit(limit)
    .sort({ usageCount: -1, name: 1 }) // Sort by popularity, then alphabetically
    .toArray();

  const total = await collection.countDocuments(query);

  return { tags, total };
}

/**
 * Get popular tags
 */
export async function getPopularTags(limit: number = 20): Promise<Tag[]> {
  const db = await getDatabase();
  const collection = db.collection<Tag>(TAGS_COLLECTION);

  return collection
    .find({ usageCount: { $gt: 0 } })
    .sort({ usageCount: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Search tags by name (for autocomplete)
 */
export async function searchTags(query: string, limit: number = 10): Promise<Tag[]> {
  const db = await getDatabase();
  const collection = db.collection<Tag>(TAGS_COLLECTION);

  return collection
    .find({
      name: { $regex: query, $options: 'i' }
    })
    .sort({ usageCount: -1, name: 1 })
    .limit(limit)
    .toArray();
}

/**
 * Update tag
 */
export async function updateTag(
  id: string,
  updates: Partial<Pick<Tag, 'description' | 'category'>>
): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Tag>(TAGS_COLLECTION);

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

/**
 * Delete tag (only if not used)
 */
export async function deleteTag(id: string): Promise<boolean> {
  const db = await getDatabase();
  const tagsCollection = db.collection<Tag>(TAGS_COLLECTION);
  const usageCollection = db.collection<TagUsage>(TAG_USAGE_COLLECTION);

  // Check if tag is being used
  const usage = await usageCollection.findOne({ tagId: new ObjectId(id) });
  if (usage) {
    throw new Error('Cannot delete tag that is being used');
  }

  const result = await tagsCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// ============================================
// TAG USAGE TRACKING
// ============================================

/**
 * Add tag to entity (article or course)
 */
export async function addTagToEntity(
  tagName: string,
  entityType: 'article' | 'course',
  entityId: string,
  createdBy: string
): Promise<void> {
  const db = await getDatabase();
  const tagsCollection = db.collection<Tag>(TAGS_COLLECTION);
  const usageCollection = db.collection<TagUsage>(TAG_USAGE_COLLECTION);

  // Create or get tag
  const tagId = await createTag(tagName, createdBy);

  // Check if already exists
  const existingUsage = await usageCollection.findOne({
    tagId,
    entityType,
    entityId: new ObjectId(entityId)
  });

  if (existingUsage) {
    return; // Already tagged
  }

  // Add usage record
  const usage: TagUsage = {
    tagId,
    entityType,
    entityId: new ObjectId(entityId),
    createdAt: new Date()
  };

  await usageCollection.insertOne(usage);

  // Increment usage count
  await tagsCollection.updateOne(
    { _id: tagId },
    {
      $inc: { usageCount: 1 },
      $set: { updatedAt: new Date() }
    }
  );
}

/**
 * Remove tag from entity
 */
export async function removeTagFromEntity(
  tagName: string,
  entityType: 'article' | 'course',
  entityId: string
): Promise<void> {
  const db = await getDatabase();
  const tagsCollection = db.collection<Tag>(TAGS_COLLECTION);
  const usageCollection = db.collection<TagUsage>(TAG_USAGE_COLLECTION);

  // Find tag
  const tag = await findTagByName(tagName);
  if (!tag) return;

  // Remove usage record
  const result = await usageCollection.deleteOne({
    tagId: tag._id,
    entityType,
    entityId: new ObjectId(entityId)
  });

  if (result.deletedCount > 0) {
    // Decrement usage count
    await tagsCollection.updateOne(
      { _id: tag._id },
      {
        $inc: { usageCount: -1 },
        $set: { updatedAt: new Date() }
      }
    );
  }
}

/**
 * Remove all tags from entity (used when deleting entity)
 */
export async function removeAllTagsFromEntity(
  entityType: 'article' | 'course',
  entityId: string
): Promise<void> {
  const db = await getDatabase();
  const tagsCollection = db.collection<Tag>(TAGS_COLLECTION);
  const usageCollection = db.collection<TagUsage>(TAG_USAGE_COLLECTION);

  // Get all tag usages for this entity
  const usages = await usageCollection
    .find({
      entityType,
      entityId: new ObjectId(entityId)
    })
    .toArray();

  if (usages.length === 0) return;

  // Delete all usage records
  await usageCollection.deleteMany({
    entityType,
    entityId: new ObjectId(entityId)
  });

  // Decrement usage count for each tag
  const tagIds = usages.map(u => u.tagId);
  await tagsCollection.updateMany(
    { _id: { $in: tagIds } },
    {
      $inc: { usageCount: -1 },
      $set: { updatedAt: new Date() }
    }
  );
}


/**
 * Get tags for entity
 */
export async function getTagsForEntity(
  entityType: 'article' | 'course',
  entityId: string
): Promise<Tag[]> {
  const db = await getDatabase();
  const tagsCollection = db.collection<Tag>(TAGS_COLLECTION);
  const usageCollection = db.collection<TagUsage>(TAG_USAGE_COLLECTION);

  const usages = await usageCollection
    .find({
      entityType,
      entityId: new ObjectId(entityId)
    })
    .toArray();

  if (usages.length === 0) return [];

  const tagIds = usages.map(u => u.tagId);
  return tagsCollection
    .find({ _id: { $in: tagIds } })
    .sort({ name: 1 })
    .toArray();
}

/**
 * Update entity tags (bulk operation)
 * Removes old tags and adds new ones
 */
export async function updateEntityTags(
  entityType: 'article' | 'course',
  entityId: string,
  tagNames: string[],
  createdBy: string
): Promise<void> {
  const db = await getDatabase();
  const usageCollection = db.collection<TagUsage>(TAG_USAGE_COLLECTION);

  // Get current tags
  const currentTags = await getTagsForEntity(entityType, entityId);
  const currentTagNames = currentTags.map(t => t.name);

  // Determine which tags to add and remove
  const tagsToAdd = tagNames.filter(name =>
    !currentTagNames.includes(name.toLowerCase().trim())
  );
  const tagsToRemove = currentTagNames.filter(name =>
    !tagNames.map(n => n.toLowerCase().trim()).includes(name)
  );

  // Remove old tags
  for (const tagName of tagsToRemove) {
    await removeTagFromEntity(tagName, entityType, entityId);
  }

  // Add new tags
  for (const tagName of tagsToAdd) {
    await addTagToEntity(tagName, entityType, entityId, createdBy);
  }
}

/**
 * Get entities by tag
 */
export async function getEntitiesByTag(
  tagName: string,
  entityType?: 'article' | 'course'
): Promise<{ articles: ObjectId[], courses: ObjectId[] }> {
  const db = await getDatabase();
  const usageCollection = db.collection<TagUsage>(TAG_USAGE_COLLECTION);

  const tag = await findTagByName(tagName);
  if (!tag) return { articles: [], courses: [] };

  const query: any = { tagId: tag._id };
  if (entityType) {
    query.entityType = entityType;
  }

  const usages = await usageCollection.find(query).toArray();

  const articles = usages
    .filter(u => u.entityType === 'article')
    .map(u => u.entityId);

  const courses = usages
    .filter(u => u.entityType === 'course')
    .map(u => u.entityId);

  return { articles, courses };
}

/**
 * Get tag statistics
 */
export async function getTagStats(tagId: string): Promise<{
  totalUsage: number;
  articleCount: number;
  courseCount: number;
}> {
  const db = await getDatabase();
  const usageCollection = db.collection<TagUsage>(TAG_USAGE_COLLECTION);

  const [totalUsage, articleCount, courseCount] = await Promise.all([
    usageCollection.countDocuments({ tagId: new ObjectId(tagId) }),
    usageCollection.countDocuments({ tagId: new ObjectId(tagId), entityType: 'article' }),
    usageCollection.countDocuments({ tagId: new ObjectId(tagId), entityType: 'course' })
  ]);

  return { totalUsage, articleCount, courseCount };
}

// ============================================
// MAINTENANCE
// ============================================

/**
 * Recalculate usage counts for all tags
 */
export async function recalculateUsageCounts(): Promise<void> {
  const db = await getDatabase();
  const tagsCollection = db.collection<Tag>(TAGS_COLLECTION);
  const usageCollection = db.collection<TagUsage>(TAG_USAGE_COLLECTION);

  const tags = await tagsCollection.find({}).toArray();

  for (const tag of tags) {
    const count = await usageCollection.countDocuments({ tagId: tag._id });
    await tagsCollection.updateOne(
      { _id: tag._id },
      { $set: { usageCount: count, updatedAt: new Date() } }
    );
  }
}

/**
 * Clean up unused tags (usage count = 0)
 */
export async function cleanupUnusedTags(): Promise<number> {
  const db = await getDatabase();
  const collection = db.collection<Tag>(TAGS_COLLECTION);

  const result = await collection.deleteMany({ usageCount: 0 });
  return result.deletedCount;
}

// ============================================
// INDEXES
// ============================================

export async function createIndexes() {
  const db = await getDatabase();
  const tagsCollection = db.collection<Tag>(TAGS_COLLECTION);
  const usageCollection = db.collection<TagUsage>(TAG_USAGE_COLLECTION);

  // Tags collection indexes
  await tagsCollection.createIndex({ name: 1 }, { unique: true });
  await tagsCollection.createIndex({ slug: 1 }, { unique: true });
  await tagsCollection.createIndex({ category: 1 });
  await tagsCollection.createIndex({ usageCount: -1 });
  await tagsCollection.createIndex({ createdAt: -1 });

  // Tag usage collection indexes
  await usageCollection.createIndex(
    { tagId: 1, entityType: 1, entityId: 1 },
    { unique: true }
  );
  await usageCollection.createIndex({ tagId: 1 });
  await usageCollection.createIndex({ entityType: 1, entityId: 1 });
  await usageCollection.createIndex({ createdAt: -1 });
}