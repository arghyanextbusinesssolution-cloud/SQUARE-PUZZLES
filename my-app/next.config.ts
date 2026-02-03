import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Render (smaller deploy, single server.js)
  output: "standalone",

  // Allow images from external sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Strict mode for better development
  reactStrictMode: true,

  // Subdirectory/client routes: accept both /path and /path/ so direct links and refresh work
  skipTrailingSlashRedirect: true,

  // Experimental
  experimental: {
    optimizePackageImports: ["react-icons"],
  },
};

export default nextConfig;
