// src/app/api/subscribe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createSubscriber, findSubscriberByEmail, reactivateSubscriber } from '@/models/Subscriber';
import { sendWelcomeSubscriptionEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !email.trim()) {
            return NextResponse.json(
                { error: 'Email wajib diisi' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Format email tidak valid' },
                { status: 400 }
            );
        }

        const existingSubscriber = await findSubscriberByEmail(email);

        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return NextResponse.json(
                    { error: 'Email sudah terdaftar' },
                    { status: 409 }
                );
            } else {
                await reactivateSubscriber(email);

                await sendWelcomeSubscriptionEmail(email, existingSubscriber.unsubscribeToken);

                return NextResponse.json(
                    { message: 'Berhasil berlangganan kembali!' },
                    { status: 200 }
                );
            }
        }

        const subscriberId = await createSubscriber(email);

        const newSubscriber = await findSubscriberByEmail(email);

        if (!newSubscriber) {
            throw new Error('Failed to retrieve subscriber after creation');
        }

        const emailResult = await sendWelcomeSubscriptionEmail(email, newSubscriber.unsubscribeToken);

        if (!emailResult.success) {
            console.error('Failed to send welcome email:', emailResult.error);
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
