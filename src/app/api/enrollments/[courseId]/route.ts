import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { unenrollUser, getEnrollmentProgress } from '@/models/Enrollment';
import { findCourseById } from '@/models/Course';

// GET /api/enrollments/[courseId] - Get enrollment progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId } = await params;
    const progress = await getEnrollmentProgress(user.id, courseId);

    if (!progress) {
      return NextResponse.json(
        { error: 'Anda belum terdaftar di course ini' },
        { status: 404 }
      );
    }

    return NextResponse.json({ progress }, { status: 200 });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE /api/enrollments/[courseId] - Unenroll from course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId } = await params;

    // Check if course exists
    const course = await findCourseById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course tidak ditemukan' },
        { status: 404 }
      );
    }

    const success = await unenrollUser(user.id, courseId);

    if (!success) {
      return NextResponse.json(
        { error: 'Gagal keluar dari course atau Anda belum terdaftar' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Berhasil keluar dari course' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unenroll error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}