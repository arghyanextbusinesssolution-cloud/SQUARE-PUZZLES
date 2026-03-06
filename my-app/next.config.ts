import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    // optimizePackageImports: ["react-icons"],
  },

  // Enable static export only when building for unified deployment (e.g., Hostinger)
  ...(process.env.NEXT_STATIC_EXPORT === 'true' ? { output: 'export', distDir: 'out' } : {}),
};

export default nextConfig;
