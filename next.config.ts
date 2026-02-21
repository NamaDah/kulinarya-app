import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  async rewrites() {
    return [
      // Proxy auth & sanctum routes to Laravel
      {
        source: "/sanctum/:path*",
        destination: "http://localhost:8000/sanctum/:path*",
      },
      {
        source: "/login",
        destination: "http://localhost:8000/login",
      },
      {
        source: "/register",
        destination: "http://localhost:8000/register",
      },
      {
        source: "/logout",
        destination: "http://localhost:8000/logout",
      },
      // Proxy API routes
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
