/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'localhost',
      'api.travelplatform.com',
      'tramps-aviation-backend.onrender.com',
    ],
  },
}

module.exports = nextConfig