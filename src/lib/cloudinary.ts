// src/lib/cloudinary.ts

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    bytes: number;
}

/**
 * Upload image to Cloudinary
 * @param fileBuffer - File buffer to upload
 * @param options - Upload options
 * @returns Cloudinary upload result
 */
export async function uploadToCloudinary(
    fileBuffer: Buffer,
    options: {
        folder?: string;
        transformation?: any;
        resourceType?: 'image' | 'video' | 'raw' | 'auto';
    } = {}
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: options.folder || 'sija-learn',
                resource_type: options.resourceType || 'image',
                transformation: options.transformation || [
                    { quality: 'auto', fetch_format: 'auto' }
                ],
            },
            (error: any, result: any) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve(result as CloudinaryUploadResult);
                } else {
                    reject(new Error('Upload failed'));
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
}

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
}

/**
 * Get optimized image URL from Cloudinary
 * @param publicId - Public ID of the image
 * @param transformations - Cloudinary transformations
 */
export function getCloudinaryUrl(
    publicId: string,
    transformations?: any
): string {
    return cloudinary.url(publicId, {
        transformation: transformations || [
            { quality: 'auto', fetch_format: 'auto' }
        ],
    });
}

export default cloudinary;
