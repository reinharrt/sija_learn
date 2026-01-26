import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';
import { findCourseById, findCourseBySlug, updateCourse, deleteCourse, addArticleToCourse, removeArticleFromCourse } from '@/models/Course';
import { UserRole } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let course;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
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

    const { id } = await params;
    const course = await findCourseById(id);

    if (!course) {
      return NextResponse.json(
        { error: 'Course tidak ditemukan' },
        { status: 404 }
      );
    }

    const isCreator = course.creator.toString() === user.id;
    const isAdmin = hasPermission(user.role, UserRole.ADMIN);

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Anda tidak memiliki akses untuk mengubah course ini' },
        { status: 403 }
      );
    }

    const updates = await request.json();
    
    if (updates.title) {
      updates.slug = generateSlug(updates.title);
    }

    const success = await updateCourse(id, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Gagal mengubah course' },
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

    const { id } = await params;
    const course = await findCourseById(id);

    if (!course) {
      return NextResponse.json(
        { error: 'Course tidak ditemukan' },
        { status: 404 }
      );
    }

    const isCreator = course.creator.toString() === user.id;
    const isAdmin = hasPermission(user.role, UserRole.ADMIN);

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Anda tidak memiliki akses untuk menghapus course ini' },
        { status: 403 }
      );
    }

    const success = await deleteCourse(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Gagal menghapus course' },
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

export async function PATCH(
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
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { action, articleId } = await request.json();

    if (action === 'add-article' && articleId) {
      const success = await addArticleToCourse(id, articleId);
      return NextResponse.json(
        { message: success ? 'Artikel ditambahkan' : 'Gagal menambahkan artikel' },
        { status: success ? 200 : 400 }
      );
    }

    if (action === 'remove-article' && articleId) {
      const success = await removeArticleFromCourse(id, articleId);
      return NextResponse.json(
        { message: success ? 'Artikel dihapus' : 'Gagal menghapus artikel' },
        { status: success ? 200 : 400 }
      );
    }

    return NextResponse.json(
      { error: 'Action tidak valid' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Course action error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}