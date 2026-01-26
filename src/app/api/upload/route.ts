import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
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

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${ext}`;

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

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

    // Return URL
    const url = `/uploads/${filename}`;

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
export const config = {
  api: {
    bodyParser: false,
  },
};