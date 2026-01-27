// ============================================
// src/app/api/auth/login/route.ts
// Login API - Handle user authentication
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, generateToken } from '@/lib/auth';
import { findUserByEmail } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Email belum diverifikasi. Silakan cek email Anda.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json(
      {
        message: 'Login berhasil',
        token,
        user: {
          id: user._id!.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
