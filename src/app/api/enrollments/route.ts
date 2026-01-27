// ============================================
// src/app/api/enrollments/route.ts
// Enrollments API - List user enrollments
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createEnrollment, getUserEnrollments, isUserEnrolled } from '@/models/Enrollment';
import { incrementEnrolled } from '@/models/Course';

// GET /api/enrollments - Get user's enrollments
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    // Check if enrolled in specific course
    if (courseId) {
      const enrolled = await isUserEnrolled(user.id, courseId);
      return NextResponse.json({ enrolled }, { status: 200 });
    }

    // Get all user enrollments
    const enrollments = await getUserEnrollments(user.id);

    return NextResponse.json(
      { enrollments },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST /api/enrollments - Enroll in a course
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId harus diisi' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollmentId = await createEnrollment(user.id, courseId);

    // Increment enrolled count
    await incrementEnrolled(courseId);

    return NextResponse.json(
      { 
        message: 'Berhasil mendaftar course',
        enrollmentId: enrollmentId.toString()
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Enroll error:', error);
    
    if (error.message === 'Anda sudah terdaftar di course ini') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}