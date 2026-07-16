import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site.config";

// Web App Manifest (served at /manifest.webmanifest and auto-linked in <head>).
// Gives the site an installable identity, correct theme color, and app icons,
// a technical/PWA completeness signal Lighthouse and mobile crawlers check.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.brand.monogram,
    description: siteConfig.tagline,
    start_url: "/",
    display: "standalone",
    background_color: siteConfig.theme.colors.background,
    theme_color: siteConfig.theme.colors.primary,
    lang: "en-US",
    categories: ["lifestyle", "education", "productivity"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
