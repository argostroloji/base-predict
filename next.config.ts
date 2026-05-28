import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict React checks in dev to surface bugs early — build cache bust: 2026-05-28
  reactStrictMode: true,

  // Remove the "X-Powered-By: Next.js" header
  poweredByHeader: false,

  // Gzip / Brotli compression for responses
  compress: true,

  // Image optimization — allow OpenSea / Base / IPFS hosted images
  // (NFT metadata / OG previews may reference these domains)
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "i.seadn.io" },
      { protocol: "https", hostname: "openseauserdata.com" },
      { protocol: "https", hostname: "raw.seadn.io" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "*.ipfs.dweb.link" },
      { protocol: "https", hostname: "basepre.xyz" },
      // Vercel preview deployments — keep so PR previews still optimize images
      { protocol: "https", hostname: "base-predict-delta.vercel.app" },
      { protocol: "https", hostname: "*.vercel.app" },
    ],
    minimumCacheTTL: 60 * 60 * 24, // 24h cache for optimized images
  },

  // Security headers applied to every route
  async headers() {
    // Allowed frame ancestors — keeps clickjacking protection while letting
    // Farcaster / Warpcast / Base App host the site as a mini-app iframe.
    // `'self'` covers our own domain; the rest are the mini-app clients
    // documented at https://miniapps.farcaster.xyz/docs
    const frameAncestors = [
      "'self'",
      "https://farcaster.xyz",
      "https://*.farcaster.xyz",
      "https://warpcast.com",
      "https://*.warpcast.com",
      "https://*.base.org",
      "https://*.base.app",
    ].join(" ");

    const securityHeaders = [
      // Modern replacement for X-Frame-Options. X-Frame-Options can only
      // express 'self' or 'deny' and would block the Farcaster iframe.
      {
        key: "Content-Security-Policy",
        value: `frame-ancestors ${frameAncestors};`,
      },

      // Block MIME-type sniffing
      { key: "X-Content-Type-Options", value: "nosniff" },

      // Restrict referrer info leaked to third parties
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

      // Disable unused browser features
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },

      // Force HTTPS for 2 years on the apex domain
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },

      // DNS prefetch hint
      { key: "X-DNS-Prefetch-Control", value: "on" },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // OG / icon images live in /public — cache them aggressively
        source: "/:file(og-image|icon|logo|favicon).:ext(png|ico|svg|jpg|jpeg|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        // Farcaster mini-app manifest must be reachable & fresh
        source: "/.well-known/farcaster.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=300" },
        ],
      },
    ];
  },

  // 308 permanent redirect from the legacy Vercel domain to basepre.xyz.
  // The `has: host` matcher means this only fires when the incoming request's
  // Host header is the old domain — production traffic on basepre.xyz is
  // untouched, and PR/branch preview deployments (*-git-*.vercel.app, etc.)
  // are not affected because they have different hostnames.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "base-predict-delta.vercel.app",
          },
        ],
        destination: "https://basepre.xyz/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
