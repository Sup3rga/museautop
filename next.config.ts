import type { NextConfig } from "next";
function isDevMode(){
    return process.env.NODE_ENV == "development";
}

const nextConfig: NextConfig = {
    serverExternalPackages: ['mysql2'],
    rewrites: async () => {
        return isDevMode() ? [] : {
            beforeFiles: [
                {
                    source: "/",
                    destination: "/cmgr",
                    has:[{type: "host", value: "management.musautop.com"}]
                },
                {
                    source: "/favicon.png",
                    destination: "/favicon.png",
                },
                {
                    source: '/',
                    has: [{ type: 'host', value: 'management.musautop.com' }],
                    destination: '/cmgr',
                },
                {
                    source: '/:path((?!cmgr).*)',
                    has: [{ type: 'host', value: 'management.musautop.com' }],
                    destination: '/cmgr/:path*',
                },
            ]
        }
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
