import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Enable standalone output for Docker deployment
    output: 'standalone',
    
    // Disable static optimization for authenticated routes
    // This prevents build-time errors when Clerk keys are not available
    experimental: {
        // Optimize package imports
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },
};

export default nextConfig;
