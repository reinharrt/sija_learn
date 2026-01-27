// ============================================
// src/app/api/auth/register/route.ts
// Register API - Handle user registration
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateVerificationToken } from '@/lib/auth';
import { validateEmail, validatePassword } from '@/lib/utils';
import { sendVerificationEmail } from '@/lib/email';
import { findUserByEmail, createUser } from '@/models/User';
import { createTempUser, findTempUserByEmail, deleteTempUser } from '@/models/TempUser';
import { UserRole } from '@/types';

// ============================================
// TOGGLE EMAIL VERIFICATION
// ============================================
// Baca dari environment variable
// Set di .env.local: ENABLE_EMAIL_VERIFICATION=true/false
const ENABLE_EMAIL_VERIFICATION = process.env.ENABLE_EMAIL_VERIFICATION === 'true';
// ============================================

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validasi input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // ============================================
    // MODE 1: DENGAN EMAIL VERIFICATION
    // ============================================
    if (ENABLE_EMAIL_VERIFICATION) {
      // Hapus temp user lama jika ada
      const existingTempUser = await findTempUserByEmail(email);
      if (existingTempUser) {
        await deleteTempUser(email);
      }

      // Generate token dan expiry
      const verificationToken = generateVerificationToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Simpan ke temp_users
      await createTempUser({
        email,
        password: hashedPassword,
        name,
        verificationToken,
        expiresAt,
      });

      // Kirim email verification
      try {
        await sendVerificationEmail(email, name, verificationToken);
        
        return NextResponse.json(
          { 
            message: 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
            email,
            requiresVerification: true
          },
          { status: 201 }
        );
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        
        // Jika email gagal, tetap return success
        // User bisa di-verify manual oleh admin
        return NextResponse.json(
          { 
            message: 'Registrasi berhasil, tetapi email verifikasi gagal dikirim. Hubungi admin untuk verifikasi manual.',
            email,
            requiresVerification: true,
            emailError: true
          },
          { status: 201 }
        );
      }
    }

    // ============================================
    // MODE 2: TANPA EMAIL VERIFICATION (DIRECT)
    // ============================================
    else {
      // Langsung create user dengan isVerified: true
      await createUser({
        email,
        password: hashedPassword,
        name,
        role: UserRole.USER,
        isVerified: true, // ← Langsung verified!
      });

      return NextResponse.json(
        { 
          message: 'Registrasi berhasil! Anda dapat langsung login.',
          email,
          requiresVerification: false
        },
        { status: 201 }
      );
    }

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}