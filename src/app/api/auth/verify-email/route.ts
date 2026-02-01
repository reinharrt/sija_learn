// ============================================
// src/app/api/auth/verify-email/route.ts
// Email Verification API - Verify user email
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { findTempUserByToken, deleteTempUser } from '@/models/TempUser';
import { createUser, findUserByEmail } from '@/models/User';
import { sendWelcomeEmail } from '@/lib/email';
import { UserRole, User } from '@/types';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token verifikasi tidak ditemukan' },
        { status: 400 }
      );
    }

    const tempUser = await findTempUserByToken(token);

    // Case 1: New Registration
    if (tempUser) {
      const existingUser = await findUserByEmail(tempUser.email);
      if (existingUser) {
        await deleteTempUser(tempUser.email);
        return NextResponse.json(
          { error: 'Email sudah terverifikasi' },
          { status: 400 }
        );
      }

      await createUser({
        email: tempUser.email,
        password: tempUser.password,
        name: tempUser.name,
        role: UserRole.USER,
        isVerified: true,
      });

      await deleteTempUser(tempUser.email);
      await sendWelcomeEmail(tempUser.email, tempUser.name);

      return NextResponse.json(
        { message: 'Email berhasil diverifikasi. Silakan login.' },
        { status: 200 }
      );
    }

    // Case 2: Existing User (Profile Update)
    // We need to import findUserByVerificationToken (need to implement or query directly)
    // For simplicity, let's query directly as we can't easily add export to model in the same step if mixed file access
    // But better to use model function. let's check User.ts again. 
    // Wait, I should probably add findUserByVerificationToken to User.ts first or do a direct db call here.
    // Direct DB call is easier for now to avoid multiple file edits in one thought if possible, but User.ts is cleaner.
    // Let's do direct DB call here for speed, valid in route handler.

    // Actually, I'll update User.ts first to include `findUserByVerificationToken` for cleaner code? 
    // No, I can just use `getDatabase` here.

    const db = await getDatabase(); // need import
    const user = await db.collection<User>('users').findOne({ verificationToken: token });

    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid atau sudah kadaluarsa' },
        { status: 400 }
      );
    }

    // Check expiry if field exists
    if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
      return NextResponse.json(
        { error: 'Token sudah kadaluarsa' },
        { status: 400 }
      );
    }

    // Update User
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: { verificationToken: "", verificationTokenExpiry: "" }
      }
    );

    return NextResponse.json(
      { message: 'Email berhasil diverifikasi. Silakan login kembali.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
