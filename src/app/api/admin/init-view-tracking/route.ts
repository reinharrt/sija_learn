// src/app/api/admin/init-view-tracking/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { createViewIndexes } from '@/lib/view-tracker';
import { UserRole } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user || !hasPermission(user.role, UserRole.ADMIN)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin only' },
        { status: 403 }
      );
    }

    console.log('🚀 Initializing view tracking indexes...');

    await createViewIndexes();

    return NextResponse.json({
      success: true,
      message: 'View tracking indexes created successfully!',
      features: [
        'Prevents duplicate views from same IP within 24h',
        'Prevents duplicate views from same user within 24h',
        'Automatically cleans up data older than 90 days',
        'Tracks detailed view statistics',
      ],
      note: 'Indexes are permanent in MongoDB. No need to run this again.',
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Failed to initialize view tracking:', error);
    return NextResponse.json(
      {
        error: 'Failed to create indexes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}