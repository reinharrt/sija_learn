// ============================================
// src/app/api/enrollments/[courseId]/progress/route.ts
// Progress Tracking API - Mark article as completed
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/enrollments/[courseId]/progress - Mark article as completed
export async function POST(
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
    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('sija-learn');

    // Check if enrollment exists
    const enrollment = await db.collection('enrollments').findOne({
      userId: new ObjectId(user.id),
      courseId: new ObjectId(courseId),
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 404 }
      );
    }

    // Add article to completedArticles if not already there
    await db.collection('enrollments').updateOne(
      {
        userId: new ObjectId(user.id),
        courseId: new ObjectId(courseId),
      },
      {
        $addToSet: {
          'progress.completedArticles': new ObjectId(articleId),
        },
        $set: {
          'progress.lastAccessedAt': new Date(),
        },
      }
    );

    // Get updated enrollment
    const updatedEnrollment = await db.collection('enrollments').findOne({
      userId: new ObjectId(user.id),
      courseId: new ObjectId(courseId),
    });

    // Get course
    const course = await db.collection('courses').findOne({
      _id: new ObjectId(courseId),
    });

    const totalArticles = course?.articles?.length || 0;
    const completedCount = updatedEnrollment?.progress?.completedArticles?.length || 0;
    const progressPercentage = totalArticles > 0 
      ? Math.round((completedCount / totalArticles) * 100) 
      : 0;

    return NextResponse.json({
      message: 'Article marked as completed',
      progress: {
        completed: completedCount,
        total: totalArticles,
        percentage: progressPercentage,
        completedArticles: updatedEnrollment?.progress?.completedArticles || [],
      },
    });
  } catch (error) {
    console.error('Mark progress error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// GET /api/enrollments/[courseId]/progress - Get progress details
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

    const client = await clientPromise;
    const db = client.db('sija-learn');

    const enrollment = await db.collection('enrollments').findOne({
      userId: new ObjectId(user.id),
      courseId: new ObjectId(courseId),
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 404 }
      );
    }

    const course = await db.collection('courses').findOne({
      _id: new ObjectId(courseId),
    });

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
      },
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}