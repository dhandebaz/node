import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'placehold.co' }
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },
  async redirects() {
    return [
      {
        source: '/infrastructure',
        destination: '/node',
        permanent: true,
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Comprehensive tree-shaking and import optimization
    optimizePackageImports: [
      'lucide-react', 
      'date-fns', 
      'framer-motion',
      '@radix-ui/react-avatar',
      '@radix-ui/react-tabs',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      'clsx',
      'tailwind-merge'
    ],
  },
  serverExternalPackages: ['jspdf', 'fflate'],
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ]
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "dhandebaz-agency",
  project: "javascript-nextjs",
  tunnelRoute: "/monitoring",
  widenClientFileUpload: false,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: true,
  },
});
