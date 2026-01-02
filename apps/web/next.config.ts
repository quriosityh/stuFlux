/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Allow native Node modules in Server Components (e.g., 'pg')
  serverExternalPackages: ['pg'],

  // ✅ Type-safe routing (Next.js 14+)
  typedRoutes: true,

  // ✅ Enable React Compiler (Next.js 15+)
  reactCompiler: true,

  experimental: {
    // ✅ Optimize imports for popular libraries
    optimizePackageImports: ['lucide-react', 'clsx', 'react-hook-form'],
  },

  images: {
    // ✅ Whitelisted remote image sources
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.clerk.dev' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }, // Optional for GitHub avatars
    ],
    formats: ['image/avif', 'image/webp'], // ✅ Modern, efficient formats
  },

  compiler: {
    // ✅ Strip console logs only in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  poweredByHeader: false, // ✅ Hide “X-Powered-By: Next.js”
  reactStrictMode: true,  // ✅ Extra React checks in development

  async headers() {
    // ✅ Security headers applied globally
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

export default nextConfig;
