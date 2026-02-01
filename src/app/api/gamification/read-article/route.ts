// ============================================
// src/app/api/gamification/read-article/route.ts
// API Route - Award XP when reading an article
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readArticle } from '@/lib/gamification';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { articleId, wordCount } = body;

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID required' },
        { status: 400 }
      );
    }

    // Award XP for reading
    const result = await readArticle(user.id, articleId, wordCount);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error reading article:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process article read' },
      { status: 500 }
    );
  }
}