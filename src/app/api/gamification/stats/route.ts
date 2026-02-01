// ============================================
// src/app/api/gamification/stats/route.ts
// API Route - Get global gamification stats
// ============================================

import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
    try {
        const db = await getDatabase();
        const collection = db.collection('user_progress');

        // Get all user progress records
        const allProgress = await collection.find({}).toArray();

        // Calculate global stats
        const totalUsers = allProgress.length;
        const totalXP = allProgress.reduce((sum, p) => sum + (p.totalXP || 0), 0);
        const averageLevel = totalUsers > 0
            ? Math.round(allProgress.reduce((sum, p) => sum + (p.currentLevel || 1), 0) / totalUsers)
            : 0;

        return NextResponse.json({
            totalUsers,
            totalXP,
            averageLevel
        });
    } catch (error) {
        console.error('Error fetching global stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
