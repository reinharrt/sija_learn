//src/app/api/auth/change-password/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, updateUser } from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { validatePassword } from '@/lib/utils';

const MAX_PASSWORD_CHANGE_ATTEMPTS = 5;
const PASSWORD_CHANGE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
    try {
        const { email, otp, newPassword } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email and OTP are required' },
                { status: 400 }
            );
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (!user.passwordResetOTP) {
            return NextResponse.json(
                { error: 'No OTP found. Please request a new OTP.' },
                { status: 400 }
            );
        }

        if (user.passwordResetOTPExpiry && new Date(user.passwordResetOTPExpiry) < new Date()) {
            return NextResponse.json(
                { error: 'OTP has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        if (user.passwordResetOTP !== otp) {
            return NextResponse.json(
                { error: 'Invalid OTP' },
                { status: 400 }
            );
        }

        if (newPassword) {
            const now = new Date();
            const resetAt = user.passwordChangeResetAt ? new Date(user.passwordChangeResetAt) : null;

            if (!resetAt || now > resetAt) {
                await updateUser(user._id!.toString(), {
                    passwordChangeAttempts: 0,
                    passwordChangeResetAt: new Date(now.getTime() + PASSWORD_CHANGE_WINDOW_MS),
                });
                user.passwordChangeAttempts = 0;
            }

            if ((user.passwordChangeAttempts || 0) >= MAX_PASSWORD_CHANGE_ATTEMPTS) {
                const timeLeft = resetAt ? Math.ceil((resetAt.getTime() - now.getTime()) / 60000) : 0;
                return NextResponse.json(
                    { error: `Too many password change attempts. Try again in ${timeLeft} minutes.` },
                    { status: 429 }
                );
            }

            const passwordValidation = validatePassword(newPassword);
            if (!passwordValidation.valid) {
                return NextResponse.json(
                    { error: passwordValidation.message || 'Invalid password' },
                    { status: 400 }
                );
            }

            const hashedPassword = await hashPassword(newPassword);

            await updateUser(user._id!.toString(), {
                password: hashedPassword,
                passwordResetOTP: undefined,
                passwordResetOTPExpiry: undefined,
                passwordChangeAttempts: (user.passwordChangeAttempts || 0) + 1
            });

            return NextResponse.json({
                message: 'Password changed successfully',
                verified: true,
                passwordChanged: true
            });
        } else {
            return NextResponse.json({
                message: 'OTP verified successfully',
                verified: true,
                passwordChanged: false
            });
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
