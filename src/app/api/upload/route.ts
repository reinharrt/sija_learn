// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

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

    let folder = 'sija-learn/general';
    if (entityType && entityId) {
      const entityFolder = entityType === 'post' ? 'posts' :
        entityType === 'course' ? 'courses' : 'general';
      folder = `sija-learn/${entityFolder}/${entityId}`;
    } else if (type) {
      folder = `sija-learn/${type}`;
    }

    const transformation = type === 'banner'
      ? [
        { width: 1200, crop: 'limit' },
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
      : [
        { width: 800, crop: 'limit' },
        { quality: 'auto:good', fetch_format: 'auto' }
      ];

    const result = await uploadToCloudinary(buffer, {
      folder,
      transformation,
    });

    return NextResponse.json(
      {
        url: result.secure_url,
        message: 'Upload berhasil',
        size: result.bytes,
        originalSize: file.size,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
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
