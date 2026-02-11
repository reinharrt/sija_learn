// src/app/api/comments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createComment, getCommentsByArticle } from '@/models/Comment';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId is required' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;
    const { comments, total } = await getCommentsByArticle(articleId, skip, limit);

    return NextResponse.json(
      {
        comments,
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
    console.error('Get comments error:', error);
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

    const { articleId, content } = await request.json();

    if (!articleId || !content) {
      return NextResponse.json(
        { error: 'articleId dan content harus diisi' },
        { status: 400 }
      );
    }

    if (content.trim().length < 3) {
      return NextResponse.json(
        { error: 'Komentar terlalu pendek' },
        { status: 400 }
      );
    }

    const commentId = await createComment({
      articleId: new ObjectId(articleId),
      userId: new ObjectId(user.id),
      content: content.trim(),
    });

    try {
      const { postComment } = await import('@/lib/gamification');
      await postComment(user.id);
    } catch (error) {
      console.error('Error updating gamification stats:', error);
    }

    return NextResponse.json(
      {
        message: 'Komentar berhasil dibuat',
        commentId: commentId.toString()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
