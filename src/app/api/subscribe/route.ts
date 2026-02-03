// ============================================
// src/app/api/subscribe/route.ts
// Email Subscription API - Subscribe to newsletter
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createSubscriber, findSubscriberByEmail, reactivateSubscriber } from '@/models/Subscriber';
import { sendWelcomeSubscriptionEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validate email
        if (!email || !email.trim()) {
            return NextResponse.json(
                { error: 'Email wajib diisi' },
                { status: 400 }
            );
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Format email tidak valid' },
                { status: 400 }
            );
        }

        // Check if subscriber already exists
        const existingSubscriber = await findSubscriberByEmail(email);

        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return NextResponse.json(
                    { error: 'Email sudah terdaftar' },
                    { status: 409 }
                );
            } else {
                // Reactivate inactive subscriber
                await reactivateSubscriber(email);

                // Send welcome email again
                await sendWelcomeSubscriptionEmail(email, existingSubscriber.unsubscribeToken);

                return NextResponse.json(
                    { message: 'Berhasil berlangganan kembali!' },
                    { status: 200 }
                );
            }
        }

        // Create new subscriber
        const subscriberId = await createSubscriber(email);

        // Get the created subscriber to get the unsubscribe token
        const newSubscriber = await findSubscriberByEmail(email);

        if (!newSubscriber) {
            throw new Error('Failed to retrieve subscriber after creation');
        }

        // Send welcome email
        const emailResult = await sendWelcomeSubscriptionEmail(email, newSubscriber.unsubscribeToken);

        if (!emailResult.success) {
            console.error('Failed to send welcome email:', emailResult.error);
            // Don't fail the subscription if email fails
        }

        return NextResponse.json(
            {
                message: 'Berhasil berlangganan! Cek email kamu untuk konfirmasi.',
                subscriberId: subscriberId.toString()
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Subscribe error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
