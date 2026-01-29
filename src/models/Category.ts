// ============================================
// src/models/Category.ts
// Category Model - Dynamic category management
// ============================================

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';

export interface Category {
  _id?: ObjectId;
  name: string;                    // Category name (e.g., "Pelajaran", "Tech")
  slug: string;                    // URL-friendly version
  description?: string;            // Optional description
  icon?: string;                   // Optional emoji/icon
  color?: string;                  // Optional color for UI
  usageCount: number;              // How many articles use this
  createdBy: ObjectId;             // User who created it
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'categories';

// Create new category
export async function createCategory(
  name: string,
  createdBy: string,
  options: {
    description?: string;
    icon?: string;
    color?: string;
  } = {}
): Promise<ObjectId> {
  const db = await getDatabase();
  const collection = db.collection<Category>(COLLECTION_NAME);
  
  const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
  
  // Check if category already exists
  const existing = await collection.findOne({ slug });
  if (existing) {
    throw new Error('Category sudah ada');
  }
  
  const category: Category = {
    name: name.trim(),
    slug,
    description: options.description,
    icon: options.icon,
    color: options.color || '#3B82F6', // default blue
    usageCount: 0,
    createdBy: new ObjectId(createdBy),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await collection.insertOne(category);
  return result.insertedId;
}

// Get all categories with filters
export async function getCategories(
  filters: {
    search?: string;
    minUsage?: number;
  } = {},
  skip: number = 0,
  limit: number = 50
) {
  const db = await getDatabase();
  const collection = db.collection<Category>(COLLECTION_NAME);
  
  const query: any = {};
  
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { slug: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }
  
  if (filters.minUsage !== undefined) {
    query.usageCount = { $gte: filters.minUsage };
  }
  
  const categories = await collection
    .find(query)
    .sort({ usageCount: -1, name: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  
  const total = await collection.countDocuments(query);
  
  return { categories, total };
}

// Get popular categories
export async function getPopularCategories(limit: number = 10) {
  const db = await getDatabase();
  const collection = db.collection<Category>(COLLECTION_NAME);
  
  return collection
    .find({ usageCount: { $gt: 0 } })
    .sort({ usageCount: -1 })
    .limit(limit)
    .toArray();
}

// Search categories (for autocomplete)
export async function searchCategories(query: string, limit: number = 10) {
  const db = await getDatabase();
  const collection = db.collection<Category>(COLLECTION_NAME);
  
  return collection
    .find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { slug: { $regex: query, $options: 'i' } },
      ],
    })
    .sort({ usageCount: -1, name: 1 })
    .limit(limit)
    .toArray();
}

// Get category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const db = await getDatabase();
  const collection = db.collection<Category>(COLLECTION_NAME);
  return collection.findOne({ slug });
}

// Update category
export async function updateCategory(
  id: string,
  updates: Partial<Omit<Category, '_id' | 'createdBy' | 'createdAt'>>
): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Category>(COLLECTION_NAME);
  
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    }
  );
  
  return result.modifiedCount > 0;
}

// Delete category
export async function deleteCategory(id: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Category>(COLLECTION_NAME);
  
  // Check if category is in use
  const category = await collection.findOne({ _id: new ObjectId(id) });
  if (category && category.usageCount > 0) {
    throw new Error('Tidak bisa menghapus category yang sedang digunakan');
  }
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// Increment usage count
export async function incrementCategoryUsage(slug: string): Promise<void> {
  const db = await getDatabase();
  const collection = db.collection<Category>(COLLECTION_NAME);
  
  await collection.updateOne(
    { slug },
    { $inc: { usageCount: 1 } }
  );
}

// Decrement usage count
export async function decrementCategoryUsage(slug: string): Promise<void> {
  const db = await getDatabase();
  const collection = db.collection<Category>(COLLECTION_NAME);
  
  await collection.updateOne(
    { slug },
    { $inc: { usageCount: -1 } }
  );
}

// Create indexes
export async function createCategoryIndexes() {
  const db = await getDatabase();
  const collection = db.collection<Category>(COLLECTION_NAME);
  
  await collection.createIndex({ slug: 1 }, { unique: true });
  await collection.createIndex({ name: 1 });
  await collection.createIndex({ usageCount: -1 });
  await collection.createIndex({ createdBy: 1 });
  await collection.createIndex({ createdAt: -1 });
}