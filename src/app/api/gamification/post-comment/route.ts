// ============================================
// src/app/api/gamification/post-comment/route.ts
// API Route - Award XP when posting a comment
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { postComment } from '@/lib/gamification';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Award XP for posting comment
    const result = await postComment(user.id);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error posting comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process comment' },
      { status: 500 }
    );
  }
}