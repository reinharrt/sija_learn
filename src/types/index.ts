// src/types/index.ts

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
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  // Password reset OTP fields
  passwordResetOTP?: string;
  passwordResetOTPExpiry?: Date;
  // Rate limiting fields
  otpRequestCount?: number;
  otpRequestResetAt?: Date;
  passwordChangeAttempts?: number;
  passwordChangeResetAt?: Date;
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
  finalQuizId?: ObjectId;      // 🆕 Optional final quiz
  createdAt: Date;
  updatedAt: Date;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  xpReward?: number; // Calculated based on difficulty
}

export interface Comment {
  _id?: ObjectId;
  articleId: ObjectId;
  userId: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    _id: string;
    name: string;
    email?: string;
  };
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
  quizId?: ObjectId;               // 🆕 Optional quiz for this article
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// NEW: Category interface
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

// New gamification types:
export interface UserProgress {
  _id?: string;
  userId: string;
  totalXP: number;
  currentLevel: number;
  badges: string[];
  stats: {
    coursesCompleted: number;
    articlesRead: number;
    commentsPosted: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'progress' | 'streak' | 'social' | 'speed' | 'explorer' | 'special';
  xpReward?: number;
}

// ============================================
// QUIZ SYSTEM TYPES
// ============================================

export enum QuizQuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',      // Single answer
  MULTIPLE_ANSWER = 'multiple-answer',      // Multiple answers
  TRUE_FALSE = 'true-false'                 // True or False
}

export enum QuizType {
  ARTICLE_QUIZ = 'article-quiz',            // Quiz for specific article
  FINAL_QUIZ = 'final-quiz'                 // Final course quiz
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options: QuizOption[];                    // For multiple choice/answer
  points: number;
  explanation?: string;                     // Shown after answering
  order: number;
}

export interface Quiz {
  _id?: ObjectId;
  title: string;
  description?: string;
  courseId: ObjectId;
  articleId?: ObjectId;                     // Optional - for article quizzes
  type: QuizType;
  questions: QuizQuestion[];
  passingScore: number;                     // Percentage (0-100)
  timeLimit?: number;                       // In minutes, optional
  maxAttempts?: number;                     // Optional limit on attempts
  xpReward: number;                         // XP awarded on passing
  prerequisiteQuizIds?: ObjectId[];         // 🆕 Optional prerequisites
  createdBy: ObjectId;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentAnswer {
  questionId: string;
  selectedOptions: string[];                // Array of option IDs
}

export interface QuizAttempt {
  _id?: ObjectId;
  quizId: ObjectId;
  userId: ObjectId;
  answers: StudentAnswer[];
  score: number;                            // Percentage (0-100)
  passed: boolean;
  xpEarned: number;
  timeSpent?: number;                       // In seconds
  startedAt: Date;
  completedAt: Date;
}

export interface QuizResult {
  attempt: QuizAttempt;
  questionResults: {
    questionId: string;
    question: string;
    type: QuizQuestionType;
    studentAnswer: string[];
    correctAnswer: string[];
    isCorrect: boolean;
    points: number;
    earnedPoints: number;
    explanation?: string;
  }[];
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  passed: boolean;
}

// ============================================
// EMAIL SUBSCRIPTION TYPES
// ============================================

export interface Subscriber {
  _id?: ObjectId;
  email: string;
  subscribedAt: Date;
  isActive: boolean;
  unsubscribeToken: string;
}
