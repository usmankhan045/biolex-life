import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/site.config";
import { getSiteFonts } from "@/lib/fonts";
import { generateThemeCSS } from "@/lib/theme";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { websiteSchema, organizationSchema, personSchema } from "@/lib/schema";
import { getCategories } from "@/lib/queries";

const fonts = getSiteFonts();
const BASE_URL = `https://${siteConfig.domain}`;

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name}: ${siteConfig.niche}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  metadataBase: new URL(BASE_URL),
  alternates: { canonical: "/" },
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author.name, url: `${BASE_URL}${siteConfig.author.url}` }],
  creator: siteConfig.author.name,
  publisher: siteConfig.name,
  category: siteConfig.niche,
  // Broad favicon coverage: SVG for modern UAs, PNG for legacy + Apple touch.
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png" }],
  },
  keywords: [
    "free printables",
    "printable wall art",
    "coloring pages",
    "home organization printables",
    "kids printables",
    "meal planning printables",
    "instant download printables",
  ],
  openGraph: {
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name}: ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Drives the navbar "Categories" dropdown, all 5 pillars, in pillar order.
  // Falls back to [] if the DB is unconfigured.
  const CATEGORY_ORDER = [
    "printable-wall-art",
    "coloring-pages",
    "home-organization",
    "kids-printables",
    "meal-planning",
  ];
  let categories: { slug: string; name: string }[] = [];
  try {
    const all = (await getCategories()).map(({ slug, name }) => ({ slug, name }));
    const ordered = CATEGORY_ORDER
      .map((s) => all.find((c) => c.slug === s))
      .filter((c): c is { slug: string; name: string } => Boolean(c));
    const rest = all.filter((c) => !CATEGORY_ORDER.includes(c.slug));
    categories = [...ordered, ...rest];
  } catch {
    // DB not yet configured, render nav without the Categories dropdown
  }

  return (
    <html lang="en" className={`${fonts.variables} h-full`}>
      <head>
        {/* Inject theme CSS vars, change siteConfig.theme.colors to restyle the whole site */}
        <style dangerouslySetInnerHTML={{ __html: `:root { ${generateThemeCSS()} }` }} />
        {/* Machine-readable content license (RSL 1.0) for AI/LLM crawlers */}
        <link rel="license" href="/rsl.xml" type="application/rsl+xml" />
        <JsonLd data={[websiteSchema(), organizationSchema(), personSchema()]} />
      </head>
      <body className="flex flex-col min-h-full antialiased bg-background text-text">
        <Header categories={categories} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
