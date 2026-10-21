// Where the NestJS backend listens when both apps run in the same container
// (see scripts/render-start.js). The browser calls same-origin /api/v1 and
// Next.js proxies it here, so there is one public URL and no CORS.
// Read at build time (rewrites are baked into the build output).
const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:3001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Gzip here would buffer the proxied Lumen SSE stream; Render compresses at its edge.
  compress: false,
  experimental: {
    // AI endpoints (Gemini reports, Lumen streams) can exceed the 30s default.
    proxyTimeout: 120000,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  async rewrites() {
    return [
      { source: '/api/v1/:path*', destination: `${BACKEND_INTERNAL_URL}/api/v1/:path*` },
      { source: '/api/docs', destination: `${BACKEND_INTERNAL_URL}/api/docs` },
      { source: '/api/docs/:path*', destination: `${BACKEND_INTERNAL_URL}/api/docs/:path*` },
    ];
  },
  async redirects() {
    return [
      {
        source: '/sign-in',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/sign-up',
        destination: '/signup',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
