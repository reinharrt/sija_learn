// src/app/api/comments/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { findCommentById, updateComment, deleteComment } from '@/models/Comment';
import { UserRole } from '@/types';

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
    const comment = await findCommentById(id);

    if (!comment) {
      return NextResponse.json(
        { error: 'Komentar tidak ditemukan' },
        { status: 404 }
      );
    }

    const isOwner = comment.userId.toString() === user.id;
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Forbidden: Anda tidak memiliki akses untuk mengubah komentar ini' },
        { status: 403 }
      );
    }

    const { content } = await request.json();

    if (!content || content.trim().length < 3) {
      return NextResponse.json(
        { error: 'Komentar terlalu pendek' },
        { status: 400 }
      );
    }

    const success = await updateComment(id, content.trim());

    if (!success) {
      return NextResponse.json(
        { error: 'Gagal mengubah komentar' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Komentar berhasil diubah' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update comment error:', error);
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
    const comment = await findCommentById(id);

    if (!comment) {
      return NextResponse.json(
        { error: 'Komentar tidak ditemukan' },
        { status: 404 }
      );
    }

    const isOwner = comment.userId.toString() === user.id;
    const isAdmin = hasPermission(user.role, UserRole.ADMIN);

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Anda tidak memiliki akses untuk menghapus komentar ini' },
        { status: 403 }
      );
    }

    const success = await deleteComment(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Gagal menghapus komentar' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Komentar berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}