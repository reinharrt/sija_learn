
import { NextRequest, NextResponse } from 'next/server';
import { getCommentsByUser } from '@/models/Comment';
import { updateStats } from '@/models/UserProgress';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        // Recount comments
        const { total: commentCount } = await getCommentsByUser(userId, 0, 1);

        // Update stats
        await updateStats(userId, {
            commentsPosted: commentCount
        });

        return NextResponse.json({
            success: true,
            syncedStats: {
                commentsPosted: commentCount
            }
        });
    } catch (error) {
        console.error('Error syncing user stats:', error);
        return NextResponse.json(
            { error: 'Failed to sync user stats' },
            { status: 500 }
        );
    }
}
