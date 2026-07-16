import { siteConfig } from "./site.config";

/**
 * Open Graph / Twitter image helpers. Next.js does NOT deep-merge `openGraph`
 * across segments, any route that defines its own `openGraph` REPLACES the
 * layout default, dropping the inherited image. So every route that sets
 * openGraph must supply images explicitly. These helpers keep that consistent.
 * Relative URLs resolve against `metadataBase` (set in app/layout.tsx).
 */
const DEFAULT_OG_IMAGE = "/og-default.jpg";

// Derive the MIME type from the file extension so og:image:type matches the
// actual asset (post covers are .png, the default is .jpg). A mismatched type
// is a real validation defect some scrapers reject.
function imageType(url: string): string {
  const u = url.split("?")[0].toLowerCase();
  if (u.endsWith(".png")) return "image/png";
  if (u.endsWith(".webp")) return "image/webp";
  if (u.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

export function ogImages(
  url: string | null | undefined = DEFAULT_OG_IMAGE,
  alt: string = `${siteConfig.name}: ${siteConfig.tagline}`
) {
  const resolved = url ?? DEFAULT_OG_IMAGE;
  return [
    {
      url: resolved,
      width: 1200,
      height: 630,
      alt,
      type: imageType(resolved),
    },
  ];
}

export function twitterImages(url: string | null | undefined = DEFAULT_OG_IMAGE) {
  return {
    card: "summary_large_image" as const,
    images: [url ?? DEFAULT_OG_IMAGE],
  };
}
