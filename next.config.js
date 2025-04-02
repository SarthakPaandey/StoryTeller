/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    },
  },
  images: {
    domains: ['images.unsplash.com', 'source.unsplash.com'],
  },
};

module.exports = nextConfig; 