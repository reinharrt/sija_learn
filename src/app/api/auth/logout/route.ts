// ============================================
// src/app/api/auth/logout/route.ts
// Logout API - Handle user logout
// ============================================

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: 'Logout berhasil' },
    { status: 200 }
  );
}
