// ============================================
// src/middleware.ts
// Middleware - Request middleware and authentication
// ============================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Node.js runtime sekarang stable di Next.js 15.5


export function middleware(request: NextRequest) {
  // Middleware logic here
  return NextResponse.next();
}