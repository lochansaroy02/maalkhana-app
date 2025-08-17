
/** @type {import('next').NextConfig} */


const nextConfig = {
  assetPrefix: '',
  basePath: '',
  images: {
    domains: ["res.cloudinary.com"],
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
