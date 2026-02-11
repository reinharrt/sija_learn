// ============================================
// src/lib/image-utils.ts
// Image URL utilities for Cloudinary and local images
// ============================================

/**
 * Get the correct image URL for display
 * Supports both Cloudinary URLs and legacy local uploads
 * @param url - Image URL from database
 * @returns Processed URL ready for display
 */
export function getImageUrl(url: string | undefined): string {
    if (!url) return '';

    // If it's already a Cloudinary URL, return as-is
    if (url.startsWith('https://res.cloudinary.com') || url.startsWith('http://res.cloudinary.com')) {
        return url;
    }

    // If it's a local upload, use the serve-upload API
    if (url.startsWith('/uploads')) {
        return `/api/serve-upload${url.replace('/uploads', '')}`;
    }

    // For any other URL (external images, etc.), return as-is
    return url;
}

/**
 * Check if URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string | undefined): boolean {
    if (!url) return false;
    return url.startsWith('https://res.cloudinary.com') || url.startsWith('http://res.cloudinary.com');
}
