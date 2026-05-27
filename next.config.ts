import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict React checks in dev to surface bugs early
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
    const securityHeaders = [
      // Prevent clickjacking (allow framing only by same origin so Farcaster
      // mini-app embeds via /.well-known still work via the Frame meta path)
      { key: "X-Frame-Options", value: "SAMEORIGIN" },

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
};

export default nextConfig;
