// src/app/api/gamification/badges/[userId]/route.ts

import { NextResponse } from 'next/server';
import { getUserBadgesWithDetails } from '@/lib/gamification';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const badges = await getUserBadgesWithDetails(userId);

    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}