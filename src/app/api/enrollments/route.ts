// src/app/api/enrollments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

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
    const enrollmentCollection = db.collection('enrollments');
    const coursesCollection = db.collection('courses');

    const enrollments = await enrollmentCollection
      .find({ userId: new ObjectId(user.id) })
      .toArray();

    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await coursesCollection.findOne({
          _id: enrollment.courseId
        });

        return {
          _id: enrollment._id,
          courseId: enrollment.courseId.toString(),
          course: course ? {
            _id: course._id,
            title: course.title,
            slug: course.slug,
            description: course.description,
            thumbnail: course.thumbnail,
            tags: course.tags,
            articles: course.articles
          } : null,
          enrolledAt: enrollment.enrolledAt,
          progress: {
            completedArticles: enrollment.progress?.completedArticles || [],
            lastAccessedAt: enrollment.progress?.lastAccessedAt || enrollment.enrolledAt
          }
        };
      })
    );

    return NextResponse.json({
      enrollments: enrollmentsWithCourses
    }, { status: 200 });
  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Enrollment request received');

    const user = getUserFromRequest(request);
    if (!user) {
      console.log('Unauthorized - no user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('User authenticated:', user.id);

    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { courseId } = body;

    if (!courseId) {
      console.log('No courseId provided');
      return NextResponse.json(
        { error: 'Course ID wajib diisi' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(courseId)) {
      console.log('Invalid courseId format:', courseId);
      return NextResponse.json(
        { error: 'Format Course ID tidak valid' },
        { status: 400 }
      );
    }
    console.log('Valid courseId:', courseId);

    const db = await getDatabase();
    const enrollmentCollection = db.collection('enrollments');
    const coursesCollection = db.collection('courses');

    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
    if (!course) {
      console.log('Course not found:', courseId);
      return NextResponse.json(
        { error: 'Course tidak ditemukan' },
        { status: 404 }
      );
    }
    console.log('Course found:', course.title);

    const creatorId = course.creator?.toString();
    const userId = user.id.toString();

    console.log('Creator ID:', creatorId);
    console.log('User ID:', userId);

    if (creatorId === userId) {
      console.log('User is creator of this course');
      return NextResponse.json(
        { error: 'Anda tidak dapat mendaftar di course yang Anda buat sendiri' },
        { status: 403 }
      );
    }

    const existingEnrollment = await enrollmentCollection.findOne({
      userId: new ObjectId(user.id),
      courseId: new ObjectId(courseId)
    });

    if (existingEnrollment) {
      console.log('Already enrolled');
      return NextResponse.json(
        { error: 'Anda sudah terdaftar di course ini' },
        { status: 400 }
      );
    }

    console.log('Creating enrollment...');
    const enrollment = {
      userId: new ObjectId(user.id),
      courseId: new ObjectId(courseId),
      enrolledAt: new Date(),
      progress: {
        completedArticles: [],
        lastAccessedAt: new Date()
      }
    };

    const insertResult = await enrollmentCollection.insertOne(enrollment);
    console.log('Enrollment created:', insertResult.insertedId);

    await coursesCollection.updateOne(
      { _id: new ObjectId(courseId) },
      { $inc: { enrolledCount: 1 } }
    );
    console.log('Enrolled count incremented');

    return NextResponse.json(
      {
        message: 'Berhasil mendaftar di course',
        enrollmentId: insertResult.insertedId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Enroll error:', error);
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan server',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}