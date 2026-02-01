// ============================================
// src/app/api/gamification/complete-course/route.ts
// API Route - Award XP and badges when completing a course
// FIXED: Using getUserFromRequest instead of getUserFromSession
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { completeCourse } from '@/lib/gamification';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { isCourseCompleted, markCourseCompleted } from '@/models/Enrollment';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID required' },
        { status: 400 }
      );
    }

    // Check if already completed
    const alreadyCompleted = await isCourseCompleted(user.id, courseId);
    if (alreadyCompleted) {
      // User already completed this course, do not award XP again
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        xpGained: 0,
        leveledUp: false,
        newBadges: []
      });
    }

    // Get course details from database
    const db = await getDatabase();
    const coursesCollection = db.collection('courses');
    const course = await coursesCollection.findOne({
      _id: new ObjectId(courseId)
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Mark as completed in enrollment FIRST to prevent race conditions
    // (though strictly speaking we should transaction this, but for now this is better than nothing)
    const marked = await markCourseCompleted(user.id, courseId);
    if (!marked) {
      // If we failed to mark it, it might mean they aren't enrolled
      // OR it was just marked by another request.
      // Let's double check enrollment
      return NextResponse.json(
        { error: 'Enrollment not found or update failed' },
        { status: 400 }
      );
    }

    // Default difficulty if not set
    const difficulty = (course as any).difficulty || 'beginner';
    const articleCount = course.articles?.length || 1;

    // Award XP and check badges
    const result = await completeCourse(
      user.id,
      courseId,
      difficulty,
      articleCount
    );

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error completing course:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process completion' },
      { status: 500 }
    );
  }
}