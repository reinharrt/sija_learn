import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';
import { findArticleById, findArticleBySlug, updateArticle, deleteArticle, incrementViews } from '@/models/Article';
import { deleteCommentsByArticle } from '@/models/Comment';
import { UserRole } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let article;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      article = await findArticleById(id);
    } else {
      article = await findArticleBySlug(id);
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Artikel tidak ditemukan' },
        { status: 404 }
      );
    }

    const shouldCount = request.nextUrl.searchParams.get('view') === 'true';
    if (shouldCount) {
      await incrementViews(article._id!.toString());
    }

    return NextResponse.json(article, { status: 200 });
  } catch (error) {
    console.error('Get article error:', error);
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
    const article = await findArticleById(id);

    if (!article) {
      return NextResponse.json(
        { error: 'Artikel tidak ditemukan' },
        { status: 404 }
      );
    }

    const isAuthor = article.author.toString() === user.id;
    const isAdmin = hasPermission(user.role, UserRole.ADMIN);

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Anda tidak memiliki akses untuk mengubah artikel ini' },
        { status: 403 }
      );
    }

    const updates = await request.json();
    
    if (updates.title) {
      updates.slug = generateSlug(updates.title);
    }

    const success = await updateArticle(id, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Gagal mengubah artikel' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Artikel berhasil diubah' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update article error:', error);
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
    const article = await findArticleById(id);

    if (!article) {
      return NextResponse.json(
        { error: 'Artikel tidak ditemukan' },
        { status: 404 }
      );
    }

    const isAuthor = article.author.toString() === user.id;
    const isAdmin = hasPermission(user.role, UserRole.ADMIN);

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Anda tidak memiliki akses untuk menghapus artikel ini' },
        { status: 403 }
      );
    }

    await deleteCommentsByArticle(id);
    const success = await deleteArticle(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Gagal menghapus artikel' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Artikel berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}