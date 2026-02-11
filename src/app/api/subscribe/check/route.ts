// src/app/api/subscribe/check/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { findSubscriberByEmail } from '@/models/Subscriber';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !email.trim()) {
            return NextResponse.json({ subscribed: false });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ subscribed: false });
        }

        const subscriber = await findSubscriberByEmail(email);

        return NextResponse.json({
            subscribed: subscriber?.isActive || false
        });
    } catch (error) {
        console.error('Check subscription error:', error);
        return NextResponse.json(
            { subscribed: false },
            { status: 200 }
        );
    }
}
