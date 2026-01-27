// ============================================
// src/app/api/auth/verify-email/route.ts
// Email Verification API - Verify user email
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { findTempUserByToken, deleteTempUser } from '@/models/TempUser';
import { createUser, findUserByEmail } from '@/models/User';
import { sendWelcomeEmail } from '@/lib/email';
import { UserRole } from '@/types';

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
    if (!tempUser) {
      return NextResponse.json(
        { error: 'Token tidak valid atau sudah kadaluarsa' },
        { status: 400 }
      );
    }

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
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
