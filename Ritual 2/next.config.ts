import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    // Avisos de upgrade: solo por vulnerabilidades publicadas (es el valor por defecto, explícito).
    agentUpgrade: "security",
  },
};

export default nextConfig;
