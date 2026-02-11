import { NextRequest, NextResponse } from 'next/server';
import { getUserProgress } from '@/models/UserProgress';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const progress = await getUserProgress(userId);

        if (!progress) {
            return NextResponse.json(
                { error: 'User progress not found' },
                { status: 404 }
            );
        }

        const db = await getDatabase();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { name: 1, email: 1, image: 1 } }
        );

        return NextResponse.json({
            progress,
            user: user || null
        });
    } catch (error) {
        console.error('Error fetching user progress:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user progress' },
            { status: 500 }
        );
    }
}
