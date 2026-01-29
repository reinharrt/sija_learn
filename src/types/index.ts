// ============================================
// src/types/index.ts
// Type Definitions - WITH COURSE TAGS
// ============================================

import { ObjectId } from 'mongodb';

export enum UserRole {
  USER = 'user',
  WRITER = 'writer',
  COURSE_ADMIN = 'course-admin',
  ADMIN = 'admin'
}

export enum ArticleCategory {
  PELAJARAN = 'pelajaran',
  TECH = 'tech',
  TUTORIAL = 'tutorial'
}

export enum ArticleType {
  PUBLIC = 'public',
  COURSE_ONLY = 'course-only'
}

export enum BlockType {
  TEXT = 'text',
  HEADING = 'heading',
  IMAGE = 'image',
  CODE = 'code',
  QUOTE = 'quote',
  LIST = 'list'
}

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TempUser {
  _id?: ObjectId;
  email: string;
  password: string;
  name: string;
  verificationToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  order: number;
  metadata?: {
    level?: number;
    language?: string;
    alt?: string;
  };
}

export interface Course {
  _id?: ObjectId;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  articles: ObjectId[];
  creator: ObjectId;
  tags: string[];              // 🆕 Course tags
  published: boolean;
  enrolledCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id?: ObjectId;
  articleId: ObjectId;
  userId: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  _id?: ObjectId;
  userId: ObjectId;
  courseId: ObjectId;
  enrolledAt: Date;
  progress: {
    completedArticles: ObjectId[];
    lastAccessedAt: Date;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

export interface Article {
  _id?: ObjectId;
  title: string;
  slug: string;
  description: string;
  banner?: string;
  category: string;                // Now it's a slug (e.g., "pelajaran", "web-development")
  type: ArticleType;
  blocks: ContentBlock[];
  author: ObjectId;
  tags: string[];
  views: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ✨ NEW: Category interface
export interface Category {
  _id?: ObjectId;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  usageCount: number;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}