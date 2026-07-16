import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site.config";
import { getPublishedPosts, getCategories, getPrintables } from "@/lib/queries";

const BASE_URL = `https://${siteConfig.domain}`;

// Generate at request time, NOT at build time. The blog/printable rows come from
// Supabase; a build-time prerender that lacks DB env would silently ship a
// sitemap with only the static routes (the bug that hid ~53 URLs). Rendering at
// runtime guarantees the DB env is present, so every post + printable is listed.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static/listing pages deliberately omit `lastModified`: setting it to the
  // request time (which never correlates with a real content change) trains
  // Google to distrust the whole sitemap's lastmod signal. Only pages with a
  // real DB timestamp (posts, printables) carry lastModified.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/blog`, changeFrequency: "daily", priority: 0.9 },
    ...(siteConfig.features.printables
      ? [{ url: `${BASE_URL}/free-printables`, changeFrequency: "weekly" as const, priority: 0.7 }]
      : []),
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}${siteConfig.author.url}`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/editorial-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/affiliate-disclosure`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/terms-of-use`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/disclaimer`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Audience hub pages
  const hubRoutes: MetadataRoute.Sitemap = siteConfig.audienceSegments.map(
    (seg) => ({
      url: `${BASE_URL}/${seg.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // Dynamic: posts, categories, printables, fall back to empty if DB not configured
  let postRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];
  let printableRoutes: MetadataRoute.Sitemap = [];

  try {
    const posts = await getPublishedPosts({ limit: 1000 });
    postRoutes = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    // Never silently swallow, a failure here drops every post from the sitemap.
    console.error("[sitemap] failed to load posts:", err);
  }

  try {
    const categories = await getCategories();
    categoryRoutes = categories.map((cat) => ({
      url: `${BASE_URL}/category/${cat.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[sitemap] failed to load categories:", err);
  }

  if (siteConfig.features.printables) {
    try {
      const printables = await getPrintables();
      printableRoutes = printables.map((p) => ({
        url: `${BASE_URL}/free-printables/${p.slug}`,
        lastModified: p.created_at,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    } catch (err) {
      console.error("[sitemap] failed to load printables:", err);
    }
  }

  return [
    ...staticRoutes,
    ...hubRoutes,
    ...postRoutes,
    ...categoryRoutes,
    ...printableRoutes,
  ];
}
