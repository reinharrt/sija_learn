// src/app/api/profile/[userId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '@/models/User';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const user = await findUserById(userId);

        if (!user) {
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        const { password, ...userProfile } = user;

        return NextResponse.json({ user: userProfile });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
