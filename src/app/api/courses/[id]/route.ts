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

    // Validate difficulty if provided
    if (updates.difficulty && !['beginner', 'intermediate', 'advanced'].includes(updates.difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level. Must be: beginner, intermediate, or advanced' },
        { status: 400 }
      );
    }

    // Validate xpReward if provided
    if (updates.xpReward !== undefined && updates.xpReward !== null) {
      const xpValue = Number(updates.xpReward);
      if (isNaN(xpValue) || xpValue < 0) {
        return NextResponse.json(
          { error: 'Invalid XP reward. Must be a positive number' },
          { status: 400 }
        );
      }
      updates.xpReward = xpValue;
    }

    if (updates.articles) {
      updates.articles = updates.articles.map((aid: string) => new ObjectId(aid));
    }

    // Check if course is being published (status changing from false to true)
    const existingCourse = await findCourseById(id);
    const isBeingPublished = existingCourse &&
      !existingCourse.published &&
      updates.published === true;

    const success = await updateCourse(id, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Course tidak ditemukan atau gagal diubah' },
        { status: 400 }
      );
    }

    // Send notification emails if course was just published
    if (isBeingPublished && existingCourse) {
      // Import email functions
      const { getAllActiveSubscribers } = await import('@/models/Subscriber');
      const { sendNewCourseEmail } = await import('@/lib/email');

      try {
        const subscribers = await getAllActiveSubscribers();

        // Send emails to all subscribers (don't wait for completion)
        subscribers.forEach(async (subscriber) => {
          try {
            await sendNewCourseEmail(
              subscriber.email,
              existingCourse.title,
              existingCourse.description,
              existingCourse.slug,
              subscriber.unsubscribeToken
            );
          } catch (emailError) {
            console.error(`Failed to send course notification to ${subscriber.email}:`, emailError);
          }
        });

        console.log(`Course published: Sending notifications to ${subscribers.length} subscribers`);
      } catch (notificationError) {
        console.error('Error sending course notifications:', notificationError);
        // Don't fail the update if notifications fail
      }
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