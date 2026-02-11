// src/app/api/enrollments/[courseId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { Course, Enrollment } from '@/types';
import { ObjectId } from 'mongodb';

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
    const db = await getDatabase();

    const enrollmentCollection = db.collection<Enrollment>('enrollments');
    const coursesCollection = db.collection<Course>('courses');

    const course = await coursesCollection.findOne({
      _id: new ObjectId(courseId)
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course tidak ditemukan' },
        { status: 404 }
      );
    }

    if (course.creator?.toString() === user.id) {
      return NextResponse.json(
        {
          error: 'Anda adalah pembuat course ini',
          isCreator: true
        },
        { status: 403 }
      );
    }

    const enrollment = await enrollmentCollection.findOne({
      userId: new ObjectId(user.id),
      courseId: new ObjectId(courseId)
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Anda belum terdaftar di course ini' },
        { status: 404 }
      );
    }

    const totalArticles = course?.articles?.length || 0;
    const completedCount = enrollment.progress?.completedArticles?.length || 0;
    const progressPercentage = totalArticles > 0
      ? Math.round((completedCount / totalArticles) * 100)
      : 0;

    return NextResponse.json({
      progress: {
        completed: completedCount,
        total: totalArticles,
        percentage: progressPercentage,
        completedArticles: enrollment.progress?.completedArticles || [],
        lastAccessedAt: enrollment.progress?.lastAccessedAt,
        enrolledAt: enrollment.enrolledAt
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

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
    const db = await getDatabase();

    const enrollmentCollection = db.collection<Enrollment>('enrollments');
    const coursesCollection = db.collection<Course>('courses');

    // Check if course exists
    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
    if (!course) {
      return NextResponse.json(
        { error: 'Course tidak ditemukan' },
        { status: 404 }
      );
    }

    if (course.creator?.toString() === user.id) {
      return NextResponse.json(
        { error: 'Anda adalah pembuat course ini, tidak dapat keluar dari course sendiri' },
        { status: 403 }
      );
    }

    const result = await enrollmentCollection.deleteOne({
      userId: new ObjectId(user.id),
      courseId: new ObjectId(courseId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Gagal keluar dari course atau Anda belum terdaftar' },
        { status: 400 }
      );
    }

    await coursesCollection.updateOne(
      { _id: new ObjectId(courseId) },
      { $inc: { enrolledCount: -1 } }
    );

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