// ============================================
// src/models/Article.ts
// Article Model - Article database schema
// ============================================

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { Article, ArticleCategory, ArticleType } from '@/types';

const COLLECTION_NAME = 'articles';

export async function createArticle(articleData: Omit<Article, '_id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<ObjectId> {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
  const article: Article = {
    ...articleData,
    type: articleData.type || ArticleType.PUBLIC, // Default to PUBLIC
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(article);
  return result.insertedId;
}

export async function findArticleById(id: string): Promise<Article | null> {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function findArticleBySlug(slug: string): Promise<Article | null> {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  return collection.findOne({ slug });
}

export async function updateArticle(id: string, updates: Partial<Article>): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
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

export async function deleteArticle(id: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function incrementViews(id: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $inc: { views: 1 } }
  );

  return result.modifiedCount > 0;
}

export async function getArticles(
  filters: {
    category?: ArticleCategory;
    author?: string;
    published?: boolean;
    search?: string;
    type?: ArticleType;          // 🆕 Filter by type
  } = {},
  skip: number = 0,
  limit: number = 20
) {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
  const query: any = {};
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.author) {
    query.author = new ObjectId(filters.author);
  }
  
  if (filters.published !== undefined) {
    query.published = filters.published;
  }

  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { tags: { $in: [new RegExp(filters.search, 'i')] } }
    ];
  }

  const articles = await collection
    .find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .toArray();

  const total = await collection.countDocuments(query);

  return { articles, total };
}

export async function getPopularArticles(limit: number = 10) {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
  return collection
    .find({ published: true })
    .sort({ views: -1 })
    .limit(limit)
    .toArray();
}

export async function createIndexes() {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
  await collection.createIndex({ slug: 1 }, { unique: true });
  await collection.createIndex({ author: 1 });
  await collection.createIndex({ category: 1 });
  await collection.createIndex({ published: 1 });
  await collection.createIndex({ type: 1 });        // 🆕 Index for type
  await collection.createIndex({ createdAt: -1 });
  await collection.createIndex({ views: -1 });
  await collection.createIndex({ title: 'text', description: 'text', tags: 'text' });
}