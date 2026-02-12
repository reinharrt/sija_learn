// src/lib/image-utils.ts


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


export function isCloudinaryUrl(url: string | undefined): boolean {
    if (!url) return false;
    return url.startsWith('https://res.cloudinary.com') || url.startsWith('http://res.cloudinary.com');
}
