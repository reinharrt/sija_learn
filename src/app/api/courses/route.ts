// ============================================
// src/app/api/courses/route.ts
// Courses API - List and create courses
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { getCourses, createCourse } from '@/models/Course';
import { findUserById } from '@/models/User';
import { UserRole } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const published = searchParams.get('published');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    const skip = (page - 1) * limit;

    const filters: any = {};
    if (published === 'true') {
      filters.published = true;
    }
    if (search) {
      filters.search = search;
    }

    let { courses, total } = await getCourses(filters, skip, limit);

    // Filter by tag if provided
    if (tag) {
      courses = courses.filter(course => course.tags?.includes(tag));
      total = courses.length;
    }

    // Populate creator information
    const coursesWithCreators = await Promise.all(
      courses.map(async (course) => {
        if (course.creator) {
          const creator = await findUserById(course.creator.toString());
          if (creator) {
            const { password, ...creatorWithoutPassword } = creator;
            return { ...course, creator: creatorWithoutPassword };
          }
        }
        return { ...course, creator: null };
      })
    );

    return NextResponse.json(
      {
        courses: coursesWithCreators,
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
    console.error('Get courses error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, description, thumbnail, tags, articles } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title dan description wajib diisi' },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const courseData = {
      title,
      slug,
      description,
      thumbnail: thumbnail || '',
      articles: articles?.map((id: string) => new ObjectId(id)) || [],
      creator: new ObjectId(user.id),
      tags: tags || [],
      published: false,
    };

    const courseId = await createCourse(courseData);

    return NextResponse.json(
      {
        message: 'Course berhasil dibuat',
        courseId: courseId.toString(),
        slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}