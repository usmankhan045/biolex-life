import type { NextConfig } from "next";

// Content-Security-Policy tuned for this app:
// - 'unsafe-inline' on script/style is required because the App Router emits
//   inline bootstrap scripts and we inject theme CSS + JSON-LD inline (no nonce
//   pipeline). frame-ancestors 'self' still blocks clickjacking.
// - img/frame allow same-origin + Supabase storage (remote images, PDF preview).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "frame-src 'self' https://*.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in a response header (minor info-disclosure).
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Allow same-origin SVG placeholders (e.g. /author.svg) to render through
    // next/image. Served as attachments with a locked-down CSP for safety.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Printables created remotely through HQ live in Supabase Storage rather than
  // in this repo. A `fallback` rewrite only runs when no static file matched, so
  // the printables committed under public/printables keep being served straight
  // from the CDN, and only the ones that aren't there fall through to storage.
  // Both end up at /printables/<slug>.pdf, so the split is invisible to visitors
  // and no printable ever needs a commit or a redeploy.
  async rewrites() {
    return {
      fallback: [
        {
          source: "/printables/:path*",
          destination:
            "https://ruucexzgebbehjcrinhj.supabase.co/storage/v1/object/public/printables/biolex/:path*",
        },
      ],
    };
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // The author archive slug moved from marlowe-hart -> muhammad-usman. The old
  // slug is already live and in the previously-crawled sitemap, so 301 it to the
  // new URL instead of letting it 404 and drop the author's link equity.
  async redirects() {
    return [
      {
        source: "/author/marlowe-hart",
        destination: "/author/muhammad-usman",
        permanent: true,
      },
      // Cannibalization merge: these two targeted the same intent with
      // near-identical H2 coverage (best art, size over sofa, colors, gallery
      // wall, printing and framing). Consolidated into the longer, more
      // complete post so one URL carries the signal instead of two competing.
      {
        source: "/blog/printable-wall-art-for-living-room",
        destination: "/blog/living-room-wall-art-printable",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
