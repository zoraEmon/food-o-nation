import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Disable source map devtools in development to prevent path resolution errors
  productionBrowserSourceMaps: false,
};

export default nextConfig;
