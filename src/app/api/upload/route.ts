// ============================================
// src/app/api/upload/route.ts
// Upload API - Handle file uploads organized by entity
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createHash } from 'crypto';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'banner' or 'content'
    const entityType = formData.get('entityType') as string; // 'post' or 'course'
    const entityId = formData.get('entityId') as string; // post ID or course ID

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File harus berupa gambar' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate MD5 hash for unique filename
    const hash = createHash('md5')
      .update(buffer)
      .update(Date.now().toString())
      .digest('hex');

    // Create organized folder structure based on entity
    // Structure: uploads/{entityType}/{entityId}/{type}/
    // Example: uploads/posts/post-123/banner/
    //          uploads/courses/course-456/content/

    let relativePath: string;

    if (entityType && entityId) {
      // Organized by entity
      const entityFolder = entityType === 'post' ? 'posts' :
        entityType === 'course' ? 'courses' : 'general';
      relativePath = path.join(entityFolder, entityId, type || 'images');
    } else {
      // Fallback to date-based organization if no entity info
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      relativePath = path.join('general', year.toString(), month, type || 'images');
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', relativePath);

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Filename: {md5hash}.jpg (always jpg after compression)
    const filename = `${hash}.jpg`;
    const filepath = path.join(uploadDir, filename);

    // Compress image based on type
    let processedBuffer: Buffer;

    if (type === 'banner') {
      // Banner: max width 1200px, quality 80
      processedBuffer = await sharp(buffer)
        .resize(1200, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();
    } else {
      // Content images: max width 800px, quality 85
      processedBuffer = await sharp(buffer)
        .resize(800, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    }

    // Save compressed image
    await writeFile(filepath, processedBuffer);

    // Return URL with organized path
    const url = `/uploads/${relativePath}/${filename}`.replace(/\\/g, '/');

    return NextResponse.json(
      {
        url,
        message: 'Upload berhasil',
        size: processedBuffer.length,
        originalSize: file.size
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Gagal upload gambar' },
      { status: 500 }
    );
  }
}

// Disable body parser for file uploads
export const dynamic = 'force-dynamic';