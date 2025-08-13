/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: '', // Keep empty unless you have a CDN path
  basePath: '', // Keep empty if site is at root
  images: {
    domains: ["res.cloudinary.com"], // allow Cloudinary images
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore type errors on build
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors on build
  },
};

module.exports = nextConfig;
