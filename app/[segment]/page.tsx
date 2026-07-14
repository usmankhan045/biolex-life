import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site.config";
import { segmentIntros } from "@/content/segment-intros";
import { getPublishedPosts, type Post } from "@/lib/queries";
import {
  Container, Tag, Card, CardTitle, CardBody, SectionDivider,
} from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema";
import { ogImages, twitterImages } from "@/lib/metadata";
import { cn } from "@/lib/utils";

// Only the slugs in siteConfig are valid, anything else returns 404.
export const dynamicParams = false;

// ISR: regenerate at runtime so the hub's audience-tagged posts render even when
// the build environment lacks DB access (otherwise the page ships empty at build).
export const revalidate = 3600;

export function generateStaticParams() {
  return siteConfig.audienceSegments.map((seg) => ({ segment: seg.slug }));
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>;
}): Promise<Metadata> {
  const { segment: slug } = await params;
  const seg = siteConfig.audienceSegments.find((s) => s.slug === slug);
  const intro = segmentIntros[slug];
  if (!seg) return {};
  const title = seg.label;
  const description = intro?.metaDescription ?? seg.headline;
  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title,
      description,
      url: `/${slug}`,
      type: "website",
      images: ogImages(),
    },
    twitter: twitterImages(),
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full focus-visible:outline-none">
      <Card
        className={cn(
          "h-full flex flex-col",
          "transition duration-200",
          "group-hover:shadow-md group-hover:-translate-y-0.5",
          "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
        )}
      >
        {post.categories && (
          <Tag variant="default" className="mb-3 self-start">
            {post.categories.name}
          </Tag>
        )}
        <CardTitle
          as="h3"
          className="text-base leading-snug mb-2 line-clamp-3 group-hover:text-primary transition-colors"
        >
          {post.title}
        </CardTitle>
        {post.excerpt && (
          <CardBody className="flex-1 line-clamp-3 text-sm">
            {post.excerpt}
          </CardBody>
        )}
        <p className="mt-4 text-xs font-mono text-primary font-medium tracking-wide uppercase">
          Read →
        </p>
      </Card>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SegmentHubPage({
  params,
}: {
  params: Promise<{ segment: string }>;
}) {
  const { segment: slug } = await params;

  const seg = siteConfig.audienceSegments.find((s) => s.slug === slug);
  if (!seg) notFound();

  const intro = segmentIntros[slug];
  const showResources = slug === "resources";

  let posts: Post[] = [];
  try {
    posts = await getPublishedPosts({ audienceTag: seg.tag, limit: 6 });
    // Backfill thin hubs: some audiences have few tagged posts, which would
    // leave the hub with just 1 card. Top up with recent general guides (de-duped).
    // Rotate the pool by a per-segment offset so each thin hub surfaces a
    // DIFFERENT subset instead of every hub recycling the same top posts.
    if (posts.length < 6) {
      const seen = new Set(posts.map((p) => p.slug));
      const pool = await getPublishedPosts({ limit: 30 });
      const segIndex = Math.max(
        0,
        siteConfig.audienceSegments.findIndex((s) => s.slug === slug)
      );
      const off = pool.length ? (segIndex * 5) % pool.length : 0;
      const rotated = pool.slice(off).concat(pool.slice(0, off));
      for (const p of rotated) {
        if (posts.length >= 6) break;
        if (!seen.has(p.slug)) {
          seen.add(p.slug);
          posts.push(p);
        }
      }
    }
  } catch {}

  // "Start with these" = the first real posts (never a dead /blog link); the
  // remainder feed the "More guides" grid so nothing is shown twice.
  const startPosts = posts.slice(0, 3);
  const latestPosts = posts.slice(3);

  return (
    <main className="flex-1">
      <JsonLd data={[
        breadcrumbSchema([
          { name: "Home", slug: "/" },
          { name: seg.label, slug: `/${slug}` },
        ]),
        collectionPageSchema({
          name: `${seg.label} Guides`,
          description: intro.metaDescription,
          slug,
        }),
      ]} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-background pt-10 pb-12"
        aria-labelledby="hub-heading"
      >
        <Container width="narrow">
          <Tag variant="primary" className="mb-5">{seg.label}</Tag>
          <h1
            id="hub-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight mb-5"
          >
            {seg.headline}
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            {intro.paragraphs[0]}
          </p>
          <p className="mt-5 text-xs font-mono text-muted/60 uppercase tracking-wide">
            {siteConfig.name} Editorial
          </p>
        </Container>
      </section>

      {/* ── Remaining intro copy ─────────────────────────────────────────── */}
      {intro.paragraphs.length > 1 && (
        <section className="py-12 sm:py-14" aria-label="Introduction">
          <Container width="narrow">
            <div className="space-y-5 text-text/85 leading-relaxed">
              {intro.paragraphs.slice(1).map((para, i) => (
                <p key={i} className="text-base sm:text-lg">
                  {para}
                </p>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Where to start, 3 quick links ──────────────────────────────── */}
      <section
        className="py-14 sm:py-16 bg-primary/[0.03]"
        aria-labelledby="quick-links-heading"
      >
        <Container>
          <SectionDivider variant="titled" label="Where to start" spacing="sm" />
          <h2
            id="quick-links-heading"
            className="font-display text-3xl font-bold text-text mt-8 mb-8"
          >
            Start with these
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {startPosts.length > 0
              ? startPosts.map((post) => <PostCard key={post.id} post={post} />)
              : intro.quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="group block focus-visible:outline-none"
                  >
                    <Card
                      className={cn(
                        "h-full flex flex-col gap-3",
                        "transition duration-200",
                        "group-hover:shadow-md group-hover:-translate-y-0.5",
                        "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
                      )}
                    >
                      <p className="font-display text-base font-semibold text-text leading-snug">
                        {link.label}
                      </p>
                      <p className="text-sm text-muted leading-relaxed flex-1">
                        {link.description}
                      </p>
                      <p className="text-xs font-mono text-primary font-medium tracking-wide uppercase">
                        Read →
                      </p>
                    </Card>
                  </Link>
                ))}
          </div>
        </Container>
      </section>

      {/* ── Featured posts ───────────────────────────────────────────────── */}
      <section
        className="py-14 sm:py-16"
        aria-labelledby="posts-heading"
      >
        <Container>
          <SectionDivider variant="titled" label="Latest guides" spacing="sm" />
          <div className="flex items-baseline justify-between gap-4 mt-8 mb-10 flex-wrap">
            <h2
              id="posts-heading"
              className="font-display text-3xl font-bold text-text"
            >
              {seg.label} guides
            </h2>
            <Link
              href="/blog"
              className="text-sm text-primary font-medium hover:underline underline-offset-4 shrink-0"
            >
              View all →
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-xl font-semibold text-text mb-2">
                More content coming soon
              </p>
              <p className="text-muted text-sm">
                We&rsquo;re adding new {seg.label.toLowerCase()} guides regularly.
                Check back soon, or browse the full blog.
              </p>
            </div>
          ) : latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-muted">
              Looking for more?{" "}
              <Link
                href="/blog"
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                Browse the full blog →
              </Link>
            </p>
          )}
        </Container>
      </section>

      {/* ── Resources (shown only for a "resources" segment) ────────────── */}
      {showResources && (
        <section
          className="py-14 sm:py-16 bg-primary/[0.03]"
          aria-labelledby="resources-heading"
        >
          <Container width="narrow">
            <SectionDivider variant="titled" label="Resources" spacing="sm" />
            <h2
              id="resources-heading"
              className="font-display text-3xl font-bold text-text mt-8 mb-3"
            >
              Helpful resources
            </h2>
            <p className="text-muted mb-8">
              A few trusted places to turn to for more help on this topic. Add your
              own recommended links here.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                {
                  name: "Resource One",
                  href: "https://www.example.com",
                  description:
                    "A short description of this resource and how it can help. Replace this placeholder with a genuinely useful link for your niche.",
                },
                {
                  name: "Resource Two",
                  href: "https://www.example.com",
                  description:
                    "A short description of this resource and how it can help. Replace this placeholder with a genuinely useful link for your niche.",
                },
                {
                  name: "Resource Three",
                  href: "https://www.example.com",
                  description:
                    "A short description of this resource and how it can help. Replace this placeholder with a genuinely useful link for your niche.",
                },
                {
                  name: "Resource Four",
                  href: "https://www.example.com",
                  description:
                    "A short description of this resource and how it can help. Replace this placeholder with a genuinely useful link for your niche.",
                },
                {
                  name: "Resource Five",
                  href: "https://www.example.com",
                  description:
                    "A short description of this resource and how it can help. Replace this placeholder with a genuinely useful link for your niche.",
                },
                {
                  name: "Resource Six",
                  href: "https://www.example.com",
                  description:
                    "A short description of this resource and how it can help. Replace this placeholder with a genuinely useful link for your niche.",
                },
              ] as const).map((resource) => (
                <a
                  key={resource.name}
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block focus-visible:outline-none"
                >
                  <Card
                    className={cn(
                      "h-full flex flex-col gap-2",
                      "transition duration-200",
                      "group-hover:shadow-md group-hover:-translate-y-0.5",
                      "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
                    )}
                  >
                    <p className="font-display text-base font-semibold text-text group-hover:text-primary transition-colors">
                      {resource.name}
                    </p>
                    <p className="text-sm text-muted leading-relaxed flex-1">
                      {resource.description}
                    </p>
                    <p className="text-xs font-mono text-primary/70 font-medium tracking-wide uppercase mt-2">
                      Visit site →
                    </p>
                  </Card>
                </a>
              ))}
            </div>
          </Container>
        </section>
      )}

    </main>
  );
}
