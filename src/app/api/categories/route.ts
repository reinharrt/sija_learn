// src/app/api/categories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { UserRole } from '@/types';
import {
  getCategories,
  getPopularCategories,
  searchCategories,
  createCategory,
} from '@/models/Category';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const action = searchParams.get('action');
    const query = searchParams.get('query') || searchParams.get('q');
    const populate = searchParams.get('populate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (action === 'search' && query) {
      const categories = await searchCategories(query, limit);
      return NextResponse.json({ categories });
    }

    if (action === 'popular') {
      const categories = await getPopularCategories(limit);
      return NextResponse.json({ categories });
    }

    const skip = (page - 1) * limit;
    const filters: any = {};

    if (query) {
      filters.search = query;
    }

    const minUsage = searchParams.get('minUsage');
    if (minUsage) {
      filters.minUsage = parseInt(minUsage);
    }

    const { categories, total } = await getCategories(filters, skip, limit);

    if (populate === 'creator' && categories.length > 0) {
      const db = await getDatabase();
      const usersCollection = db.collection('users');

      const creatorIds = [...new Set(
        categories
          .filter(cat => cat.createdBy)
          .map(cat => cat.createdBy.toString())
      )];

      if (creatorIds.length > 0) {
        const creators = await usersCollection
          .find({
            _id: { $in: creatorIds.map(id => new ObjectId(id)) }
          })
          .project({ name: 1, email: 1 })
          .toArray();

        const creatorMap = new Map(
          creators.map(c => [c._id.toString(), c])
        );

        const categoriesWithCreators = categories.map(cat => ({
          ...cat,
          createdBy: cat.createdBy
            ? creatorMap.get(cat.createdBy.toString()) || null
            : null
        }));

        return NextResponse.json({
          categories: categoriesWithCreators,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      }
    }

    return NextResponse.json({
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    if (!hasPermission(user.role, UserRole.WRITER)) {
      return NextResponse.json(
        { error: 'Forbidden - Writers only' },
        { status: 403 }
      );
    }

    const { name, description, icon, color } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Category name wajib diisi' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Category name minimal 2 karakter' },
        { status: 400 }
      );
    }

    if (trimmedName.length > 50) {
      return NextResponse.json(
        { error: 'Category name maksimal 50 karakter' },
        { status: 400 }
      );
    }

    const categoryId = await createCategory(name, user.id, {
      description,
      icon,
      color
    });

    return NextResponse.json({
      message: 'Category berhasil dibuat',
      categoryId: categoryId.toString(),
      slug: trimmedName.toLowerCase().replace(/\s+/g, '-')
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat category' },
      { status: 500 }
    );
  }
}