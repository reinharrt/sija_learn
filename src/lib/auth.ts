// ============================================
// src/lib/auth.ts
// Auth Utilities - FIXED VERSION with proper JWT typing
// ============================================

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthUser, UserRole } from '@/types';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  ) as string;
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function generateVerificationToken(): string {
  return jwt.sign(
    { random: Math.random().toString() },
    JWT_SECRET,
    { expiresIn: '24h' }
  ) as string;
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.USER]: 0,
    [UserRole.WRITER]: 1,
    [UserRole.COURSE_ADMIN]: 2,
    [UserRole.ADMIN]: 3
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// For NextRequest (API routes)
export function getUserFromRequest(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

// Alternative: Get user from cookies (if you're using cookie-based auth)
export function getUserFromCookies(request: NextRequest): AuthUser | null {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

// ============================================
// OTP UTILITIES
// ============================================

/**
 * Generate a 6-digit numeric OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if OTP is still valid (not expired)
 */
export function isOTPValid(otpExpiry: Date | undefined): boolean {
  if (!otpExpiry) return false;
  return new Date() < new Date(otpExpiry);
}

// ============================================
// RATE LIMITING UTILITIES
// ============================================

export interface RateLimitResult {
  allowed: boolean;
  message?: string;
  resetAt?: Date;
}

/**
 * Check if user has exceeded OTP request rate limit
 * Max 3 requests per 15 minutes
 */
export function checkOTPRequestRateLimit(
  requestCount: number | undefined,
  resetAt: Date | undefined
): RateLimitResult {
  const now = new Date();
  const MAX_REQUESTS = 3;
  const WINDOW_MINUTES = 15;

  // If no reset time or reset time has passed, allow request
  if (!resetAt || now > new Date(resetAt)) {
    return { allowed: true };
  }

  // Check if limit exceeded
  if (requestCount && requestCount >= MAX_REQUESTS) {
    return {
      allowed: false,
      message: `Terlalu banyak permintaan OTP. Silakan coba lagi setelah ${new Date(resetAt).toLocaleTimeString('id-ID')}.`,
      resetAt: new Date(resetAt)
    };
  }

  return { allowed: true };
}

/**
 * Check if user has exceeded password change attempt rate limit
 * Max 5 attempts per hour
 */
export function checkPasswordChangeRateLimit(
  attempts: number | undefined,
  resetAt: Date | undefined
): RateLimitResult {
  const now = new Date();
  const MAX_ATTEMPTS = 5;
  const WINDOW_MINUTES = 60;

  // If no reset time or reset time has passed, allow attempt
  if (!resetAt || now > new Date(resetAt)) {
    return { allowed: true };
  }

  // Check if limit exceeded
  if (attempts && attempts >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      message: `Terlalu banyak percobaan ganti password. Silakan coba lagi setelah ${new Date(resetAt).toLocaleTimeString('id-ID')}.`,
      resetAt: new Date(resetAt)
    };
  }

  return { allowed: true };
}

/**
 * Calculate new rate limit values for OTP requests
 */
export function incrementOTPRequestLimit(
  currentCount: number | undefined,
  currentResetAt: Date | undefined
): { count: number; resetAt: Date } {
  const now = new Date();
  const WINDOW_MINUTES = 15;

  // If reset time has passed or doesn't exist, start fresh
  if (!currentResetAt || now > new Date(currentResetAt)) {
    const resetAt = new Date(now.getTime() + WINDOW_MINUTES * 60 * 1000);
    return { count: 1, resetAt };
  }

  // Increment existing count
  return {
    count: (currentCount || 0) + 1,
    resetAt: new Date(currentResetAt)
  };
}

/**
 * Calculate new rate limit values for password change attempts
 */
export function incrementPasswordChangeLimit(
  currentAttempts: number | undefined,
  currentResetAt: Date | undefined
): { attempts: number; resetAt: Date } {
  const now = new Date();
  const WINDOW_MINUTES = 60;

  // If reset time has passed or doesn't exist, start fresh
  if (!currentResetAt || now > new Date(currentResetAt)) {
    const resetAt = new Date(now.getTime() + WINDOW_MINUTES * 60 * 1000);
    return { attempts: 1, resetAt };
  }

  // Increment existing attempts
  return {
    attempts: (currentAttempts || 0) + 1,
    resetAt: new Date(currentResetAt)
  };
}