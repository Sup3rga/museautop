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

    async headers() {
        return [
            {
                source: "/_next/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
