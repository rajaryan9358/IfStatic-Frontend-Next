import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Set Turbopack root to the monorepo root so workspace-hoisted deps
  // (often symlinked) resolve correctly.
  turbopack: {
    root: path.resolve(__dirname, '..')
  }
};

export default nextConfig;
