import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    // Pour les Server Components, exclure mysql2 du bundling
    serverExternalPackages: ['mysql2'],
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
