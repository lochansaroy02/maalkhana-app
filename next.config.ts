import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["res.cloudinary.com"], // Cloudinary ke liye allow
  },
};

// next.config.js 
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};


export default nextConfig;
