// src/app/api/auth/change-password/request-otp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, updateUser } from '@/models/User';
import { sendPasswordResetOTP } from '@/lib/email';

const MAX_OTP_REQUESTS = 3;
const OTP_REQUEST_WINDOW_MS = 60 * 60 * 1000;
const OTP_EXPIRY_MS = 10 * 60 * 1000;

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email harus diisi' },
                { status: 400 }
            );
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return NextResponse.json(
                { message: 'Jika email terdaftar, OTP akan dikirim ke email tersebut' },
                { status: 200 }
            );
        }

        const now = new Date();
        const resetAt = user.otpRequestResetAt ? new Date(user.otpRequestResetAt) : null;

        if (!resetAt || now > resetAt) {
            await updateUser(user._id!.toString(), {
                otpRequestCount: 0,
                otpRequestResetAt: new Date(now.getTime() + OTP_REQUEST_WINDOW_MS),
            });
            user.otpRequestCount = 0;
        }

        if ((user.otpRequestCount || 0) >= MAX_OTP_REQUESTS) {
            const timeLeft = resetAt ? Math.ceil((resetAt.getTime() - now.getTime()) / 60000) : 0;
            return NextResponse.json(
                { error: `Terlalu banyak permintaan OTP. Coba lagi dalam ${timeLeft} menit` },
                { status: 429 }
            );
        }

        const otp = generateOTP();
        const otpExpiry = new Date(now.getTime() + OTP_EXPIRY_MS);

        await updateUser(user._id!.toString(), {
            passwordResetOTP: otp,
            passwordResetOTPExpiry: otpExpiry,
            otpRequestCount: (user.otpRequestCount || 0) + 1,
        });

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
