// src/app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { findUserById, updateUser, deleteUser } from '@/models/User';
import { UserRole } from '@/types';

export async function GET(
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
    const targetUser = await findUserById(id);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const isSelf = user.id === id;
    const isAdmin = hasPermission(user.role, UserRole.ADMIN);

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { password, ...userWithoutPassword } = targetUser;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('Get user error:', error);
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

    if (!hasPermission(user.role, UserRole.ADMIN)) {
      return NextResponse.json(
        { error: 'Forbidden: Admin only' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const updates = await request.json();

    delete updates._id;
    delete updates.password;
    delete updates.email;

    const success = await updateUser(id, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Gagal mengubah user' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'User berhasil diubah' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
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

    if (!hasPermission(user.role, UserRole.ADMIN)) {
      return NextResponse.json(
        { error: 'Forbidden: Admin only' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (user.id === id) {
      return NextResponse.json(
        { error: 'Tidak bisa menghapus akun sendiri' },
        { status: 400 }
      );
    }

    const success = await deleteUser(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Gagal menghapus user' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'User berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}