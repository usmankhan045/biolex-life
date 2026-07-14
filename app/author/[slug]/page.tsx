import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts, type Post } from "@/lib/queries";
import { siteConfig } from "@/lib/site.config";
import {
  Container,
  Tag,
  Card,
  CardTitle,
  CardBody,
  SectionDivider,
} from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { profilePageSchema } from "@/lib/schema";
import { ogImages, twitterImages } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

// Single-author site — only the configured author slug is valid.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: siteConfig.author.slug }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== siteConfig.author.slug) return {};
  const title = `${siteConfig.author.name} — ${siteConfig.author.role}`;
  const description = siteConfig.author.shortBio;
  return {
    title,
    description,
    alternates: { canonical: siteConfig.author.url },
    openGraph: {
      title,
      description,
      url: siteConfig.author.url,
      type: "profile",
      images: ogImages(),
    },
    twitter: twitterImages(),
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== siteConfig.author.slug) notFound();

  let posts: Post[] = [];
  try {
    posts = await getPublishedPosts({ limit: 100 });
  } catch {
    // non-critical
  }

  return (
    <main className="flex-1">
      <JsonLd data={[profilePageSchema()]} />

      {/* ── Author header ──────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-background pt-10 pb-10"
        aria-labelledby="author-heading"
      >
        <Container width="narrow">
          <Tag variant="primary" className="mb-5">Author</Tag>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0 w-24 h-24 rounded-full border-2 border-primary/20 overflow-hidden relative">
              <Image
                src={siteConfig.author.photo}
                alt={`${siteConfig.author.name}, ${siteConfig.author.role} of ${siteConfig.name}`}
                fill
                sizes="96px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1
                id="author-heading"
                className="font-display text-3xl sm:text-4xl font-bold text-text leading-tight mb-2"
              >
                {siteConfig.author.name}
              </h1>
              <p className="text-sm font-mono uppercase tracking-wide text-muted/70 mb-4">
                {siteConfig.author.role} · {siteConfig.name}
              </p>
              <p className="text-base text-text/85 leading-relaxed">
                {siteConfig.author.longBio}
              </p>
              <p className="mt-4 text-sm text-muted">
                Read the full story on the{" "}
                <Link href="/about" className="text-primary font-medium hover:underline underline-offset-4">
                  About page
                </Link>
                .
              </p>
              {siteConfig.author.sameAs.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {siteConfig.author.sameAs.map((href) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
                    >
                      {href.includes("linkedin") ? "Connect on LinkedIn" : "Profile"} →
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Articles by this author ────────────────────────────────────────── */}
      <section className="py-12 sm:py-14" aria-labelledby="author-posts-heading">
        <Container>
          <SectionDivider variant="titled" label="Published guides" spacing="sm" />
          <h2
            id="author-posts-heading"
            className="font-display text-2xl sm:text-3xl font-bold text-text mt-8 mb-8"
          >
            Everything {siteConfig.author.name.split(" ")[0]} has written
          </h2>

          {posts.length === 0 ? (
            <p className="text-muted">Guides are coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block h-full focus-visible:outline-none"
                >
                  <Card
                    className={cn(
                      "h-full flex flex-col",
                      "transition-all duration-200",
                      "group-hover:shadow-md group-hover:-translate-y-0.5",
                      "group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2"
                    )}
                  >
                    {post.categories && (
                      <Tag variant="default" className="mb-3 self-start">
                        {post.categories.name}
                      </Tag>
                    )}
                    <CardTitle
                      as="p"
                      className="text-base leading-snug mb-2 line-clamp-3 group-hover:text-primary transition-colors"
                    >
                      {post.title}
                    </CardTitle>
                    {post.excerpt && (
                      <CardBody className="flex-1 line-clamp-3 text-sm">
                        {post.excerpt}
                      </CardBody>
                    )}
                    {post.published_at && (
                      <p className="mt-4 text-xs font-mono text-muted/60 uppercase tracking-wide">
                        {new Date(post.published_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
