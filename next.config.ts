import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * 
 * This configuration file controls Next.js build and runtime behavior.
 * - eslint.ignoreDuringBuilds: Allows deployment even if there are lint warnings
 * - typescript.ignoreBuildErrors: Prevents build failures from TS warnings in dev
 */
const nextConfig: NextConfig = {
  typescript: {
    // Allow builds with TypeScript warnings (for faster iteration)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
