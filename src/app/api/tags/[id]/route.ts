// ============================================
// src/app/api/tags/[id]/route.ts
// Tag Detail API - Get, update, delete specific tag
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { UserRole } from '@/types';
import {
  findTagById,
  findTagBySlug,
  updateTag,
  deleteTag,
  getTagStats,
  getEntitiesByTag
} from '@/models/Tag';

// GET /api/tags/[id] - Get tag by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to find by ID first, then by slug
    let tag;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      tag = await findTagById(id);
    } else {
      tag = await findTagBySlug(id);
    }
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    // Get additional stats
    const stats = await getTagStats(tag._id!.toString());
    const entities = await getEntitiesByTag(tag.name);
    
    return NextResponse.json({
      tag,
      stats,
      entities: {
        articleCount: entities.articles.length,
        courseCount: entities.courses.length
      }
    });
    
  } catch (error) {
    console.error('Get tag error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag' },
      { status: 500 }
    );
  }
}

// PUT /api/tags/[id] - Update tag
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
    
    // Only admins can update tags
    if (!hasPermission(user.role, UserRole.ADMIN)) {
      return NextResponse.json(
        { error: 'Forbidden - Admins only' },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    const { description, category } = await request.json();
    
    // Note: We don't allow changing the tag name
    // as it would break references
    
    const updates: any = {};
    if (description !== undefined) updates.description = description;
    if (category) updates.category = category;
    
    const success = await updateTag(id, updates);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update tag' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: 'Tag updated successfully'
    });
    
  } catch (error) {
    console.error('Update tag error:', error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[id] - Delete tag
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
    
    // Only admins can delete tags
    if (!hasPermission(user.role, UserRole.ADMIN)) {
      return NextResponse.json(
        { error: 'Forbidden - Admins only' },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    
    try {
      const success = await deleteTag(id);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to delete tag' },
          { status: 400 }
        );
      }
      
      return NextResponse.json({
        message: 'Tag deleted successfully'
      });
      
    } catch (error: any) {
      if (error.message.includes('being used')) {
        return NextResponse.json(
          { error: 'Cannot delete tag that is being used' },
          { status: 400 }
        );
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Delete tag error:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}