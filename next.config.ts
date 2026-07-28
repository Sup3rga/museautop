import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    // Pour les Server Components, exclure mysql2 du bundling
    serverExternalPackages: ['mysql2'],
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals = [...(config.externals || []), 'mysql2', 'mysql2/promise'];
        }
        return config;
    },
    experimental: {
        serverExternalPackages: ['mysql', 'serverless-mysql', 'mysql2', 'mysql2/promise'],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
