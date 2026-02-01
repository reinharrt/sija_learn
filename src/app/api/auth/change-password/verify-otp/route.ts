// ============================================
// src/app/api/auth/change-password/verify-otp/route.ts
// Verify OTP and Change Password
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, updateUser } from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { validatePassword } from '@/lib/utils';

// Rate limiting constants
const MAX_PASSWORD_CHANGE_ATTEMPTS = 5;
const PASSWORD_CHANGE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
    try {
        const { email, otp, newPassword } = await request.json();

        // Validate input
        if (!email || !otp || !newPassword) {
            return NextResponse.json(
                { error: 'Email, OTP, dan password baru harus diisi' },
                { status: 400 }
            );
        }

        // Validate password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return NextResponse.json(
                { error: passwordValidation.message },
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

        // Check rate limiting for password change attempts
        const now = new Date();
        const resetAt = user.passwordChangeResetAt ? new Date(user.passwordChangeResetAt) : null;

        // Reset counter if window has passed
        if (!resetAt || now > resetAt) {
            await updateUser(user._id!.toString(), {
                passwordChangeAttempts: 0,
                passwordChangeResetAt: new Date(now.getTime() + PASSWORD_CHANGE_WINDOW_MS),
            });
            user.passwordChangeAttempts = 0;
        }

        // Check if user exceeded rate limit
        if ((user.passwordChangeAttempts || 0) >= MAX_PASSWORD_CHANGE_ATTEMPTS) {
            const timeLeft = resetAt ? Math.ceil((resetAt.getTime() - now.getTime()) / 60000) : 0;
            return NextResponse.json(
                { error: `Terlalu banyak percobaan. Coba lagi dalam ${timeLeft} menit` },
                { status: 429 }
            );
        }

        // Check if OTP exists
        if (!user.passwordResetOTP) {
            // Increment attempt counter
            await updateUser(user._id!.toString(), {
                passwordChangeAttempts: (user.passwordChangeAttempts || 0) + 1,
            });

            return NextResponse.json(
                { error: 'OTP tidak ditemukan. Silakan minta OTP baru' },
                { status: 400 }
            );
        }

        // Check if OTP expired
        const otpExpiry = user.passwordResetOTPExpiry ? new Date(user.passwordResetOTPExpiry) : null;

        if (!otpExpiry || now > otpExpiry) {
            // Increment attempt counter
            await updateUser(user._id!.toString(), {
                passwordChangeAttempts: (user.passwordChangeAttempts || 0) + 1,
            });

            return NextResponse.json(
                { error: 'OTP telah kadaluarsa. Silakan minta OTP baru' },
                { status: 400 }
            );
        }

        // Verify OTP
        if (user.passwordResetOTP !== otp) {
            // Increment attempt counter for wrong OTP
            await updateUser(user._id!.toString(), {
                passwordChangeAttempts: (user.passwordChangeAttempts || 0) + 1,
            });

            return NextResponse.json(
                { error: 'Kode OTP salah' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password and clear OTP fields
        await updateUser(user._id!.toString(), {
            password: hashedPassword,
            passwordResetOTP: undefined,
            passwordResetOTPExpiry: undefined,
            passwordChangeAttempts: 0, // Reset attempts on successful change
            passwordChangeResetAt: undefined,
        });

        return NextResponse.json(
            {
                message: 'Password berhasil diubah. Silakan login dengan password baru Anda',
                success: true
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Verify OTP and change password error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
