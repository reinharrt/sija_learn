// src/app/api/serve-upload/[...path]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: paramsPath } = await params;
        const filePath = path.join(
            process.cwd(),
            'public',
            'uploads',
            ...paramsPath
        );

        if (!existsSync(filePath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        const file = await readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();

        const contentTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
        };

        return new NextResponse(file, {
            headers: {
                'Content-Type': contentTypes[ext] || 'application/octet-stream',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Serve upload error:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
