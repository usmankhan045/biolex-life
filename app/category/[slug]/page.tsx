import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getCategories,
  getCategoryBySlug,
  getPublishedPosts,
  getPublishedPostCount,
} from "@/lib/queries";
import {
  Container,
  Tag,
  Card,
  CardTitle,
  CardBody,
} from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import {
  breadcrumbSchema,
  collectionPageSchema,
  itemListSchema,
} from "@/lib/schema";
import { ogImages, twitterImages } from "@/lib/metadata";
import { siteConfig } from "@/lib/site.config";
import { categoryIntros } from "@/content/category-intros";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

const POSTS_PER_PAGE = 24;

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(
    1,
    parseInt(typeof pageParam === "string" ? pageParam : "1", 10) || 1
  );
  try {
    const category = await getCategoryBySlug(slug);
    if (!category) return {};
    // These archives are printable collections, not blog sections. Leading with
    // "Free ... Printables" matches how the query is actually typed and stops
    // spending a 60-char budget on the word "Blog".
    // Only append "Printables" when the category name does not already carry
    // the noun, so we get "Free Printable Wall Art" rather than the stuttering
    // "Free Printable Wall Art Printables".
    const baseTitle = /printable|pages/i.test(category.name)
      ? `Free ${category.name}`
      : `Free ${category.name} Printables`;
    const title =
      currentPage > 1 ? `${baseTitle}, page ${currentPage}` : baseTitle;
    const description =
      category.description ??
      `Browse all ${category.name} articles on ${siteConfig.name}.`;
    // Page 2+ canonicalizes to itself so its post links keep discovery value.
    const canonical =
      currentPage > 1
        ? `/category/${slug}?page=${currentPage}`
        : `/category/${slug}`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        type: "website",
        images: ogImages(),
      },
      twitter: twitterImages(),
    };
  } catch {
    return {};
  }
}

export default async function CategoryArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(
    1,
    parseInt(typeof pageParam === "string" ? pageParam : "1", 10) || 1
  );

  let category: Awaited<ReturnType<typeof getCategoryBySlug>>;
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  let total = 0;

  try {
    category = await getCategoryBySlug(slug);
  } catch {
    notFound();
  }
  if (!category) notFound();

  try {
    // Paginated, not capped. A fixed `limit` with no pagination silently
    // stranded every post past the cap in the largest categories, leaving them
    // reachable only through the blog pagination chain.
    [posts, total] = await Promise.all([
      getPublishedPosts({
        categoryId: category.id,
        limit: POSTS_PER_PAGE,
        offset: (currentPage - 1) * POSTS_PER_PAGE,
      }),
      getPublishedPostCount({ categoryId: category.id }),
    ]);
  } catch {
    // DB error, show empty state
  }

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const intro = categoryIntros[category.slug];

  return (
    <main className="flex-1">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", slug: "/" },
            { name: "Blog", slug: "/blog" },
            { name: category.name, slug: `/category/${category.slug}` },
          ]),
          collectionPageSchema({
            name: category.name,
            description:
              category.description ??
              `Browse all ${category.name} articles on ${siteConfig.name}.`,
            slug: `category/${category.slug}`,
          }),
          ...(posts.length
            ? [
                itemListSchema({
                  id:
                    currentPage > 1
                      ? `/category/${category.slug}?page=${currentPage}`
                      : `/category/${category.slug}`,
                  startPosition: (currentPage - 1) * POSTS_PER_PAGE + 1,
                  items: posts.map((p) => ({
                    url: `/blog/${p.slug}`,
                    name: p.title,
                  })),
                }),
              ]
            : []),
        ]}
      />
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-background pt-10 pb-10"
        aria-labelledby="category-heading"
      >
        <Container>
          {/* Visible breadcrumb trail */}
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-2 text-xs font-mono text-muted/60 uppercase tracking-wide flex-wrap">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li aria-hidden>/</li>
              <li className="text-muted" aria-current="page">{category.name}</li>
            </ol>
          </nav>

          <Tag variant="primary" className="mb-5">
            Category
          </Tag>
          <h1
            id="category-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight mb-5"
          >
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-muted leading-relaxed max-w-xl">
              {category.description}
            </p>
          )}
          {/* Long-form intro, only on page 1: these archives are the best
              matched URL for the category head term, and a one-line
              description above a grid is thin for a page meant to rank. */}
          {intro && currentPage === 1 && (
            <div className="mt-6 max-w-2xl">
              {intro.paragraphs.map((para) => (
                <p
                  key={para.slice(0, 40)}
                  className="text-base text-muted leading-relaxed mb-4"
                >
                  {para}
                </p>
              ))}
              {intro.highlights && intro.highlights.length > 0 && (
                <ul className="flex flex-col gap-2 text-sm text-text/80 mt-5">
                  {intro.highlights.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span
                        className="shrink-0 text-success font-bold text-xs mt-0.5"
                        aria-hidden
                      >
                        ✓
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Container>
      </section>

      {/* ── Post grid ──────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-14">
        <Container>
          {posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-xl font-semibold text-text mb-2">
                No posts yet
              </p>
              <p className="text-muted text-sm">
                Content for this category is coming soon.
              </p>
              <Link
                href="/blog"
                className="inline-block mt-6 text-sm font-medium text-primary hover:underline underline-offset-4"
              >
                ← Browse all posts
              </Link>
            </div>
          ) : (
            <>
              <p className="text-xs font-mono text-muted/60 uppercase tracking-wide mb-6">
                {total} {total === 1 ? "post" : "posts"}
                {totalPages > 1 && (
                  <>
                    <span className="mx-1.5 text-muted/40" aria-hidden>·</span>
                    Page {currentPage} of {totalPages}
                  </>
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block h-full focus-visible:outline-none"
                  >
                    <Card
                      className={cn(
                        "h-full flex flex-col overflow-hidden",
                        "transition duration-200",
                        "group-hover:shadow-md group-hover:-translate-y-0.5",
                        "group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2"
                      )}
                    >
                      {post.featured_image_url && (
                        <div className="relative -mt-6 -mx-6 mb-4 aspect-[16/9] overflow-hidden bg-primary/[0.05]">
                          <Image
                            src={post.featured_image_url}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <CardTitle
                        as="h2"
                        className="text-base leading-snug mb-2 line-clamp-3 group-hover:text-primary transition-colors"
                      >
                        {post.title}
                      </CardTitle>
                      {post.excerpt && (
                        <CardBody className="flex-1 line-clamp-3 text-sm">
                          {post.excerpt}
                        </CardBody>
                      )}
                      {post.audience_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {post.audience_tags.map((tag) => (
                            <Tag key={tag} variant="default" className="text-[10px]">
                              {tag.replace(/-/g, " ")}
                            </Tag>
                          ))}
                        </div>
                      )}
                      {post.published_at && (
                        <p className="mt-3 text-xs font-mono text-muted/60 uppercase tracking-wide">
                          {new Date(post.published_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination, keeps every post in the category crawlable */}
              {totalPages > 1 && (
                <div className="mt-10 pt-8 border-t border-black/[0.07] flex items-center justify-between">
                  {hasPrev ? (
                    <Link
                      href={`/category/${category.slug}?page=${currentPage - 1}`}
                      className="text-sm font-medium text-primary hover:underline underline-offset-4"
                    >
                      ← Previous
                    </Link>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs font-mono text-muted uppercase tracking-wide text-center">
                    Page {currentPage} of {totalPages}
                  </p>
                  {hasNext ? (
                    <Link
                      href={`/category/${category.slug}?page=${currentPage + 1}`}
                      className="text-sm font-medium text-primary hover:underline underline-offset-4"
                    >
                      Next →
                    </Link>
                  ) : (
                    <span />
                  )}
                </div>
              )}

              <div className="mt-12 pt-8 border-t border-black/[0.07]">
                <Link
                  href="/blog"
                  className="text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  ← Browse all posts
                </Link>
              </div>
            </>
          )}
        </Container>
      </section>
    </main>
  );
}
