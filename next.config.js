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
    qualities: [75, 90, 100],
    localPatterns: [
      {
        pathname: '/**',
        search: '',
      },
    ],
  },
}

module.exports = nextConfig