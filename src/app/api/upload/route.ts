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
    const type = formData.get('type') as string;
    const entityType = formData.get('entityType') as string;
    const entityId = formData.get('entityId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File harus berupa gambar' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const hash = createHash('md5')
      .update(buffer)
      .update(Date.now().toString())
      .digest('hex');

    let relativePath: string;

    if (entityType && entityId) {
      const entityFolder = entityType === 'post' ? 'posts' :
        entityType === 'course' ? 'courses' : 'general';
      relativePath = path.join(entityFolder, entityId, type || 'images');
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      relativePath = path.join('general', year.toString(), month, type || 'images');
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', relativePath);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filename = `${hash}.jpg`;
    const filepath = path.join(uploadDir, filename);

    let processedBuffer: Buffer;

    if (type === 'banner') {
      processedBuffer = await sharp(buffer)
        .resize(1200, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();
    } else {
      processedBuffer = await sharp(buffer)
        .resize(800, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    }

    await writeFile(filepath, processedBuffer);

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

export const dynamic = 'force-dynamic';