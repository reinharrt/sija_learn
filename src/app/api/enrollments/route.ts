// ============================================
// src/app/api/enrollments/route.ts
// Enrollments API - List enrollments and enroll to course
// FIXED: Correct type handling for courseMap
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { Course, User, Enrollment } from '@/types';
import { ObjectId } from 'mongodb';

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

    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const enrollmentCollection = db.collection<Enrollment>('enrollments');
    const coursesCollection = db.collection<Course>('courses');
    const usersCollection = db.collection<User>('users');
    
    const enrollments = await enrollmentCollection
      .find({ userId: new ObjectId(user.id) })
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await enrollmentCollection.countDocuments({ 
      userId: new ObjectId(user.id) 
    });

    // Get course IDs from enrollments
    const courseIds = enrollments.map((e: Enrollment) => e.courseId);
    
    const courses = await coursesCollection
      .find({ _id: { $in: courseIds } })
      .toArray();

    // Populate creator information
    const creatorIds = courses.map((c: Course) => c.creator).filter(Boolean);
    const creators = await usersCollection
      .find(
        { _id: { $in: creatorIds } },
        { projection: { password: 0 } }
      )
      .toArray();

    const creatorMap = new Map<string, User>(
      creators.map((creator: User) => [creator._id!.toString(), creator])
    );

    // Create course map with populated creators
    const courseMap = new Map<string, any>(
      courses.map((course: Course) => {
        const creator = creatorMap.get(course.creator.toString());
        return [
          course._id!.toString(),
          {
            ...course,
            creator: creator || null
          }
        ];
      })
    );

    // Return enrollments with populated course data
    const enrollmentsWithCourse = enrollments.map((enrollment: Enrollment) => ({
      _id: enrollment._id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt,
      progress: enrollment.progress,
      course: courseMap.get(enrollment.courseId.toString()) || null
    }));

    return NextResponse.json(
      {
        enrollments: enrollmentsWithCourse,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
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

// POST /api/enrollments - Enroll to a course
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID wajib diisi' },
        { status: 400 }
      );
    }

    const coursesCollection = db.collection<Course>('courses');
    const enrollmentCollection = db.collection<Enrollment>('enrollments');

    // Check if course exists
    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
    if (!course) {
      return NextResponse.json(
        { error: 'Course tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await enrollmentCollection.findOne({
      userId: new ObjectId(user.id),
      courseId: new ObjectId(courseId)
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Anda sudah terdaftar di course ini' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollmentData: Omit<Enrollment, '_id'> = {
      userId: new ObjectId(user.id),
      courseId: new ObjectId(courseId),
      enrolledAt: new Date(),
      progress: {
        completedArticles: [],
        lastAccessedAt: new Date()
      }
    };

    await enrollmentCollection.insertOne(enrollmentData as Enrollment);

    // Increment enrolled count
    await coursesCollection.updateOne(
      { _id: new ObjectId(courseId) },
      { $inc: { enrolledCount: 1 } }
    );

    return NextResponse.json(
      { message: 'Berhasil mendaftar ke course' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create enrollment error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}