// ============================================
// src/app/api/gamification/rank/[userId]/route.ts
// API Route - Get user's rank position
// ============================================

import { NextResponse } from 'next/server';
import { getUserRank } from '@/models/UserProgress';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const rank = await getUserRank(userId);

    if (rank === -1) {
      return NextResponse.json(
        { error: 'User progress not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ rank });
  } catch (error) {
    console.error('Error fetching rank:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rank' },
      { status: 500 }
    );
  }
}