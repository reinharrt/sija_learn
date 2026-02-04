/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Explicit quality settings untuk Next.js 16 compatibility
    qualities: [75, 90, 100],
    // Local patterns untuk query strings pada local images
    localPatterns: [
      {
        pathname: '/**',
        search: '',
      },
    ],
  },
  // Typed routes untuk type safety (sekarang stable!)
  // typedRoutes: true, // Uncomment jika ingin menggunakan typed routes
}

module.exports = nextConfig