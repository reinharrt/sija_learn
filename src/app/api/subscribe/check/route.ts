// ============================================
// src/app/api/subscribe/check/route.ts
// Check Subscription Status API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { findSubscriberByEmail } from '@/models/Subscriber';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validate email
        if (!email || !email.trim()) {
            return NextResponse.json({ subscribed: false });
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ subscribed: false });
        }

        // Check if subscriber exists and is active
        const subscriber = await findSubscriberByEmail(email);

        return NextResponse.json({
            subscribed: subscriber?.isActive || false
        });
    } catch (error) {
        console.error('Check subscription error:', error);
        return NextResponse.json(
            { subscribed: false },
            { status: 200 } // Return 200 even on error to avoid breaking the UI
        );
    }
}
