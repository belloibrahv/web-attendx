import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Turbopack configuration
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
};

export default nextConfig;
