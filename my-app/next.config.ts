import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from external sources
  images: {
    unoptimized: true, // Required for 'output: export'
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Strict mode for better development
  reactStrictMode: true,

  // Static export
  output: 'export',
  trailingSlash: true,

  // Subdirectory/client routes: accept both /path and /path/ so direct links and refresh work
  skipTrailingSlashRedirect: true,

  // Experimental
  experimental: {
    // optimizePackageImports: ["react-icons"],
  },
};

export default nextConfig;
