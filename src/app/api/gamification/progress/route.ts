// ============================================
// src/app/api/gamification/progress/route.ts
// API Route - Get current user's progress
// FIXED: Using getUserFromRequest instead of getUserFromSession
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserProgress, initializeUserProgress } from '@/models/UserProgress';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let progress = await getUserProgress(user.id);
    
    // Initialize if doesn't exist
    if (!progress) {
      await initializeUserProgress(user.id);
      progress = await getUserProgress(user.id);
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}