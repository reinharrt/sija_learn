// src/app/api/unsubscribe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeByToken, findSubscriberByToken } from '@/models/Subscriber';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token || !token.trim()) {
            return NextResponse.json(
                { error: 'Token tidak valid' },
                { status: 400 }
            );
        }

        const subscriber = await findSubscriberByToken(token);

        if (!subscriber) {
            return NextResponse.json(
                { error: 'Token tidak ditemukan' },
                { status: 404 }
            );
        }

        if (!subscriber.isActive) {
            return NextResponse.json(
                { message: 'Kamu sudah berhenti berlangganan sebelumnya' },
                { status: 200 }
            );
        }

        const success = await unsubscribeByToken(token);

        if (!success) {
            throw new Error('Failed to unsubscribe');
        }

        return NextResponse.json(
            { message: 'Berhasil berhenti berlangganan. Kamu tidak akan menerima email lagi.' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
