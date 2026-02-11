// src/app/api/profile/update/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, generateVerificationToken } from '@/lib/auth';
import { findUserById, findUserByEmail, updateUser } from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';
import { validateEmail } from '@/lib/utils';
import { ObjectId } from 'mongodb';

const ENABLE_EMAIL_VERIFICATION = process.env.ENABLE_EMAIL_VERIFICATION === 'true';

export async function PUT(request: NextRequest) {
    try {
        const authUser = getUserFromRequest(request);
        if (!authUser) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name, email } = await request.json();

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        if (email && !validateEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const currentUser = await findUserById(authUser.id);
        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const updates: any = {
            name: name.trim()
        };

        let requiresReLogin = false;
        let emailVerificationSent = false;

        if (email && email !== currentUser.email) {
            const existingUser = await findUserByEmail(email);
            if (existingUser) {
                return NextResponse.json(
                    { error: 'Email already in use' },
                    { status: 400 }
                );
            }

            if (ENABLE_EMAIL_VERIFICATION) {
                const verificationToken = generateVerificationToken();
                const verificationTokenExpiry = new Date();
                verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

                updates.email = email;
                updates.isVerified = false;
                updates.verificationToken = verificationToken;
                updates.verificationTokenExpiry = verificationTokenExpiry;

                try {
                    await sendVerificationEmail(email, name, verificationToken);
                    emailVerificationSent = true;
                    requiresReLogin = true;
                } catch (error) {
                    console.error("Failed to send verification email during update:", error);
                    return NextResponse.json(
                        { error: 'Failed to send verification email. Please try again later.' },
                        { status: 500 }
                    );
                }

            } else {
                updates.email = email;
                requiresReLogin = true;
            }
        }

        const success = await updateUser(authUser.id, updates);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to update profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: emailVerificationSent
                ? 'Profile updated. Please check your email to verify your new address.'
                : 'Profile updated successfully',
            requiresReLogin,
            emailVerificationSent,
            user: {
                ...currentUser,
                ...updates
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
