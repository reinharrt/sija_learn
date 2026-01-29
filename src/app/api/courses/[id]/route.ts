// ============================================
// src/app/api/courses/[id]/route.ts
// Course Detail API - Get, update, delete specific course
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { findCourseById, findCourseBySlug, updateCourse, deleteCourse } from '@/models/Course';
import { findUserById } from '@/models/User';
import { UserRole } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let course;
    if (ObjectId.isValid(id)) {
      course = await findCourseById(id);
    } else {
      course = await findCourseBySlug(id);
    }

    if (!course) {
      return NextResponse.json(
        { error: 'Course tidak ditemukan' },
        { status: 404 }
      );
    }

    // Populate creator information
    if (course.creator) {
      const creator = await findUserById(course.creator.toString());
      if (creator) {
        const { password, ...creatorWithoutPassword } = creator;
        course = { ...course, creator: creatorWithoutPassword };
      }
    }

    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    console.error('Get course error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!hasPermission(user.role, UserRole.COURSE_ADMIN)) {
      return NextResponse.json(
        { error: 'Forbidden: Course Admin required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const updates = await request.json();

    delete updates._id;
    delete updates.creator;
    delete updates.enrolledCount;
    delete updates.createdAt;

    if (updates.articles) {
      updates.articles = updates.articles.map((aid: string) => new ObjectId(aid));
    }

    const success = await updateCourse(id, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Course tidak ditemukan atau gagal diubah' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Course berhasil diubah' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!hasPermission(user.role, UserRole.COURSE_ADMIN)) {
      return NextResponse.json(
        { error: 'Forbidden: Course Admin required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const success = await deleteCourse(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Course tidak ditemukan atau gagal dihapus' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Course berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}