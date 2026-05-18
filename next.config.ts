import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"], // serve avif/webp for smaller sizes
    minimumCacheTTL: 60 * 60 * 24 * 7,   // cache optimised images for 7 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@supabase/supabase-js"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // strip console.log in prod
  },
  poweredByHeader: false, // remove X-Powered-By header
  compress: true,         // enable gzip compression
};

export default nextConfig;
