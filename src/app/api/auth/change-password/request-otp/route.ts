// ============================================
// src/app/api/auth/change-password/request-otp/route.ts
// Request OTP for Password Reset
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, updateUser } from '@/models/User';
import { sendPasswordResetOTP } from '@/lib/email';

// Rate limiting constants
const MAX_OTP_REQUESTS = 3;
const OTP_REQUEST_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validate input
        if (!email) {
            return NextResponse.json(
                { error: 'Email harus diisi' },
                { status: 400 }
            );
        }

        // Find user
        const user = await findUserByEmail(email);
        if (!user) {
            // Don't reveal if email exists or not for security
            return NextResponse.json(
                { message: 'Jika email terdaftar, OTP akan dikirim ke email tersebut' },
                { status: 200 }
            );
        }

        // Check rate limiting
        const now = new Date();
        const resetAt = user.otpRequestResetAt ? new Date(user.otpRequestResetAt) : null;

        // Reset counter if window has passed
        if (!resetAt || now > resetAt) {
            await updateUser(user._id!.toString(), {
                otpRequestCount: 0,
                otpRequestResetAt: new Date(now.getTime() + OTP_REQUEST_WINDOW_MS),
            });
            user.otpRequestCount = 0;
        }

        // Check if user exceeded rate limit
        if ((user.otpRequestCount || 0) >= MAX_OTP_REQUESTS) {
            const timeLeft = resetAt ? Math.ceil((resetAt.getTime() - now.getTime()) / 60000) : 0;
            return NextResponse.json(
                { error: `Terlalu banyak permintaan OTP. Coba lagi dalam ${timeLeft} menit` },
                { status: 429 }
            );
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(now.getTime() + OTP_EXPIRY_MS);

        // Update user with OTP and increment counter
        await updateUser(user._id!.toString(), {
            passwordResetOTP: otp,
            passwordResetOTPExpiry: otpExpiry,
            otpRequestCount: (user.otpRequestCount || 0) + 1,
        });

        // Send OTP email
        try {
            await sendPasswordResetOTP(email, user.name, otp);

            return NextResponse.json(
                {
                    message: 'OTP telah dikirim ke email Anda',
                    expiresIn: '10 menit'
                },
                { status: 200 }
            );
        } catch (emailError) {
            console.error('Email sending error:', emailError);

            return NextResponse.json(
                { error: 'Gagal mengirim OTP. Silakan coba lagi nanti' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Request OTP error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
