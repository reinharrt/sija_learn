// ============================================
// src/app/api/tags/route.ts
// Tags API - Search and manage tags WITH CREATOR POPULATION
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { UserRole } from '@/types';
import {
  getTags,
  getPopularTags,
  searchTags,
  createTag,
  getTagStats
} from '@/models/Tag';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/tags - Get all tags with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const action = searchParams.get('action');
    const query = searchParams.get('query') || searchParams.get('q');
    const category = searchParams.get('category');
    const minUsage = searchParams.get('minUsage');
    const populate = searchParams.get('populate'); // 🆕 NEW: populate creator
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Action: search (autocomplete)
    if (action === 'search' && query) {
      const tags = await searchTags(query, limit);
      return NextResponse.json({ tags });
    }
    
    // Action: popular
    if (action === 'popular') {
      const tags = await getPopularTags(limit);
      return NextResponse.json({ tags });
    }
    
    // Action: stats for specific tag
    const tagId = searchParams.get('tagId');
    if (action === 'stats' && tagId) {
      const stats = await getTagStats(tagId);
      return NextResponse.json({ stats });
    }
    
    // Default: Get all tags with filters
    const skip = (page - 1) * limit;
    const filters: any = {};
    
    if (query) {
      filters.search = query;
    }
    
    if (category && category !== 'all') {
      filters.category = category;
    }
    
    if (minUsage) {
      filters.minUsage = parseInt(minUsage);
    }
    
    const { tags, total } = await getTags(filters, skip, limit);
    
    // 🆕 NEW: Populate creator information if requested
    if (populate === 'creator' && tags.length > 0) {
      const db = await getDatabase();
      const usersCollection = db.collection('users');

      // Get unique creator IDs
      const creatorIds = [...new Set(
        tags
          .filter(tag => tag.createdBy)
          .map(tag => tag.createdBy.toString())
      )];

      if (creatorIds.length > 0) {
        // Fetch creators
        const creators = await usersCollection
          .find({ 
            _id: { $in: creatorIds.map(id => new ObjectId(id)) } 
          })
          .project({ name: 1, email: 1 }) // Only get name and email
          .toArray();

        // Create a map for quick lookup
        const creatorMap = new Map(
          creators.map(c => [c._id.toString(), c])
        );

        // Attach creator info to tags
        const tagsWithCreators = tags.map(tag => ({
          ...tag,
          createdBy: tag.createdBy 
            ? creatorMap.get(tag.createdBy.toString()) || null
            : null
        }));

        return NextResponse.json({
          tags: tagsWithCreators,
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
      tags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil tags' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create new tag
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }
    
    // Only writers and above can create tags manually
    if (!hasPermission(user.role, UserRole.WRITER)) {
      return NextResponse.json(
        { error: 'Forbidden - Writers only' },
        { status: 403 }
      );
    }
    
    const { name, description, category } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tag name wajib diisi' },
        { status: 400 }
      );
    }
    
    // Validate tag name
    const normalizedName = name.toLowerCase().trim();
    if (normalizedName.length < 2) {
      return NextResponse.json(
        { error: 'Tag name minimal 2 karakter' },
        { status: 400 }
      );
    }
    
    if (normalizedName.length > 50) {
      return NextResponse.json(
        { error: 'Tag name maksimal 50 karakter' },
        { status: 400 }
      );
    }
    
    // Create tag
    const tagId = await createTag(name, user.id, { description, category });
    
    return NextResponse.json({
      message: 'Tag berhasil dibuat',
      tagId: tagId.toString(),
      name: normalizedName
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Create tag error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat tag' },
      { status: 500 }
    );
  }
}