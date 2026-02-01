
import { NextRequest, NextResponse } from 'next/server';
import { getCommentsByUser } from '@/models/Comment';
import { updateStats, getUserProgress, getUserRank } from '@/models/UserProgress';
import { getUserBadgesWithDetails } from '@/lib/gamification';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        // 1. Sync stats (from api/gamification/sync/[userId])
        // Recount comments to ensure accuracy
        const { total: commentCount } = await getCommentsByUser(userId, 0, 1);

        // Update stats
        await updateStats(userId, {
            commentsPosted: commentCount
        });

        // 2. Fetch all data in parallel
        const [progress, badges, rank, db] = await Promise.all([
            getUserProgress(userId),
            getUserBadgesWithDetails(userId),
            getUserRank(userId),
            getDatabase()
        ]);

        if (!progress) {
            return NextResponse.json(
                { error: 'User progress not found' },
                { status: 404 }
            );
        }

        // 3. Fetch user details (from api/gamification/progress/[userId])
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { name: 1, email: 1, image: 1 } }
        );

        // Return unified response
        return NextResponse.json({
            progress: {
                ...progress,
                // Ensure synced stats are returned
                stats: {
                    ...progress.stats,
                    commentsPosted: commentCount
                }
            },
            user: user || null,
            badges,
            rank: rank === -1 ? null : rank
        });

    } catch (error) {
        console.error('Error fetching profile data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile data' },
            { status: 500 }
        );
    }
}
