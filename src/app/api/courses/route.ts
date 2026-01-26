import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';
import { createCourse, getCourses } from '@/models/Course';
import { UserRole } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');
    const published = searchParams.get('published');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const filters: any = {};
    if (creator) filters.creator = creator;
    if (published !== null) filters.published = published === 'true';
    if (search) filters.search = search;

    const { courses, total } = await getCourses(filters, skip, limit);

    return NextResponse.json(
      {
        courses,
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
        { error: 'Forbidden: Anda tidak memiliki akses untuk membuat course' },
        { status: 403 }
      );
    }

    const { title, description, thumbnail, articles, published } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title dan description wajib diisi' },
        { status: 400 }
      );
    }

    const slug = generateSlug(title);

    const articleIds = articles ? articles.map((id: string) => new ObjectId(id)) : [];

    const courseId = await createCourse({
      title,
      slug,
      description,
      thumbnail,
      articles: articleIds,
      creator: new ObjectId(user.id),
      published: published || false,
    });

    return NextResponse.json(
      { 
        message: 'Course berhasil dibuat',
        courseId: courseId.toString(),
        slug 
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
