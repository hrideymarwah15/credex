import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove X-Powered-By header for security and smaller response size
  poweredByHeader: false,

  // Enable gzip/brotli compression for smaller payloads
  compress: true,

  images: {
    // Modern image formats for smaller file sizes
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
