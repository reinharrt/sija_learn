// ============================================
// src/app/api/auth/change-password/verify-otp-only/route.ts
// Verify OTP Only (without password change)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        // Validate input
        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email dan OTP harus diisi' },
                { status: 400 }
            );
        }

        // Find user
        const user = await findUserByEmail(email);
        if (!user) {
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        // Check if OTP exists
        if (!user.passwordResetOTP) {
            return NextResponse.json(
                { error: 'OTP tidak ditemukan. Silakan minta OTP baru' },
                { status: 400 }
            );
        }

        // Check if OTP expired
        const now = new Date();
        const otpExpiry = user.passwordResetOTPExpiry ? new Date(user.passwordResetOTPExpiry) : null;

        if (!otpExpiry || now > otpExpiry) {
            return NextResponse.json(
                { error: 'OTP telah kadaluarsa. Silakan minta OTP baru' },
                { status: 400 }
            );
        }

        // Verify OTP
        if (user.passwordResetOTP !== otp) {
            return NextResponse.json(
                { error: 'Kode OTP salah' },
                { status: 400 }
            );
        }

        // OTP is valid
        return NextResponse.json(
            {
                message: 'OTP valid',
                verified: true
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Verify OTP only error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
