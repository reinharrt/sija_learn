import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Node.js runtime sekarang stable di Next.js 15.5
export const config = {
  runtime: 'nodejs', // Stable! Bisa akses full Node.js APIs
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(request: NextRequest) {
  // Middleware logic here
  return NextResponse.next();
}