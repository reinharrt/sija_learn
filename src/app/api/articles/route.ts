// src/app/api/articles/route.ts




import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';
import { createArticle, getArticles } from '@/models/Article';
import { updateEntityTags } from '@/models/Tag';
import { UserRole, ArticleCategory } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as ArticleCategory | null;
    const author = searchParams.get('author');
    const published = searchParams.get('published');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const filters: any = {};
    if (category) filters.category = category;
    if (author) filters.author = author;
    if (published !== null) filters.published = published === 'true';
    if (search) filters.search = search;

    const { articles, total } = await getArticles(filters, skip, limit);

    return NextResponse.json(
      {
        articles,
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
    console.error('Get articles error:', error);
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

    if (!hasPermission(user.role, UserRole.WRITER)) {
      return NextResponse.json(
        { error: 'Forbidden: Anda tidak memiliki akses untuk membuat artikel' },
        { status: 403 }
      );
    }

    const { title, description, banner, category, type, blocks, tags, published } = await request.json();

    if (!title || !description || !category || !blocks) {
      return NextResponse.json(
        { error: 'Semua field wajib harus diisi' },
        { status: 400 }
      );
    }

    const slug = generateSlug(title);

    const articleId = await createArticle({
      title,
      slug,
      description,
      banner,
      category,
      type,
      blocks,
      author: new ObjectId(user.id),
      tags: [],
      published: published || false,
    });


    if (tags && Array.isArray(tags) && tags.length > 0) {
      await updateEntityTags('article', articleId.toString(), tags, user.id);
    }

    return NextResponse.json(
      {
        message: 'Artikel berhasil dibuat',
        articleId: articleId.toString(),
        slug
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create article error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}