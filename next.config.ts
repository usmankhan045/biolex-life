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
    ];
  },
};

export default nextConfig;
